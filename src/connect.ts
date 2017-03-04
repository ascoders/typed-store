import * as React from 'react'
import { Store, Unsubscribe } from 'redux'
import shallowEqual from './utils/shallow-equal'
import { TypedStore } from './provider'

function isPromise(val: any) {
    return val && typeof val.then === 'function'
}

export default <State, Props>(mapStateToProps?: (state?: State, props?: Props) => object) => (decoratedComponent: any): any => {
    return class WrapComponent extends React.Component<any, any> {
        // 取 context
        static contextTypes = {
            typedStore: React.PropTypes.object
        }

        private store: Store<any>
        private unsubscribe: Unsubscribe

        // 用户注入的数据
        private injectedData: object

        // shouldComponentUpdate(nextProps: any) {
        //     if (!shallowEqual(this.props, nextProps)) {
        //         return true
        //     }
        //
        //     return false
        // }

        componentWillMount() {
            const typedStore: TypedStore = this.context.typedStore

            if (!typedStore) {
                return
            }

            this.store = typedStore.store

            // 拿到用户想要的数据
            this.injectedData = mapStateToProps(this.store.getState(), this.props)

            this.unsubscribe = this.store.subscribe(() => {
                this.injectedData = mapStateToProps(this.store.getState(), this.props)
                this.forceUpdate()
            })
        }

        componentWillUnmount() {
            if (!this.unsubscribe) {
                return
            }

            this.unsubscribe()
        }

        render() {
            const typedStore: TypedStore = this.context.typedStore

            const combinedActions: any = {}
            Object.keys(typedStore.actions).forEach(namespace => {
                const actions = typedStore.actions[namespace]
                combinedActions[namespace] = {}

                // 绑上 getState 方法                
                actions.getState = typedStore.store.getState

                Object.keys(actions).forEach(actionName => {
                    combinedActions[namespace][actionName] = (...args: any[]) => {
                        const reducerType = `${namespace}/${actionName}`
                        const result = actions[actionName](...args)
                        if (isPromise(result)) { // 如果 action 返回值是 async，dispatch then 后的结果
                            result.then((thenResult: any) => {
                                typedStore.store.dispatch({
                                    type: reducerType,
                                    payload: thenResult
                                })
                            })

                            return result // 没关系，因为调用出相应使用 await 接住
                        }

                        typedStore.store.dispatch({
                            type: reducerType,
                            payload: result
                        })

                        return result
                    }
                })
            })

            return React.createElement(decoratedComponent, {
                ...this.props,
                actions: combinedActions,
                ...this.injectedData
            })
        }
    }
}