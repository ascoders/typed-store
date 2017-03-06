/**
 * IE 不支持 symbol，所以没有用 symbol 实现
 */
export default (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (!target['reducers']) {
        target['reducers'] = new Set()
    }

    // reducerName -> reducerType    
    target['reducers'].add(propertyKey)
}