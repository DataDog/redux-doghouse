import { ScopedActionFactory, bindActionCreatorsDeep } from '../src';
import actionCreators from './helpers/actions';
import reducers from './helpers/reducers';
import { createStore } from 'redux';

describe('ScopedActionFactory', () => {
    let TEST_VALUE_1;
    let TEST_VALUE_2;
    let store;
    beforeEach(() => {
        store = createStore(reducers);
        TEST_VALUE_1 = Symbol('TEST_VALUE_1');
        TEST_VALUE_2 = Symbol('TEST_VALUE_2');
    });

    it('binds a mix of nested and un-nested action creators and factories', () => {
        const factory = new ScopedActionFactory(actionCreators);
        const factories = {
            a: actionCreators.testActionA,
            x: factory,
            y: {
                factory,
                actionCreators
            },
            z: {
                ...actionCreators,
                factory,
                actionCreators
            }
        };
        const boundActionCreators =
            bindActionCreatorsDeep(factories, store.dispatch);
        const scopedActionsX = boundActionCreators.x.scope('scope');
        const scopedActionsY = boundActionCreators.y.factory.scope('scope');
        const scopedActionsZ = boundActionCreators.z.factory.scope('scope');
        const actionA = boundActionCreators.a;
        const actionsY = boundActionCreators.y.actionCreators;
        const actionsZ = boundActionCreators.z;
        const nestedActionsZ = actionsZ.actionCreators;
        scopedActionsX.testActionA();
        scopedActionsY.testActionA();
        actionsZ.testActionA();
        actionA();
        scopedActionsZ.testActionA();
        actionsY.testActionA();
        nestedActionsZ.testActionA();
        scopedActionsX.testActionB(Symbol());
        scopedActionsY.testActionB(Symbol());
        scopedActionsZ.testActionB(TEST_VALUE_1);
        expect(store.getState()).toEqual({
            a: 7,
            b: TEST_VALUE_1
        });
        actionsZ.testActionB(TEST_VALUE_2);
        expect(store.getState()).toEqual({
            a: 7,
            b: TEST_VALUE_2
        });
        nestedActionsZ.testActionB(TEST_VALUE_1);
        expect(store.getState()).toEqual({
            a: 7,
            b: TEST_VALUE_1
        });
    });

    it('skips non-function or non-object values in the object', () => {
        const testCase = {
            ...actionCreators,
            foo: 42,
            bar: 'baz',
            wow: undefined,
            test: null
        };
        const bound = bindActionCreatorsDeep(testCase, store.dispatch);
        expect(
            Object.keys(bound)
        ).toEqual(
            Object.keys(actionCreators)
        );
    });

    it('throws on a null or undefined actionFactories', () => {
        expect(() => {
            bindActionCreatorsDeep(null, store.dispatch);
        }).toThrow(
            'bindActionCreatorsDeep expected an object or a function ' +
            'instead of null'
        );
        expect(() => {
            bindActionCreatorsDeep(undefined, store.dispatch);
        }).toThrow(
            'bindActionCreatorsDeep expected an object or a function ' +
            'instead of undefined'
        );
    });
});
