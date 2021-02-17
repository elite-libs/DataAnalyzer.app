export interface Dictionary<T> {
  [id: string]: T | undefined | null;
  [id: number]: T | undefined | null;
}

export type CallbackFn<TArgs, TReturn = void> = (args?: TArgs | any) => TReturn | any;

export interface Dict<TValue> {
  [id: string]: TValue | undefined | null;
}
