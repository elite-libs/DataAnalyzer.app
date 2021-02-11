
export interface Dictionary<T> {
  [id: string]: T | undefined;
  [id: number]: T | undefined;
}

export type CallbackFn<TArgs, TReturn = void> = (args?: TArgs | any) => TReturn | any;
