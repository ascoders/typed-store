import test from 'ava'
import * as React from 'react'
import { create } from 'react-test-renderer'

import { TypedStore, BaseAction, Reducer } from '../index'

/**
 * 拓展方法1
 */
class ExtendsAction1 extends BaseAction<any> {
  extend1() {
    this.dispatch({
      type: `${this.namespace}/extendReducer1`,
      payload: 'extendCall1'
    })

    this.dispatch({
      type: `${this.namespace}/calledByExtendAction1`,
      payload: 'extendCall2'
    })
  }

  @Reducer
  private extendReducer1(name: string) {
    return {
      ...this.getLocalState(),
      firstName: name
    }
  }
}

/**
 * 拓展方法2
 */
class ExtendsAction2 extends BaseAction<any> {
  extend2(name: string) {
    this.extendReducer2(name)
  }

  @Reducer  
  private extendReducer2(name: string) {
    return {
      ...this.getLocalState(),
      firstName: name
    }
  }
}

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
  private plugins = {
    ExtendsAction1: new ExtendsAction1(),
    ExtendsAction2: new ExtendsAction2()
  }

  say() { 
    this.dispatch({
      type: `${this.namespace}/calledByThis`,
      payload: '9999'
    })
  }

  usePlugin1() { 
    this.plugins.ExtendsAction1.extend1()
  }

  allInPlugin() { 
    this.plugins.ExtendsAction2.extend2('allInPlugin')
  }

  @Reducer
  private calledByThis(nickname: string) {
    return {
      ...this.getLocalState(),
      lastName: nickname
    }
  }

  @Reducer
  private calledByExtendAction1(nickname: string) { 
    return {
      ...this.getLocalState(),
      lastName: nickname
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

test('use dispatch', t => {
  class App extends React.Component<Props, any> {
    componentWillMount() {
      this.props.actions.say() 
    }

    componentWillReceiveProps(nextProps: Props) { 
      t.true(nextProps.store.lastName === '9999')
    }

    render() {
      return (
        <div>123</div>
      )
    }
  }

  create(
    <TypedStore namespace="myCustomUserDemo9" actions={new Actions()}>
      <App />
    </TypedStore>
  )

  return new Promise(resolve => setImmediate(resolve))
})

test('dispatch in plugin', t => {
  class App extends React.Component<Props, any> {
    componentWillMount() {
      this.props.actions.usePlugin1()
    }

    componentWillReceiveProps(nextProps: Props) {
      t.true(nextProps.store.firstName === 'extendCall1')
      t.true(nextProps.store.lastName === 'extendCall2')
    }

    render() {
      return (
        <div>123</div>
      )
    }
  }

  create(
    <TypedStore namespace="myCustomUserDemo9" actions={new Actions()}>
      <App />
    </TypedStore>
  )

  return new Promise(resolve => setImmediate(resolve))
})

test('action reducer all in plugin', t => {
  class App extends React.Component<Props, any> {
    componentWillMount() {
      this.props.actions.allInPlugin()
    }

    componentWillReceiveProps(nextProps: Props) {
      t.true(nextProps.store.firstName === 'allInPlugin')
    }

    render() {
      return (
        <div>123</div>
      )
    }
  }

  create(
    <TypedStore namespace="myCustomUserDemo9" actions={new Actions()}>
      <App />
    </TypedStore>
  )

  return new Promise(resolve => setImmediate(resolve))
})