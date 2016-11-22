import { memoize } from './utils/memoize';

import * as object from './utils/object-shim';

// Actions
// =======
const scopeAction = (actionCreator, id) => (...args) => ({
    // Pass the args into the action creator, and spread
    // all the props it returns
    ...actionCreator(...args),
    // Add the scope to a prop called scopeID
    scopeID: id
});
const scopeActionDeep = (actionCreator, id) => {
    switch (typeof actionCreator) {
        case 'function':
            return scopeAction(actionCreator, id);
        case 'object':
            return object.entries(actionCreator).reduce(
                (result, [key, c]) => ({
                    ...result,
                    [key]: scopeActionDeep(c, id)
                }), {});
        default:
            return actionCreator;
    }
};
export const scopeActionCreators = memoize(
    // Wrap every actionCreator in a higher-order function that assigns an
    // additional scopeID param, allowing multiple instances of the same
    // component to distinguish their actions from one another
    (creators, id) => {
        if (id === null || typeof id === 'undefined') return creators;
        if (typeof creators === 'function') {
            return scopeAction(creators, id);
        }
        return object.entries(creators).reduce(
            (result, [key, actionCreator]) => ({
                ...result,
                [key]: scopeActionDeep(actionCreator, id)
            })
        , { __scope__: id });
    }
);
