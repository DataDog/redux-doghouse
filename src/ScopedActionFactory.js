import { scopeActionCreators } from './scopeActionCreators';
// ScopedActionFactory is a class to allow for instanceof checking
export class ScopedActionFactory {
    constructor(actionCreators) {
        this._creators = actionCreators;
    }
    scope(id) {
        return scopeActionCreators(this._creators, id);
    }
}
