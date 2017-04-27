# TypedStore

<a href="https://travis-ci.org/ascoders/typed-store"><img src="https://img.shields.io/travis/ascoders/typed-store/master.svg?style=flat" alt="Build Status"></a>

Strong type support for redux!

```bash
npm i typed-store --save
```

## Example

As you can see.. Very predictable code. When reducer is called, it will automatically dispatch, which is really Redux.

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
            ...this.getLocalState().user,
            firstName: name
        }
    }
}
```

And enjoy it ths same as common Redux. `store` and `actions` will be automatically injected into the component, are under the current namespace.

```typescript
interface Props {
    actions?: Actions
    store?: Store
}

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

export default (
    <TypedStore namespace="myCustomUserDemo" actions={new Actions()}>
        <App />
    </TypedStore>
)
```

You will see nick in the page.

## Scene

### How dispatch work?

Just call the method using `@Reducer` decorator, which automatically triggers the dispatch, and is received and processed by the reducer.

As long as you want, you can trigger multiple reducer.

In the reducer, you can access current state by `this.getLocalState()`.

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.customReducer(name, 'hello')
    }

    @Reducer
    private customReducer(name: string, say: string) {
        return {
            ...this.getLocalState(),
            nickname: say + '' + name
        }
    }
}
```

### How to accessing state in action and reducer?

Just call `this.getLocalState()`.

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.customReducer(this.getLocalState().nickname + name)
    }

    @Reducer
    private customReducer(name: string) {
        return {
            ...this.getLocalState(),
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

### How to get the return value of action?

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        return `name is ${name}`
    }

    public async changeFirstNameAsync(name: string) {
        return `name is ${name}`
    }
}

class App extends React.Component<Props, any> {
    async componentWillMount() {
        const actionResult1 = this.props.actions.user.changeFirstName('nick')
        console.log(actionResult1) // name is nick
        const actionResult2 = await this.props.actions.user.changeFirstNameAsync('job')
        console.log(actionResult2) // name is job
    }
}
```

### How to dispatch out of my scope?

use `this.dispatch()`, you can access `this.namespace` to get current namespace, use `this.namespace/reducerName` to access your own reducer, the reducer can only receive first arguments, from dispatch `payload` field.

```typescript
class Actions extends BaseAction<Store> {
    static initState = new UserState()
   
    public changeFirstName(name: string) {
        this.dispatch({
            type: `${this.namespace}/changeName`,
            payload: name
        })
    }

    @Reducer
    private changeName(name: string) {
        return {
            ...this.getLocalState(),
            nickname: name
        }
    }
}

class App extends React.Component<Props, any> {
    componentWillMount() {
        this.props.actions.user.changeFirstName()
    }
}
```

### How to create multiple components, and use different namespace?

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

### Write plugin

```typescript
import { BaseAction, Reducer } from 'typed-store'

class ExtendsAction extends BaseAction<any> {
  changeFirstName() {
    this.extendReducer('sarry')
  }

  @Reducer
  private extendReducer(name: string) {
    return {
      ...this.getLocalState(),
      firstName: name
    }
  }
}
```

Now to use it:

```typescript
class Actions extends BaseAction<Store> {
  static initState = new Store()
  private plugins = {
    extend: new ExtendsAction()
  }

  changeName() { 
    this.plugins.extend.changeFirstName()
  }
}
```

## Run test

```bash
yarn
npm test
```
