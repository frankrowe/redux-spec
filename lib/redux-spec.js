'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.specErrors = exports.generate = exports.createValidator = exports.combineSpecs = exports.SPEC_ADD_ERROR = undefined;

var _jsonschema = require('jsonschema');

var _jsonSchemaFaker = require('json-schema-faker');

var _jsonSchemaFaker2 = _interopRequireDefault(_jsonSchemaFaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SPEC_ADD_ERROR = exports.SPEC_ADD_ERROR = 'redux-spec/SPEC_ADD_ERROR';

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
var combineSpecs = exports.combineSpecs = function combineSpecs(specs, definitions) {
  var schema = {
    id: 'redux-spec',
    type: 'object',
    properties: {},
    required: [],
    definitions: {}
  };

  Object.keys(specs).forEach(function (specName) {
    var spec = specs[specName];
    schema.properties[spec.id] = spec;
    schema.required.push(spec.id);
  });

  Object.keys(definitions).forEach(function (specName) {
    var spec = definitions[specName];
    schema.definitions[spec.id] = spec;
  });
  return schema;
};

/**
 * Create a json-schema validator that used as middleware in a redux store
 * @param {object} spec the json-schema spec to validate
 * @returns {function} a middleware function to be passed to applyMiddleware
 */
var createValidator = exports.createValidator = function createValidator(spec) {
  var v = new _jsonschema.Validator();
  Object.keys(spec).forEach(function (specName) {
    var s = spec[specName];
    v.addSchema(s, '/' + s.id);
  });
  Object.keys(spec.definitions).forEach(function (specName) {
    var def = spec.definitions[specName];
    v.addSchema(def, '/' + def.id);
  });
  var validator = function validator(store) {
    return function (next) {
      return function (action) {
        var result = next(action);
        var validationResult = v.validate(store.getState(), spec);
        next({
          type: SPEC_ADD_ERROR,
          errors: validationResult.errors
        });
        return result;
      };
    };
  };
  return validator;
};

/**
 * Generates sample data from json-schema spec
 * @param {object} spec the json-schema spec to validate
 * @returns {} a value matching the spec
 */
var generate = exports.generate = function generate(spec) {
  return (0, _jsonSchemaFaker2.default)(spec);
};

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
var specErrors = exports.specErrors = function specErrors() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case SPEC_ADD_ERROR:
      return action.errors;
    default:
      return state;
  }
};
