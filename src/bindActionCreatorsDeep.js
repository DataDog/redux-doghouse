import { bindActionCreators } from 'redux';
import { bindScopedActionFactories } from './bindScopedActionFactories';
import { ScopedActionFactory } from './ScopedActionFactory';
import { isFunction, isObject } from 'lodash';

import * as object from './helpers/object-shim';

// Recursively bind a tree of action creators
const bindActionsDeep = (creators, dispatch) => {
    if (isFunction(creators)) {
        return bindActionCreators(creators, dispatch);
    }
    // Transform each creator into an action creator bound to the dispatch
    return object.entries(creators).reduce((result, [key, creator]) => {
        if (creator instanceof ScopedActionFactory || isFunction(creator)) {
            result[key] =
                bindScopedActionFactories(creator, dispatch, bindActionsDeep);
        } else if (isObject(creator)) {
            // If an action creator is another object, recursively bind
            // whatever's inside it
            result[key] = bindActionsDeep(creator, dispatch);
        }
        return result;
    }, {});
};
export const bindActionCreatorsDeep = (actionCreators, dispatch) =>
    bindActionsDeep(actionCreators, dispatch);
