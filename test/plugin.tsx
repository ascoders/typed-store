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

test('use plugin method', t => {
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