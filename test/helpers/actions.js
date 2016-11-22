export const TEST_ACTION_A = Symbol('TEST_ACTION_A');
export const TEST_ACTION_B = Symbol('TEST_ACTION_B');

export default {
    testActionA: () => ({ type: TEST_ACTION_A }),
    testActionB: (value) => ({ type: TEST_ACTION_B, value })
};
