import test from 'ava'
import * as React from 'react'
import { create } from 'react-test-renderer'

import { Connect, Provider, BaseAction, Reducer } from '../index'

/**
 * store
 */

class UserState {
    firstName = 'job'
    lastName = 'tena'
    get fullName() {
        return this.firstName + ' ' + this.lastName
    }
}

class User extends BaseAction<States> {
    static initState = new UserState()

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
        return this.getState().user.fullName
    }

    // 异步拿到 state
    public async findStateAsync() {
        return this.getState().user.fullName
    }

    // 触发一个与当前 store 数据相关的 reducer（虽然 redux 不建议这么做，会导致数据不可回溯）
    public async doubleFirstName() {
        this.doubleFirstNameReducer(this.getState().user.firstName)
    }

    @Reducer
    private changeFirstNameReducer(name: string) {
        return {
            ...this.getState().user,
            firstName: name
        }
    }

    @Reducer
    private changeFirstNameAsyncReducer(name: string) {
        return {
            ...this.getState().user,
            firstName: name
        }
    }

    @Reducer
    private doubleFirstNameReducer(firstName: string) {
        return {
            ...this.getState().user,
            firstName: firstName + firstName
        }
    }
}

class Actions {
    user = new User()
}

interface States {
    user: UserState
}

/**
 * component props
 */
interface Props {
    // injected
    actions?: Actions

    firstName?: string
    fullName?: string
}

test('basic action', t => {
    @Connect<States, Props>((state, props) => {
        return {
            firstName: state.user.firstName,
            fullName: state.user.fullName
        }
    })
    class App extends React.Component<Props, any> {
        componentWillMount() {
            t.true(this.props.firstName === 'job')
            t.true(this.props.fullName === 'job tena')
            const actionResult = this.props.actions.user.changeFirstName('abc')
            t.true(actionResult === 'abc')
        }

        componentWillReceiveProps(nextProps: Props) {
            t.true(nextProps.firstName === 'abc')
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

test('async action', t => {
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
            // will not run becauseof haven't use firstName
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
})

