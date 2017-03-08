import test from 'ava'
import * as React from 'react'
import { create } from 'react-test-renderer'

import { TypedStore, BaseAction, Reducer } from '../index'

/**
 * store
 */

class Store {
    /**
     * 用户名，默认是 job
     */
    firstName = 'job'
    /**
     * 用户 lastName，默认是 tena
     */
    lastName = 'tena'
}

class Actions extends BaseAction<Store> {
    static initState = new Store()

    // 修改 firstName    
    public changeFirstName(name: string) {
        this.changeFirstNameReducer(name)

        return name
    }

    public async request() {
        // before
        
        // after
    }

    reducer(isFetching:boolean) {
        
    }

    // 异步修改 firstName
    public async changeFirstNameAsync(name: string) {
        this.changeFirstNameAsyncReducer(name)
        return name
    }

    // 同步拿到 state
    public findState() {
         return this.getLocalState().lastName
    }

    // 异步拿到 state
    public async findStateAsync() {
        return this.getLocalState().lastName
    }

    // 触发一个与当前 store 数据相关的 reducer（虽然 redux 不建议这么做，会导致数据不可回溯）
    public async doubleFirstName() {
        this.doubleFirstNameReducer(this.getLocalState().firstName)
    }

    @Reducer
    private changeFirstNameReducer(name: string) {
        return {
            ...this.getLocalState(),
            firstName: name
        }
    }

    @Reducer
    private changeFirstNameAsyncReducer(name: string) {
        return {
            ...this.getLocalState(),
            firstName: name
        }
    }

    @Reducer
    private doubleFirstNameReducer(firstName: string) {
        return {
            ...this.getLocalState(),
            firstName: firstName + firstName
        }
    }
}

/**
 * component props
 */
class Props {
    // injected
    actions?: Actions
    // injected
    store?: Store
}

test('basic action', t => {
    class App extends React.Component<Props, any> {
        componentWillMount() {
            t.true(this.props.store.firstName === 'job')
            t.true(this.props.store.lastName === 'tena')
            const actionResult = this.props.actions.changeFirstName('abc')
            t.true(actionResult === 'abc')
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.store.firstName === 'abc')
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <TypedStore namespace="myCustomUserDemo1" actions={new Actions()}>
            <App />
        </TypedStore>
    )

    return new Promise(resolve => setTimeout(resolve, 10))
})

test('async action', t => {
    class App extends React.Component<Props, any> {
        async componentWillMount() {
            t.true(this.props.store.firstName === 'job')
            const actionResult = await this.props.actions.changeFirstNameAsync('abc')
            t.true(actionResult === 'abc')
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.store.firstName === 'abc')
        }

        render() {
            return (
                <div>{this.props.store.firstName}</div>
            )
        }
    }

    create(
        <TypedStore namespace="myCustomUserDemo2" actions={new Actions()}>
            <App />
        </TypedStore>
    )

    return new Promise(resolve => setInterval(resolve))
})

test('get state', t => {
    class App extends React.Component<Props, any> {
        async componentWillMount() {
            t.true(this.props.actions.findState() === 'tena')
            //t.true(await this.props.actions.findStateAsync() === 'tena')
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <TypedStore namespace="myCustomUserDemo3" actions={new Actions()}>
            <App />
        </TypedStore>
    )

    return new Promise(resolve => setInterval(resolve))
})

test('dispatch with get state', t => {
    class App extends React.Component<Props, any> {
        componentWillMount() {
            this.props.actions.doubleFirstName()
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.store.firstName === 'jobjob')
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <TypedStore namespace="myCustomUserDemo4" actions={new Actions()}>
            <App />
        </TypedStore>
    )

    return new Promise(resolve => setInterval(resolve))
})