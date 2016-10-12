import { bindActionCreators } from 'redux';
import { ScopedActionFactory } from './ScopedActionFactory';
import { isFunction } from 'lodash';
import * as object from './helpers/object-shim';

// Actions
// =======
const bindScopedActionFactory = (creator, dispatch, bindFn) => {
    if (creator instanceof ScopedActionFactory) {
        // ScopedActionFactories shouldn't bind yet; they should return a
        // clone which will bind them once their scope() method is called
        const boundFactory = new ScopedActionFactory();
        boundFactory.scope = id => bindFn(creator.scope(id), dispatch);
        return boundFactory;
    } else if (isFunction(creator)) {
        return bindFn(creator, dispatch);
    }
};

export const bindScopedActionFactories = (
    creators, dispatch, bindFn = bindActionCreators
) => {
    const isCreator = c =>
        c instanceof ScopedActionFactory || isFunction(c);
    if (isCreator(creators)) {
        return bindScopedActionFactory(creators, dispatch, bindFn);
    }
    return object.entries(creators).reduce((result, [key, creator]) => {
        if (isCreator(creator)) {
            result[key] = bindScopedActionFactory(creator, dispatch, bindFn);
        }
        return result;
    });
};
