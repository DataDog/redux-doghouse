import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import React from 'react';
import { scopeReducers, ScopedActionFactory, bindActionCreatorsDeep }
    from 'redux-doghouse';
import { mapValues, omit } from 'lodash';
import './App.css';

import {
    reducers as counterReducers,
    actionCreators as counterActionCreators,
    View as CounterView
} from './Counter';


// Actions
// =======
const INCREMENT_ALL = Symbol('App/INCREMENT_ALL');
const INCREMENT_EVEN = Symbol('App/INCREMENT_EVEN');
const INCREMENT_ODD = Symbol('App/INCREMENT_ODD');
const DECREMENT_ALL = Symbol('App/DECREMENT_ALL');
const DECREMENT_EVEN = Symbol('App/DECREMENT_EVEN');
const DECREMENT_ODD = Symbol('App/DECREMENT_ODD');

const ADD_COUNTER = Symbol('App/ADD_COUNTER');
const DELETE_COUNTER = Symbol('App/DELETE_COUNTER');

const actionCreators = {
    counterActions: new ScopedActionFactory(counterActionCreators),
    incrementAll: () => ({ type: INCREMENT_ALL }),
    decrementAll: () => ({ type: DECREMENT_ALL }),
    addCounter: () => ({ type: ADD_COUNTER }),
    deleteCounter: () => ({ type: DELETE_COUNTER }),
    incrementEven: () => ({ type: INCREMENT_EVEN }),
    decrementEven: () => ({ type: DECREMENT_EVEN }),
    incrementOdd: () => ({ type: INCREMENT_ODD }),
    decrementOdd: () => ({ type: DECREMENT_ODD })
};

// Reducers
// ========

// Build counterReducers in both scoped and unscoped form
// Unscoped is for acting on all of them; scoped is for routing
// indiviudal Counter actions to the Counter that dispatched them
const scopedCounterReducers = scopeReducers(counterReducers);
const unscopedCounterReducers = combineReducers(counterReducers);
const reducers = {
    counterStates: (state = { 0: {}, 1: {} }, action) => {
        const incrementAction = counterActionCreators.increment();
        const decrementAction = counterActionCreators.decrement();
        // Reduce for all the actions that can affect counters globally
        // By default, pass the action to the scopedCounterReducers, which
        // will handle updating a single counter in response to a scoped action
        switch (action.type) {
            case INCREMENT_ALL:
                return mapValues(
                    state, s => unscopedCounterReducers(s, incrementAction)
                );
            case DECREMENT_ALL:
                return mapValues(
                    state, s => unscopedCounterReducers(s, decrementAction)
                );
            case INCREMENT_EVEN:
            case DECREMENT_EVEN:
            case INCREMENT_ODD:
            case DECREMENT_ODD: {
                const incrementTypes = [INCREMENT_EVEN, INCREMENT_ODD];
                const evenTypes = [INCREMENT_EVEN, DECREMENT_EVEN];
                const doAction =
                      incrementTypes.includes(action.type) ? incrementAction
                    : decrementAction;
                const check =
                      evenTypes.includes(action.type) ? s => s.amount % 2 === 0
                    : s => s.amount % 2 === 1;
                return mapValues(state, s => {
                    if (check(s)) {
                        return unscopedCounterReducers(s, doAction);
                    } else {
                        return s;
                    }
                });
            }
            case ADD_COUNTER: {
                const nextID =
                    Object.keys(state).reduce((a, b) => Math.max(a, b)) + 1;
                return {
                    ...state,
                    [nextID]: unscopedCounterReducers()
                };
            }
            case DELETE_COUNTER: {
                const removeID = Object.keys(state).filter(
                    (_, i, arr) => i === arr.length - 1
                );
                return omit(state, removeID);
            }
            default:
                return scopedCounterReducers(state, action);
        }
    }
};

const AppView = ({ actions, counterStates }) => {
    const { counterActions } = actions;
    const counters =
        Object.entries(counterStates).map(([id, state]) => {
            const props = {
                ...state,
                key: id,
                actions: counterActions.scope(id)
            };
            return <CounterView {...props}/>;
        });
    return (
        <div className='App'>
            <div className='App-controls'>
                <button onClick={actions.incrementAll}>+ All</button>
                <button onClick={actions.decrementAll}>- All</button>

                <button onClick={actions.incrementEven}>+ Even</button>
                <button onClick={actions.decrementEven}>- Even</button>

                <button onClick={actions.incrementOdd}>+ Odd</button>
                <button onClick={actions.decrementOdd}>- Odd</button>

                <button onClick={actions.addCounter}>Add Counter</button>
                <button onClick={actions.deleteCounter}>Remove Counter</button>
            </div>
            <div className='App-counters'>
                {counters}
            </div>
        </div>
    );
};

class App extends React.Component {
    constructor(props) {
        super(props);
        const combinedReducers = combineReducers(reducers);
        const store = createStore(combinedReducers);
        const connectToStore =
            connect(
                combinedReducers,
                dispatch => ({
                    actions: bindActionCreatorsDeep(actionCreators, dispatch)
                })
            );
        const ConnectedView = connectToStore(AppView);
        this.render = () => (
            <Provider store={store}>
                <ConnectedView/>
            </Provider>
        );
    }
}

export default App;
