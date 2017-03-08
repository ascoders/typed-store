# TypedStore

Strong type support for redux!

```bash
npm i TypedStore --save
```

## Example

As you can see.. Very predictable code. When reducer is called, it will automatically issue dispatch, which is really Redux.

```typescript
import { TypedStore, BaseAction, Reducer } from 'TypedStore'

class Store {
    firstName = 'job'
}

class Actions extends BaseAction<Store> {
    static initState = new Store()
   
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

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

And enjoy it ths same as common Redux. `store` and `actions` will be automatically injected into the component, are under the current namespace.

```typescript
class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.changeFirstName('nick')
    }

    render() {
        return (
            <div>{this.props.store.firstName}</div>
        )
    }
}
```

You will see nick in the page.

## Scene

### How to get the return value of action?

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        return `name is ${name}`
    }
}

class App extends React.Component<Props, any> {
    componentWillMount() {
        const actionResult = this.props.actions.user.changeFirstName('nick')
        console.log(actionResult) // name is nick
    }
    // render..
}

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

### How to get async action value?

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public async changeFirstName(name: string) {
        const result = await someAsyncOptionLikeFetch(name) // good ${name}
        return `result is ${result}`
    }
}

class App extends React.Component<Props, any> {
    async componentWillMount() {
        const actionResult = await this.props.actions.user.changeFirstName('nick')
        console.log(actionResult) // result is good nick
    }
    // render..
}

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

### How to dispatch?

Just call the method using `@Reducer` decorator, which automatically triggers the dispatch, and is received and processed by the reducer.

As long as you want, you can trigger multiple reducer.

In the reducer, you can access current state by `this.getState()`.

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.customReducer(name)
    }

    @Reducer customReducer(name: string) {
        return {
            ...this.getState(),
            nickname: name
        }
    }
}

class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.user.changeFirstName('nick')
    }
    // render..
}

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

### How to accessing state in action?

It's similar to reducer, just call `this.getState()`.

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.customReducer(this.getState().nickname + name)
    }
}

class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.user.changeFirstName('nick')
    }
    // render..
}

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

### How to dispatch out of my scope?

use `this.dispatch()`

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName() {
        this.dispatch('application/loginOut', {
            jump: false
        })
    }
}

class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.user.changeFirstName()
    }
    // render..
}

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

### How to create multiple components, and data streams complement each other?

You can override it's namespace.

```typescript
render() {
    return (
        <div>
            <SubApp namespace="sub1"/>
            <SubApp namespace="sub2"/>
        </div>
    )
}
```

## Run test

```bash
yarn
npm test
```