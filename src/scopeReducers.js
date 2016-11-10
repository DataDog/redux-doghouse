import { combineReducers } from 'redux';
import { memoize } from './helpers/memoize';

import * as object from './helpers/object-shim';

// Reducers
// ========

// Return a set of reducers that will only update if they receive an action
// with a matching scopeID, or a redux initialization action
const _scopeReducers = memoize((reducers, id) => {
    const reduce = combineReducers(reducers);
    return (state, action) => {
        const matchesID = action.scopeID && action.scopeID === id;
        const isInitAction = action.type && typeof action.type === 'string' &&
                             action.type.slice(0, 8) === '@@redux/';
        if (matchesID || isInitAction) {
            return reduce(state, action);
        }
        return state;
    };
});

// Take an object of scoped states, and return a function that will iterate
// through each state and apply a scoped reducer to it
export const scopeReducers = memoize(
    (reducers) => (states, action) => (
        object.entries(states).reduce((result, [scope, state]) => ({
            ...result,
            [scope]: _scopeReducers(reducers, scope)(state, action)
        }), {})
    )
);
