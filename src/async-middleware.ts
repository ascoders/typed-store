/**
 * async await 语法处理中间件
 */

function isPromise(val: any) {
    return val && typeof val.then === 'function'
}

export default ({dispatch}:any) => (next: any) => (action: any) => {
    if (action) {
        isPromise(action)
            ? action.then((res: any) => dispatch(res))
            : next(action)
    }
}