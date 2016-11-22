import { combineReducers } from 'redux';
import { TEST_ACTION_A, TEST_ACTION_B } from './actions';

export default combineReducers({
    a: (state = 0, action = {}) => {
        switch (action.type) {
            case TEST_ACTION_A:
                return state + 1;
            default:
                return state;
        }
    },
    b: (state = null, action = {}) => {
        switch (action.type) {
            case TEST_ACTION_B:
                return action.value;
            default:
                return state;
        }
    }
});
