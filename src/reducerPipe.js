import R from 'ramda';
import {
    reducer as utilsReducer,
    iteratee as utilsIteratee,
    compare as utilsCompare,
} from 'reducer-utils';

/**
 * Calls each given reducers in order with previously returned state and action.
 *
 *      // custom compare
 *      const compare = initialState => (previousState, currentState) => (
 *          currentState === null ? previousState : currentState
 *      );
 *      // states
 *      const initialState = {updated: false};
 *      const updatedState = {updated: true};
 *      const lastUpdatedState = {updated: true, last: true};
 *      // reducers
 *      const nullReducer = (state, action) => null;
 *      const updateReducer = (state, action) => updatedState;
 *      const lastUpdateReducer = (state, action) => lastUpdatedState;
 *      // reducers pipe
 *      const reducers1 = pipe(compare, [nullReducer, updateReducer, lastUpdateReducer]);
 *      const reducers2 = pipe(compare, [nullReducer, updateReducer]);
 *      const reducers3 = pipe(compare, [nullReducer]);
 *      const reducers4 = pipe(compare, []);
 *      const reducers5 = pipe(compare, [lastUpdateReducer, updateReducer]);
 *      // action
 *      const action = {type: 'ACTION_NAME'};
 *
 *      reducers1(initialState, action); //=> lastUpdatedState
 *      reducers2(initialState, action); //=> updatedState
 *      reducers3(initialState, action); //=> initialState
 *      reducers4(initialState, action); //=> initialState
 *      reducers5(initialState, action); //=> updateReducer, order masters
 */
const pipe = (iteratee, reducers) => (state, action) => {
    const compare = iteratee(state);

    return R.reduce((savedState, reducer) => compare(
        savedState, reducer(savedState, action)
    ), state, reducers);
};

const safePipe = R.converge(pipe, [
    R.pipe(R.nthArg(0), utilsIteratee.getIterateeOrUseDefault),
    R.pipe(R.nthArg(1), utilsReducer.getReducers),
]);

const safePipeCurried = R.curryN(2, safePipe);

const withSingleArg = R.cond([
    [utilsIteratee.isIteratee, safePipeCurried],
    [utilsReducer.areReducers, safePipeCurried(null)],
    [R.T, safePipe],
]);

const curriedPipe = R.unapply(
    R.cond([
        [R.pipe(R.length, R.equals(1)), R.pipe(R.head, withSingleArg)],
        [R.T, R.apply(safePipe)],
    ])
);

curriedPipe.compare = utilsCompare;

export default curriedPipe;
