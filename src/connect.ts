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

        // 存储了要注入的数据        
        public state = {}

        private store: Store<any>
        private unsubscribe: Unsubscribe

        componentWillMount() {
            const typedStore: TypedStore = this.context.typedStore

            if (!typedStore) {
                return
            }

            this.store = typedStore.store

            this.updateState()

            this.unsubscribe = this.store.subscribe(() => {
                this.updateState()
            })
        }

        componentWillUnmount() {
            if (!this.unsubscribe) {
                return
            }

            this.unsubscribe()
        }

        shouldComponentUpdate(nextProps: any, nextState: any) {
            if (
                shallowEqual(this.props, nextProps) &&
                shallowEqual(this.state, nextState)
            ) {
                return false
            }
            return true
        }

        // 初始化或者 dispatch 了，更新当前 state
        updateState() {
            const injectedData = mapStateToProps(this.store.getState(), this.props)
            this.setState({
                ...injectedData
            })
        }

        render() {
            const typedStore: TypedStore = this.context.typedStore

            // 将 action 方法实现 dispatch            
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
                ...this.state
            })
        }
    }
}