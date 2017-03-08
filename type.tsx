import * as React from 'react'

class Props {
  /**
   * 用户名
   */
  userName: string
  /**
   * 用户年龄
   */
  age: number = 5
  /**
   * 拥有的物品
   */
  things: Map<string,number>
}

class State { 
  /**
   * 模态框是否显示
   */
  isShow = false
}

class Test extends React.Component<Props, State>{
  static defaultProps = new Props()
  public state = new State()

  componentWillMount() {
      
  }

  componentWillReceiveProps(nextProps:Props) { 
    
  }

  render() { 
    
    return (
      <div></div>
    )
  }
}