import { memoize } from './utils/memoize';

import * as object from './utils/object-shim';

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
            if (!actionCreator) {
                throw new Error('Cannot scope null');
            }
            return object.entries(actionCreator).reduce(
                (result, [key, c]) => ({
                    ...result,
                    [key]: scopeActionDeep(c, id)
                }), {});
        default:
            throw new Error('Can only scope a function or object');
    }
};
export const scopeActionCreators = memoize(
    // Wrap every actionCreator in a higher-order function that assigns an
    // additional scopeID param, allowing multiple instances of the same
    // component to distinguish their actions from one another
    (creators, id) => {
        if (id === null || typeof id === 'undefined') {
            throw new Error(
                `scopeActionCreators cannot scope for an id of ${id}`
            );
        }
        if (typeof creators === 'function') {
            return scopeAction(creators, id);
        }
        return object.entries(creators).reduce(
            (result, [key, actionCreator]) => {
                try {
                    return {
                        ...result,
                        [key]: scopeActionDeep(actionCreator, id)
                    };
                } catch (e) {
                    return result;
                }
            }
        , { __scope__: id });
    }
);
