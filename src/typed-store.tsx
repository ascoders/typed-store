import * as React from 'react'
import { createStore, combineReducers, Store, Unsubscribe } from 'redux'
import shallowEqual from './utils/shallow-equal'

export interface TypedStore {
    // 全局 store
    store: Store<any>
    // 全局 reducers，所有组件的 reducer 都 merge 进去
    reducers: {
        [namespace: string]: any
    }
    // 暂时没什么用，目前调用直接 dispatch，调用这里可以获得类型支持
    actions: any
}

interface Props {
    /**
     * 命名空间
     */
    namespace?: string
    /**
     * 当前组件的局部 actions
     */    
    actions?: any
}

export default class Provider extends React.Component<Props, any> {
    static contextTypes = {
        typedStore: React.PropTypes.object,
        // react-redux
        store: React.PropTypes.object
    }

    static childContextTypes = {
        typedStore: React.PropTypes.object.isRequired,
        // react-redux
        store: React.PropTypes.object
    }

    // 存储了要注入的数据        
    public state = {}

    // 取消 redux 监听    
    private unsubscribe: Unsubscribe

    // 当前组件全部 action
    // 和 this.props.actions 相比，绑定了一些函数，修改所有调用的reducer函数
    private actions: any = {}

    // 当前组件全部 reducer
    private reducers = new Map<string, any>()

    private initState: object = {}

    // context 中所有存储数据
    private typedStore: TypedStore

    /**
     * 在其构造函数绑定自定义方法
     */
    bindMethodInConstructor(target:any) { 
        target.constructor.prototype.getLocalState = () => {
            return this.typedStore.store.getState()[this.props.namespace]
        }
        target.constructor.prototype.dispatch = (action: any) => {
            this.typedStore.store.dispatch({
                type: action.type,
                payload: [action.payload]
            })
        }
        target.constructor.prototype.namespace = this.props.namespace
    }

    /**
     * 解析某个实例，剥离其 reducer 方法
     */
    getReducers(target: any) { 
        // 记录了所有 reducer 的 Map
        const actionsReducers = target['reducers'] as Set<string> || new Set()

        Object.getOwnPropertyNames(Object.getPrototypeOf(target))
            .filter(methodName => methodName !== 'constructor' && methodName !== 'reducers')
            .map(methodName => {
                this.actions[methodName] = target[methodName]

                return methodName
            })
            .forEach(methodName => {
                // 如果当前方法是 reducer
                if (actionsReducers.has(methodName)) {
                    const reducerType = `${this.props.namespace}/${methodName}`

                    // reducer 真实效果
                    this.reducers.set(reducerType, (state: any, action: any) => {
                        return target[methodName].apply({
                            // 绑定 getLocalState
                            getLocalState: () => {
                                return this.typedStore.store.getState()[this.props.namespace]
                            },
                            dispatch: () => {
                                throw Error('不要在 reducer 方法中 dispatch')
                            },
                            namespace: this.props.namespace
                        }, action.payload)
                    })

                    // 重写这个 reducer，让调用的时候触发 dispatch
                    this.actions[methodName] = (...args: any[]) => {
                        // 触发 dispatch
                        this.typedStore.store.dispatch({
                            type: `${this.props.namespace}/${methodName}`,
                            payload: args
                        })
                    }
                }
            })
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

    componentWillMount() {
        // 创建或者拿到 this.typedStore
        if (!this.context.typedStore) {
            this.typedStore = {
                store: this.context.store || createStore(function () { }), // 优先取 react-redux 的 store
                actions: {},
                reducers: {}
            }
        } else {
            this.typedStore = this.context.typedStore
        }

        // 在类的原型链绑定辅助函数
        this.bindMethodInConstructor(this.props.actions)

        // 为插件绑定辅助函数
        this.props.actions.constructor.prototype.plugins = this.props.actions.plugins
        this.props.actions.constructor.prototype.plugins && Object.keys(this.props.actions.constructor.prototype.plugins).forEach(key => { 
            const plugin = this.props.actions.constructor.prototype.plugins[key]
            // 在插件原型链绑定辅助函数
            this.bindMethodInConstructor(plugin)
            // 设置 reducers
            this.getReducers(plugin)
        })

        // 获取当前 actions 实例的类上所有方法名
        // 设置 this.actions this.reducers
        this.getReducers(this.props.actions)

        // 设置 initState
        this.initState = this.props.actions.constructor.initState

        // 把自己的 reducers 聚合到 context 的全局 reducers 里
        this.typedStore.reducers[this.props.namespace] = (state = this.initState, action: any) => {
            if (this.reducers.has(action.type)) {
                return this.reducers.get(action.type)(state, action)
            }
            // 没有对应的 reducer 处理
            return state
        }

        // 更新 store 的 reducer
        this.typedStore.store.replaceReducer(combineReducers(this.typedStore.reducers))

        // 监听所有数据变化        
        this.unsubscribe = this.typedStore.store.subscribe(() => {
            this.updateState()
        })

        // 获得初始化数据
        this.updateState()
    }

    componentWillUnmount() {
        if (!this.unsubscribe) {
            return
        }

        this.unsubscribe()
    }

    getChildContext() {
        return {
            typedStore: this.typedStore
        }
    }

    // 初始化或者 dispatch 了，更新当前 state
    updateState() {
        const injectedData = this.typedStore.store.getState()[this.props.namespace]
        this.setState({
            ...injectedData
        })
    }

    render() {
        return React.cloneElement(this.props.children as JSX.Element, {
            store: this.state,
            actions: this.actions
        })
    }
}