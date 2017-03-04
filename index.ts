export { default as Connect } from './src/connect'
export { default as Provider } from './src/provider'

export interface IAction<T> {
    type: string
    payload: T
}

export class BaseAction<T> {
    getState?: () => T
}