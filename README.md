# redux-spec

redux-spec is a library to validate a redux store against a json schema, and to generate sample data for testing purposes.

## Installation

`npm install redux-spec`

## Example

```JavaScript
// specs.js
const todoSpec = {
  id: 'todo',
  type: 'object',
  properties: {
    id: {
      $ref: 'positiveInt'
    },
    text: {
      type: 'string',
      minLength: 1,
    },
    completed: {
      type: 'boolean',
    }
  },
  required: ['id', 'text', 'completed']
};

const todosSpec = {
  id: 'todos',
  type: 'array',
  items: { $ref: 'todo'}
};

const positiveInt = {
  id: 'positiveInt',
  type: 'integer',
  minimum: 0,
  exclusiveMinimum: false,
};
```

```javascript
// index.js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { specErrors, combineSpecs, createValidator } from 'redux-spec';

const todoApp = combineReducers({
  todos,
  visibilityFilter,
  specErrors,
});

const storeSpec = combineSpecs(
  { todosSpec },
  { todoSpec, positiveInt },
);

const validator = createValidator(storeSpec);

const store = createStore(todoApp,
  applyMiddleware(validator)
);
```
# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## combineSpecs

Combine specs into a single spec.

**Parameters**

-   `specs` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the top level specs that are required by the redux store
-   `definitions` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the reference specs used by top level specs

**Examples**

```javascript
const storeSpec = combineSpecs(
  { todosSpec },
  { todoSpec, positiveInteger },
);
```

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a full json-schema specification

## createValidator

Create a json-schema validator that used as middleware in a redux store

**Parameters**

-   `spec` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the json-schema spec to validate

Returns **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a middleware function to be passed to applyMiddleware

## generate

Generates sample data from json-schema spec

**Parameters**

-   `spec` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the json-schema spec to validate

## specErrors

The reducer used to store validation errors in the redux store;

**Parameters**

-   `state` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)?= \[]** the current state
-   `action` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the action
    -   `action.type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the action type
-   `errors` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the list of validation errors

**Examples**

```javascript
const todoApp = combineReducers({
  todos,
  specErrors,
});
```

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the new state
