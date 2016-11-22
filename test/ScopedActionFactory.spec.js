import * as object from '../src/utils/object-shim';
import { ScopedActionFactory } from '../src';
import actionCreators from './helpers/actions';

const { testActionA, testActionB } = actionCreators;

describe('ScopedActionFactory', () => {
    let testScopes;
    let TEST_VALUE;
    let unscopedActionA;
    let unscopedActionB;
    beforeEach(() => {
        testScopes = ['x', 'y', 'z', 4];
        TEST_VALUE = Symbol('TEST_VALUE');
        unscopedActionA = testActionA();
        unscopedActionB = testActionB(TEST_VALUE);
    });

    it('reports as an instanceof ScopedActionFactory', () => {
        const factory = new ScopedActionFactory(actionCreators);
        expect(factory instanceof ScopedActionFactory).toBeTruthy();
    });

    it('adds a scopeID to the result of an action creator', () => {
        const scopedFactoryA = new ScopedActionFactory(testActionA);
        const scopedFactoryB = new ScopedActionFactory(testActionB);
        testScopes.forEach(scope => {
            const scopedCreatorA = scopedFactoryA.scope(scope);
            const scopedCreatorB = scopedFactoryB.scope(scope);

            const scopedActionA = scopedCreatorA();
            const scopedActionB = scopedCreatorB(TEST_VALUE);

            expect(scopedActionA).toEqual({
                ...unscopedActionA,
                scopeID: scope
            });
            expect(scopedActionB).toEqual({
                ...unscopedActionB,
                scopeID: scope
            });
        });
    });

    it('adds a scopeID to the result of an object of action creators', () => {
        const scopedFactory = new ScopedActionFactory(actionCreators);
        testScopes.forEach(scope => {
            const scopedCreators = scopedFactory.scope(scope);

            object.entries(scopedCreators).forEach(([key, creator]) => {
                if (key === '__scope__') {
                    return;
                }
                const unscopedAction = actionCreators[key](TEST_VALUE);
                const scopedAction = creator(TEST_VALUE);
                expect(scopedAction).toEqual({
                    ...unscopedAction,
                    scopeID: scope
                });
            });
        });
    });
});
