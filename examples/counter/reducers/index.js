import reducerPipe from 'reducer-pipe';
import initialState from '../states/initial';
import incrementReducer from './increment';
import decrementReducer from './decrement';

export default reducerPipe([
  state => (state ? state : initialState),
  incrementReducer,
  decrementReducer,
]);
