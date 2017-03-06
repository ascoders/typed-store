import * as React from 'react'
import { createStore, combineReducers, Store } from 'redux'

export interface TypedStore {
    store: Store<any>
    actions: any
}

interface Props {
    actions?: any
}

export default class Provider extends React.Component<Props, any> {
    static contextTypes = {
        typedStore: React.PropTypes.object
    }

    static childContextTypes = {
        typedStore: React.PropTypes.object.isRequired
    }

    // namespace -> { type -> reducer } 的二维映射关系    
    private namespaceMapReducers = new Map<string, Map<string, any>>()

    // namespace -> initState 映射关系    
    private namespaceInitState = new Map<string, object>()

    // namespace -> namespace -> actionName 映射关系
    private actions: any = {}

    // context 中所有存储数据
    private typedStore: TypedStore

    componentWillMount() {
        if (!this.context.typedStore) { // 如果 context 实例不存在，就创建，并暂存起来，下面方法会塞给 context
            this.typedStore = {
                store: createStore(function () { }),
                actions: {}
            }
        } else { // typedStore 一定最终指向唯一的数据
            this.typedStore = this.context.typedStore
        }

        Object.keys(this.props.actions).forEach(namespace => {
            // 当前 namespace 下所有 actions 实例
            const actions = this.props.actions[namespace]

            // 记录了所有 reducer 的 Map
            const actionsReducers = actions['reducers'] as Set<string> || new Set()

            const _this = this

            this.actions[namespace] = {}

            // 获取当前 actions 实例的类上所有方法名
            Object.getOwnPropertyNames(Object.getPrototypeOf(actions))
                .filter(methodName => methodName !== 'constructor' && methodName !== 'reducers')
                .forEach(methodName => {
                    this.actions[namespace][methodName] = actions[methodName]

                    if (actionsReducers.has(methodName)) { // 当前方法是 reducer
                        // 设置当前 namespace 的 reducers
                        if (!this.namespaceMapReducers.has(namespace)) {
                            this.namespaceMapReducers.set(namespace, new Map())
                        }
                        const reducers = this.namespaceMapReducers.get(namespace)
                        const reducerType = `${namespace}/${methodName}`
                        reducers.set(reducerType, (state: any, action: any) => {
                            return actions[methodName].apply({
                                // 绑定 getState
                                getState: this.typedStore.store.getState
                            }, action.payload)
                        })
                        this.namespaceMapReducers.set(namespace, reducers)

                        // 重写这个 reducer
                        this.actions[namespace][methodName] = function (...args: any[]) {
                            // 触发 dispatch
                            _this.typedStore.store.dispatch({
                                type: `${namespace}/${methodName}`,
                                payload: args
                            })
                        }
                    }
                })

            // 记录当前 namespace 的 initState
            // 如果有多个 action 属于同一个 namespace，将会覆盖多次，正常情况
            this.namespaceInitState.set(namespace, actions.constructor.initState)

            // 把当前 Provider 的 actions merge 进全局 actions
            Object.assign(this.typedStore.actions, this.actions)

            /**
             * 更新 reducer
             */
            // combineReducers 结构
            const fitCombineReducers: {
                [nameSpace: string]: any
            } = {}

            // fitCombineReducers 赋值
            this.namespaceMapReducers.forEach((reducerMap, namespace) => {
                fitCombineReducers[namespace] = (state = this.namespaceInitState.get(namespace), action: any) => {
                    if (reducerMap.has(action.type)) {
                        return reducerMap.get(action.type)(state, action)
                    }
                    return state
                }
            })
            this.typedStore.store.replaceReducer(combineReducers(fitCombineReducers))
        })
    }

    getChildContext() {
        return {
            typedStore: this.typedStore
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}