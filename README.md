# reducer-pipe [![npm package][npm-badge]][npm] [![Travis][build-badge]][build] [![Coveralls][coverage-badge]][coverage]

[build-badge]: https://img.shields.io/travis/bydooweedoo/reducer-pipe/master.svg?style=flat-square
[build]: https://travis-ci.org/bydooweedoo/reducer-pipe

[coverage-badge]: https://img.shields.io/codecov/c/github/bydooweedoo/reducer-pipe.svg?style=flat-square
[coverage]: https://codecov.io/github/bydooweedoo/reducer-pipe

[npm-badge]: https://img.shields.io/npm/v/reducer-pipe.svg?style=flat-square
[npm]: https://www.npmjs.org/package/reducer-pipe

`reducer-pipe` helps you to pipe `redux` reducers with given state and action, passing previously returned state to next reducer, then keep last updated state.

## Getting started

Install `reducer-pipe` using [npm](https://www.npmjs.org/):

```shell
npm install reducer-pipe --save
```

Then using ES6

```js
import { increment, decrement } from './my-reducers';
import reducerPipe from 'reducer-pipe';

export default reducerPipe([
  increment,
  decrement,
]);
```

Using ES5

```js
var myReducers = require('./my-reducers');
var reducerPipe = require('reducer-pipe');

module.exports = reducerPipe([
  myReducers.increment,
  myReducers.decrement,
]);
```

## Usage

You can rewrite this:
```js
const reducer = (state, action) => {
  if (!state) state = initialState;
  switch (action.type) {
    case 'ADD':
    case 'INCREMENT':
      return incrementReducer(state, action);
    case 'SUBTRACT':
    case 'DECREMENT':
      return decrementReducer(state, action);
    default:
      return state;
  }
};

reducer({counter: 0}, {type: 'INCREMENT'}); //=> {counter: 1}
```

To this:
```js
import reducerPipe from 'reducer-pipe';

const reducer = reducerPipe([
  (state/*, action*/) => (state ? state : initialState),
  incrementReducer,
  decrementReducer,
]);

reducer({counter: 0}, {type: 'INCREMENT'}); //=> {counter: 1}
```

> _See also_ `reducer-chain` in order to chain given reducers with same given state and action.

## Examples

* [counter](./examples/counter)

## Explanation

Take this code:
```js
const reducer = reducerPipe([
  initial, // returns initial state if given state is null, else returns given state
  increment, // increments counter in state copy if action is INCREMENT, else returns given state
  decrement, // decrements counter in state copy if action is DECREMENT, else returns given state
]);
```

When we call:
```js
reducer(null, {type: 'INCREMENT'}); // default compare set to `reducerPipe.compare.withInitial`
```

It will execute:
```js
// We pass given state and action to our first reducer in list, which is `initial`
initial(null, {type: 'INCREMENT'}) //=> returns initial state {counter: 0}
compare(null, {counter: 0}) //=> Previous state is null, returns {counter: 0}

// now we will pass previously returned state by compare
increment({counter: 0}, {type: 'INCREMENT'}) //=> Increment counter by 1, returns {counter: 1}
compare({counter: 0}, {counter: 1}) //=> Current state differs from previous, returns {counter: 1}

// now we will pass previously returned state by compare
decrement({counter: 1}, {type: 'INCREMENT'}) //=> Nothing happens, returns given state {counter: 1}
compare({counter: 1}, {counter: 1}) //=> Both state are the same object, returns {counter: 1}
```

Pipe:
```js
reducer(state, action) => updatedState
  initial(state, action) => newState
    compare(state, newState) => newState
  increment(newState, action) => updatedState
    compare(newState, updatedState) => updatedState
  decrement(updatedState, action) => updatedState
    compare(updatedState, updatedState) => updatedState
```

Chain:
```js
reducer(state, action) => updatedState
  initial(state, action) => newState
  increment(state, action) => updatedState
  decrement(state, action) => state
  compare(state, newState) => newState
  compare(newState, updatedState) => updatedState
  compare(updatedState, state) => updatedState
```

## Compare signature

```js
initialize(initialState) => iterator(previousState, currentState) => nextState
```

* `initialState` is corresponding to the state passed to the high order reducer.
* `previousState` is corresponding to the previously returned state. Defaults to `initialState`.
* `currentState` is corresponding to the state returned by the reducer at the current index in the list.
* `nextState` is corresponding to the state you want to keep.
* `initialize` will be called everytime once with the given state from the high order reducer.
It must returns an iterator function for comparing previous and current state, and return the prefered one.
* `iterator` will be called on each reducer result (passed as `currentState`). It must compare with `previousState` (defaults to `initialState`) and
return the state you want to keep next.

_Note_: Please note that `initiaze` is called before calling any reducer.
Then reducer are called one by one in given order, and `iterator` is called after each `reducer`.

## Available compare functions

`reducer-pipe` built in with 4 different compare functions available under `reducerPipe.compare`:

| Name | Signature | Equals |
| ---- | --------- | ------ |
| `withInitial` (default) | `(initialState) => (previousState, currentState) => nextState` | `R.equals(initialState, currentState)` |
| `withInitialCustomEquals` | `(customEquals) => (initialState) => (previousState, currentState) => nextState` | `customEquals(initialState, currentState)` |
| `withPrevious` | `(initialState) => (previousState, currentState) => nextState` | `R.equals(previousState, currentState)` |
| `withPreviousCustomEquals` | `(customEquals) => (initialState) => (previousState, currentState) => nextState` | `customEquals(previousState, currentState)` |

## Compare usage

With `immutable`:
```js
// ./immutableReducerPipe.js
import Immutable from 'immutable';
import reducerPipe from 'reducer-pipe';

export default reducerPipe(
  reducerPipe.compare.withPreviousCustomEquals(Immutable.is)
);
```
```js
// ./index.js
import Immutable from 'immutable';
import { reducer1, reducer2 } from './reducers';
import immutableReducerPipe from './immutableReducerPipe';

const initialState = Immutable.Map({counter: 0});

export default immutableReducerPipe([
  (state/*, action*/) => (state ? state : initialState),
  reducer1,
  reducer2,
]);
```

With custom compare:
```js
import reducerPipe from 'reducer-pipe';
import {reducer1, reducer2} from './reducers';

const customCompare = initialState => (previousState, currentState) => (
  currentState !== null &&
  currentState !== initialState ?
  currentState : previousState
);

const initialState = Object.freeze({counter: 0});

export default reducerPipe(customCompare, [
  (state/*, action*/) => (state ? state : initialState),
  reducer1,
  reducer2,
]);
```

## Links

* `renum` is a small library to create enum using frozen objects in javascript from multiple sources.
* `reducer-chain` helps you to chain `redux` reducers with given state and action, then keep last updated state.
* `reducer-sandbox` helps you to reuse your reducers in different place without conflict them.
