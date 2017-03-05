/**
 * IE 不支持 symbol，所以没有用 symbol 实现
 */
export default (type: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (!target['reducers']) {
        target['reducers'] = new Map()
    }

    // reducerName -> reducerType    
    target['reducers'].set(propertyKey, type)
}