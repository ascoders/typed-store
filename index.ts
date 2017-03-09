import { Dispatch } from 'redux'

export { default as TypedStore } from './src/typed-store'
export { default as Reducer } from './src/reducer-decorator'

export class BaseAction<T> {
    protected getLocalState?: () => T
    protected dispatch?: Dispatch<any>
    protected namespace?: string
}