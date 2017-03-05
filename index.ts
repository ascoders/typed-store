export { default as Connect } from './src/connect'
export { default as Provider } from './src/provider'
export { default as Reducer } from './src/reducer-decorator'

export interface IAction<T> {
    type: string
    payload: T
}

export class BaseAction<T> {
    getState?: () => T
}