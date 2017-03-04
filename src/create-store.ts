import {createStore, applyMiddleware, compose, Middleware} from 'redux'
import asyncMiddleware from './async-middleware'

declare const __DEV__: boolean // from webpack
declare const module: any // from webpack
declare const require: any // from webpack

function configureStore(initialState: any, rootReducer: any) {
    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(..._getMiddleware()),
            typeof __DEV__ && environment.devToolsExtension ?
                environment.devToolsExtension() :
                (f: any) => f))

    _enableHotLoader(store)
    return store
}

function _getMiddleware(): Middleware[] {
    let middleware = [
        asyncMiddleware
    ]

    if (typeof __DEV__) {
        middleware = [...middleware]
    }

    return middleware
}

const environment: any = window || this

function _enableHotLoader(store: any) {
    if (!typeof __DEV__) {
        return
    }

    // if (module.hot) {
    //     module.hot.accept('../reducers', () => {
    //         const nextRootReducer = require('../reducers')
    //         store.replaceReducer(nextRootReducer)
    //     })
    // }
}

export default configureStore