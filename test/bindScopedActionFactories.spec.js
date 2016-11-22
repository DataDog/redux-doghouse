import * as object from '../src/utils/object-shim';
import { ScopedActionFactory, bindScopedActionFactories } from '../src';
import actionCreators from './helpers/actions';
import reducers from './helpers/reducers';
import { createStore } from 'redux';

describe('ScopedActionFactory', () => {
    let TEST_VALUE;
    let store;
    beforeEach(() => {
        store = createStore(reducers);
        TEST_VALUE = Symbol('TEST_VALUE');
    });

    it('wraps the factories\' resulting action creators with the dispatch ' +
       'function', () => {
        const factory = new ScopedActionFactory(actionCreators);
        const boundFactory = bindScopedActionFactories(factory, store.dispatch);
        const scopedActions = boundFactory.scope('a');
        scopedActions.testActionA();
        scopedActions.testActionA();
        scopedActions.testActionA();
        scopedActions.testActionB(TEST_VALUE);
        expect(store.getState()).toEqual({
            a: 3,
            b: TEST_VALUE
        });
    });
    it('supports binding an object of scopedActionFactories', () => {
        const factory = new ScopedActionFactory(actionCreators);
        const factories = {
            x: factory,
            y: factory,
        };
        const boundFactories =
            bindScopedActionFactories(factories, store.dispatch);
        const scopedActionsX = boundFactories.x.scope('scope');
        const scopedActionsY = boundFactories.y.scope('scope');
        scopedActionsX.testActionA();
        scopedActionsY.testActionA();
        scopedActionsX.testActionB(Symbol());
        scopedActionsY.testActionB(TEST_VALUE);
        expect(store.getState()).toEqual({
            a: 2,
            b: TEST_VALUE
        });
    });
    it('binds nested objects deeply', () => {
        const factory = new ScopedActionFactory(actionCreators);
        const factories = {
            x: factory,
            y: { actions: factory },
        };
        const boundFactories =
            bindScopedActionFactories(factories, store.dispatch);
        const scopedActionsX = boundFactories.x.scope('scope');
        const scopedActionsY = boundFactories.y.actions.scope('scope');
        scopedActionsX.testActionA();
        scopedActionsY.testActionA();
        scopedActionsY.testActionA();
        scopedActionsX.testActionB(Symbol());
        scopedActionsY.testActionB(TEST_VALUE);
        expect(store.getState()).toEqual({
            a: 3,
            b: TEST_VALUE
        });
    });

    it('binds non-factory functions', () => {
        const factory = new ScopedActionFactory(actionCreators);
        const factories = {
            a: actionCreators.testActionA,
            x: factory,
            y: factory,
            z: actionCreators
        };
        const boundFactories =
            bindScopedActionFactories(factories, store.dispatch);
        const scopedActionsX = boundFactories.x.scope('scope');
        const scopedActionsY = boundFactories.y.scope('scope');
        const actionsZ = boundFactories.z;
        const actionA = boundFactories.a;
        scopedActionsX.testActionA();
        scopedActionsY.testActionA();
        actionsZ.testActionA();
        actionA();
        scopedActionsX.testActionB(Symbol());
        scopedActionsY.testActionB(Symbol());
        actionsZ.testActionB(TEST_VALUE);
        expect(store.getState()).toEqual({
            a: 4,
            b: TEST_VALUE
        });
    });

    it('can use an alternative binding function', () => {
        const actionBatch = new Map();
        const subscribeActionTo = (creator, dispatch) => (...args) => {
            const result = creator(...args);
            if (actionBatch.has(dispatch)) {
                actionBatch.get(dispatch).add(result);
            } else {
                actionBatch.set(dispatch, new Set([result]));
            }
        };
        const subscribeActionsTo = (creators, dispatch) =>
            object.entries(creators).reduce((result, [key, val]) => ({
                ...result,
                [key]: subscribeActionTo(val, dispatch)
            }), {});
        const releaseAllActions = () => actionBatch.forEach((actions, disp) => {
            actions.forEach((action) => disp(action));
            actions.clear();
        });
        const factory = new ScopedActionFactory(actionCreators);
        const boundFactory =
            bindScopedActionFactories(factory, store.dispatch, subscribeActionsTo);
        const scopedActions = boundFactory.scope('a');
        scopedActions.testActionA();
        scopedActions.testActionA();
        scopedActions.testActionA();
        scopedActions.testActionB(TEST_VALUE);
        expect(store.getState()).toEqual({
            a: 0,
            b: null
        });
        releaseAllActions();
        expect(store.getState()).toEqual({
            a: 3,
            b: TEST_VALUE
        });
    });

    it('throws on a null or undefined actionFactories', () => {
        expect(() => {
            bindScopedActionFactories(null, store.dispatch);
        }).toThrow(
            'bindScopedActionFactories expected an object or a function ' +
            'instead of null'
        );
        expect(() => {
            bindScopedActionFactories(undefined, store.dispatch);
        }).toThrow(
            'bindScopedActionFactories expected an object or a function ' +
            'instead of undefined'
        );
        expect(() => {
            bindScopedActionFactories({ foo: null }, store.dispatch);
        }).toThrow(
            'bindScopedActionFactories expected an object or a function ' +
            'instead of null'
        );
    });
});
