import React from 'react';

const INCREMENT = Symbol('Counter/INCREMENT');
const DECREMENT = Symbol('Counter/DECREMENT');
export const actionCreators = {
    increment: () => ({ type: INCREMENT }),
    decrement: () => ({ type: DECREMENT })
};
export const reducers = {
    amount: (state = 0, action = {}) => {
        switch (action.type) {
            case INCREMENT:
                return state < 9 ? state + 1 : 0;
            case DECREMENT:
                return state > 0 ? state - 1 : 9;
            default:
                return state;
        }
    }
};

export const View = ({ amount, actions }) => (
    <div className="Counter">
        <span className="Counter-amount">{amount}</span>
        <button className="Counter-button"
                onClick={actions.increment}>+</button>
        <button className="Counter-button"
                onClick={actions.decrement}>-</button>
    </div>
);
