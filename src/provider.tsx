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

    componentWillMount() {
        Object.keys(this.props.actions).forEach(namespace => {
            // 当前 namespace 下所有 actions 实例
            const actions = this.props.actions[namespace]

            // 记录了所有 reducer 的 Map
            const actionsReducers = actions['reducers'] as Map<string, Function> || new Map()

            this.actions[namespace] = {}

            // 获取当前 actions 实例的类上所有方法名
            Object.getOwnPropertyNames(Object.getPrototypeOf(actions))
                .filter(methodName => methodName !== 'constructor' && methodName !== 'reducers')
                .forEach(methodName => {
                    if (actionsReducers.has(methodName)) { // 当前方法是 reducer
                        // 设置当前 namespace 的 reducers
                        if (!this.namespaceMapReducers.has(namespace)) {
                            this.namespaceMapReducers.set(namespace, new Map())
                        }
                        const type = actionsReducers.get(methodName)
                        const reducers = this.namespaceMapReducers.get(namespace)
                        const reducerType = `${namespace}/${type}`
                        reducers.set(reducerType, actions[methodName])
                        this.namespaceMapReducers.set(namespace, reducers)
                    } else { // 当前方法是 action
                        this.actions[namespace][methodName] = actions[methodName]
                    }
                })

            // 记录当前 namespace 的 initState
            // 如果有多个 action 属于同一个 namespace，将会覆盖多次，正常情况
            this.namespaceInitState.set(namespace, actions.constructor.initState)
        })
    }

    getChildContext() {
        let typedStore: TypedStore = this.context.typedStore

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

        if (!typedStore) { // 初始化 context
            typedStore = {
                store: createStore(combineReducers(fitCombineReducers)),
                actions: this.actions
            }
        } else { // context 已存在，更新 reducer

        }

        // todo 这只是它自己的，还要把父级的 reducer 带上        
        // const reducers = combineReducers(fitCombineReducers)
        // typedStore.store.replaceReducer(reducers)

        return {
            typedStore
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}