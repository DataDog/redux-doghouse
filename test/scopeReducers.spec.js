import { scopeActionCreators, scopeReducers } from '../src';
import actionCreators from './helpers/actions';
import reducers, { reduceA, reduceB } from './helpers/reducers';

describe('scopeActionCreators', () => {
    let testScopes;
    let TEST_VALUE;
    beforeEach(() => {
        testScopes = ['x', 'y', 'z', 4];
        TEST_VALUE = Symbol('TEST_VALUE');
    });

    it('routes state changes only to scope-gated parts of the state', () => {
        testScopes.forEach(scope => {
            const initialState = testScopes.reduce((result, s) => ({
                ...result,
                [s]: reducers()
            }), {});
            const scopedActions = scopeActionCreators(actionCreators, scope);
            const reduce = scopeReducers({
                a: reduceA,
                b: reduceB
            });
            const firstResult = reduce(
                initialState, scopedActions.testActionB(TEST_VALUE)
            );
            const result = reduce(firstResult, scopedActions.testActionA());
            expect(result).toEqual({
                ...initialState,
                [scope]: {
                    a: 1,
                    b: TEST_VALUE
                }
            });
        });
    });
});
