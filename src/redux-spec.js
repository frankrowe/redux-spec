import { Validator } from 'jsonschema';
import jsf from 'json-schema-faker';

export const SPEC_ADD_ERROR = 'redux-spec/SPEC_ADD_ERROR';

/**
 * Combine specs into a single spec.
 * @param {object} specs the top level specs that are required by the redux store
 * @param {object} definitions the reference specs used by top level specs
 * @returns {object} a full json-schema specification
 * @example
 * const storeSpec = combineSpecs(
 *   { todosSpec },
 *   { todoSpec, positiveInteger },
 * );
 */
export const combineSpecs = (specs, definitions) => {
  const schema = {
    id: 'redux-spec',
    type: 'object',
    properties: {},
    required: [],
    definitions: {},
  };

  Object.keys(specs).forEach(specName => {
    const spec = specs[specName];
    schema.properties[spec.id] = spec;
    schema.required.push(spec.id);
  });

  Object.keys(definitions).forEach(specName => {
    const spec = definitions[specName];
    schema.definitions[spec.id] = spec;
  });
  return schema;
}

/**
 * Create a json-schema validator that used as middleware in a redux store
 * @param {object} spec the json-schema spec to validate
 * @returns {function} a middleware function to be passed to applyMiddleware
 */
export const createValidator = (spec) => {
  const v = new Validator();
  Object.keys(spec).forEach(specName => {
    const s = spec[specName];
    v.addSchema(s, '/' + s.id);
  });
  Object.keys(spec.definitions).forEach(specName => {
    const def = spec.definitions[specName];
    v.addSchema(def, '/' + def.id);
  });
  const validator = store => next => action => {
    let result = next(action);
    let validationResult = v.validate(store.getState(), spec);
    next({
      type: SPEC_ADD_ERROR,
      errors: validationResult.errors,
    });
    return result;
  }
  return validator;
}

/**
 * Generates sample data from json-schema spec
 * @param {object} spec the json-schema spec to validate
 * @returns {} a value matching the spec
 */
export const generate = (spec) => {
  return jsf(spec);
}

/**
 * The reducer used to store validation errors in the redux store;
 * @param {array} state the current state
 * @param {object} action the action
 * @param {string} action.type the action type
 * @param {array} errors the list of validation errors
 * @returns {object} the new state
 * @example
 * const todoApp = combineReducers({
 *   todos,
 *   specErrors,
 * });
 */
export const specErrors = (state = [], action) => {
  switch (action.type) {
    case SPEC_ADD_ERROR:
      return action.errors;
    default:
      return state;
  }
};
