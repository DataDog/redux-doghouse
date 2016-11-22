import { bindActionCreators } from 'redux';
import { bindScopedActionFactories } from './bindScopedActionFactories';
import { ScopedActionFactory } from './ScopedActionFactory';

import * as object from './utils/object-shim';

// Recursively bind a tree of action creators
const bindActionsDeep = (creators, dispatch) => {
    if (typeof creators === 'function') {
        return bindActionCreators(creators, dispatch);
    } else if (!creators || typeof creators !== 'object') {
        throw new Error(
            'bindActionCreatorsDeep expected an object or a function instead ' +
            `of ${creators}`
        );
    }
    // Transform each creator into an action creator bound to the dispatch
    return object.entries(creators).reduce((result, [key, creator]) => {
        const creatorIsFunction = typeof creator === 'function';
        const creatorIsObject = typeof creator === 'object' && creator;
        if (creator instanceof ScopedActionFactory || creatorIsFunction) {
            result[key] =
                bindScopedActionFactories(creator, dispatch, bindActionsDeep);
        } else if (creatorIsObject) {
            // If an action creator is another object, recursively bind
            // whatever's inside it
            result[key] = bindActionsDeep(creator, dispatch);
        }
        return result;
    }, {});
};
export const bindActionCreatorsDeep = (actionCreators, dispatch) =>
    bindActionsDeep(actionCreators, dispatch);
