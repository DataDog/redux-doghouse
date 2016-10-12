import { memoize } from './helpers/memoize';
import { mapValues, isNull, isUndefined, isFunction } from 'lodash';

import * as object from './helpers/object-shim';

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
            return mapValues(actionCreator, c => scopeActionDeep(c, id));
        default:
            return actionCreator;
    }
};
export const scopeActionCreators = memoize(
    // Wrap every actionCreator in a higher-order function that assigns an
    // additional scopeID param, allowing multiple instances of the same
    // component to distinguish their actions from one another
    (creators, id) => {
        if (isNull(id) || isUndefined(id)) return creators;
        if (isFunction(creators)) {
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
