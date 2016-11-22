import * as object from '../src/utils/object-shim';
import { scopeActionCreators } from '../src';
import actionCreators from './helpers/actions';

const { testActionA, testActionB } = actionCreators;

describe('scopeActionCreators', () => {
    let testScopes;
    let TEST_VALUE;
    let unscopedActionA;
    let unscopedActionB;
    beforeEach(() => {
        testScopes = ['x', 4, Symbol('Test Scope'), { 'foo': 'bar' }];
        TEST_VALUE = Symbol('TEST_VALUE');
        unscopedActionA = testActionA();
        unscopedActionB = testActionB(TEST_VALUE);
    });


    it('adds a scopeID to the result of an action creator', () => {
        testScopes.forEach(scope => {
            const scopedCreatorA = scopeActionCreators(testActionA, scope);
            const scopedCreatorB = scopeActionCreators(testActionB, scope);

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
        testScopes.forEach(scope => {
            const scopedCreators = scopeActionCreators(actionCreators, scope);

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

    it('throws on a null or undefined ID', () => {
        const testCases = [testActionA, actionCreators];
        testCases.forEach(testCase => {
            expect(() => {
                scopeActionCreators(testCase, null);
            }).toThrow(
                'scopeActionCreators cannot scope for an id of null'
            );
            expect(() => {
                scopeActionCreators(testCase, undefined);
            }).toThrow(
                'scopeActionCreators cannot scope for an id of undefined'
            );
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
        testScopes.forEach(scope => {
            const scopedCreators = scopeActionCreators(testCase, scope);
            expect(
                Object.keys(scopedCreators).sort()
            ).toEqual(
                Object.keys(actionCreators).concat('__scope__').sort()
            );
        });
    });

    it('scopes deeply for nested actionCreators', () => {
        const testCase = {
            ...actionCreators,
            nested: actionCreators
        };
        testScopes.forEach(scope => {
            function testCreator(creator, key, unscopedCreators) {
                const unscopedAction = unscopedCreators[key](TEST_VALUE);
                const scopedAction = creator(TEST_VALUE);
                expect(scopedAction).toEqual({
                    ...unscopedAction,
                    scopeID: scope
                });
            }
            const scopedTestCase = scopeActionCreators(testCase, scope);
            object.entries(scopedTestCase).forEach(([key, creator]) => {
                if (key === '__scope__') {
                    return;
                }
                if (typeof creator === 'function') {
                    testCreator(creator, key, testCase);
                } else if (typeof creator === 'object') {
                    object.entries(creator).forEach(([key, nestedCreator]) => {
                        testCreator(nestedCreator, key, creator);
                    });
                }
            });
        });
    });
});
