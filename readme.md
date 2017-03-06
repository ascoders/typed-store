# typed-store

Strong type support for redux!

```bash
npm i typed-store --save
```

## Example

As you can see.. Very predictable code. When reducer is called, it will automatically issue dispatch, which is really Redux.

```typescript
import { Connect, Provider, BaseAction, Reducer } from 'typed-store'

class UserState {
    firstName = 'job'
}

class User extends BaseAction<States> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.changeFirstNameReducer(name)
    }

    @Reducer
    private changeFirstNameReducer(name: string) {
        return {
            ...this.getState().user,
            firstName: name
        }
    }
}

interface States {
    user: UserState
}

class Actions {
    user = new User()
}

export (
    <Provider actions={new Actions()}>
        <App />
    </Provider>
)
```

And enjoy it ths same as common Redux.

```typescript
@Connect<States, Props>((state, props) => {
    return {
        firstName: state.user.firstName
    }
})
class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.user.changeFirstName('nick')
    }

    render() {
        return (
            <div>{this.props.firstName}</div>
        )
    }
}
```

You will see nick in the page.

## You can get the return value of action

```typescript
class User extends BaseAction<States> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.changeFirstNameReducer(name)
        return `name is ${name}`
    }
}

@Connect<States, Props>((state, props) => {
    return {}
})
class App extends React.Component<Props, any> {
    componentWillMount() {
        console.log(this.props.actions.user.changeFirstName('nick')) // name is nick
    }

    render() {
        return (
            <div/>
        )
    }
}
```

Worked with async action too.

## Accessing state

You can accessing state in action and reducer by `this.getState()`

```typescript
class User extends BaseAction<States> {
    static initState = new UserState()
   
    public changeFirstName() {
        return `name is ${this.getState().user.firstname}`
    }
}
```

## Run test

```bash
yarn
npm test
```