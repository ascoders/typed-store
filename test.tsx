import test from 'ava'
import * as React from 'react'
import { create } from 'react-test-renderer'

import { Connect, Provider, BaseAction, Reducer } from './index'

/**
 * store
 */

class Store {
    firstName = 'job'
    lastName = 'tena'
}

class Actions extends BaseAction<Store> {
    static initState = new Store()

    // 修改 firstName    
    public changeFirstName(name: string) {
        this.changeFirstNameReducer(name)
        return name
    }

    // 异步修改 firstName
    public async changeFirstNameAsync(name: string) {
        this.changeFirstNameAsyncReducer(name)
        return name
    }

    // 同步拿到 state
    public findState() {
        // return this.getState().fullName
    }

    // 异步拿到 state
    public async findStateAsync() {
        // return this.getState().fullName
    }

    // 触发一个与当前 store 数据相关的 reducer（虽然 redux 不建议这么做，会导致数据不可回溯）
    public async doubleFirstName() {
        this.doubleFirstNameReducer(this.getState().firstName)
    }

    @Reducer
    private changeFirstNameReducer(name: string) {
        return {
            ...this.getState(),
            firstName: name
        }
    }

    @Reducer
    private changeFirstNameAsyncReducer(name: string) {
        return {
            ...this.getState(),
            firstName: name
        }
    }

    @Reducer
    private doubleFirstNameReducer(firstName: string) {
        return {
            ...this.getState(),
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
        <Provider namespace="myCustomUserDemo" actions={new Actions()}>
            <App />
        </Provider>
    )

    return new Promise(resolve => setTimeout(resolve, 1000))
})

/*test('async action', t => {
    @Connect<States, Props>((state, props) => {
        return {
            firstName: state.user.firstName,
            fullName: state.user.fullName
        }
    })
    class App extends React.Component<Props, any> {
        async componentWillMount() {
            t.true(this.props.firstName === 'job')
            t.true(this.props.fullName === 'job tena')
            const actionResult = await this.props.actions.user.changeFirstNameAsync('abc')
            t.true(actionResult === 'abc')
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.firstName === 'abc')
        }

        render() {
            return (
                <div>{this.props.firstName}</div>
            )
        }
    }

    create(
        <Provider actions={new Actions()}>
            <App />
        </Provider>
    )

    return new Promise(resolve => setInterval(resolve))
})

test('get state', t => {
    @Connect<States, Props>((state, props) => {
        return {
            firstName: state.user.firstName,
            fullName: state.user.fullName
        }
    })
    class App extends React.Component<Props, any> {
        async componentWillMount() {
            t.true(this.props.actions.user.findState() === 'job tena')
            t.true(await this.props.actions.user.findStateAsync() === 'job tena')
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <Provider actions={new Actions()}>
            <App />
        </Provider>
    )

    return new Promise(resolve => setInterval(resolve))
})

test('dispatch with get state', t => {
    @Connect<States, Props>((state, props) => {
        return {
            firstName: state.user.firstName
        }
    })
    class App extends React.Component<Props, any> {
        componentWillMount() {
            this.props.actions.user.doubleFirstName()
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.firstName === 'jobjob')
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <Provider actions={new Actions()}>
            <App />
        </Provider>
    )

    return new Promise(resolve => setInterval(resolve))
})

test('pure render', t => {
    @Connect<States, Props>((state, props) => {
        return {
            lastName: state.user.lastName
        }
    })
    class App extends React.Component<Props, any> {
        componentWillMount() {
            this.props.actions.user.changeFirstName('john')
        }

        componentWillReceiveProps(nextProps: Props) {
            // will not run becauseof hasn't use firstName
            t.false(true)
        }

        render() {
            return (
                <div>123</div>
            )
        }
    }

    create(
        <Provider actions={new Actions()}>
            <App />
        </Provider>
    )

    return new Promise(resolve => setInterval(resolve))
})*/