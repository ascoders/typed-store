export { default as Connect } from './src/connect'
export { default as Provider } from './src/provider'
export { default as Reducer } from './src/reducer-decorator'

export class BaseAction<T> {
    getState?: () => T
}