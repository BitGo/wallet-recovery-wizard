export type AsyncDataState<TData> =
  | { data: undefined; state: 'idle'; error: undefined }
  | { data: undefined; state: 'loading'; error: undefined }
  | { data: TData; state: 'success'; error: undefined }
  | { data: undefined; state: 'failure'; error: unknown };

export type AsyncDataAction<TData> =
  | { type: 'fetch' }
  | { type: 'resolve'; payload: TData }
  | { type: 'reject'; payload: unknown };

export type AsyncDataReducer<TData> = (
  state: AsyncDataState<TData>,
  action: AsyncDataAction<TData>
) => AsyncDataState<TData>;

export const asyncDataReducer = <TData>(
  prevState: AsyncDataState<TData>,
  action: AsyncDataAction<TData>
): AsyncDataState<TData> => {
  switch (action.type) {
    case 'fetch':
      return {
        data: undefined,
        error: undefined,
        state: 'loading',
      };
    case 'resolve':
      return {
        data: action.payload,
        error: undefined,
        state: 'success',
      };
    case 'reject':
      return {
        data: undefined,
        error: action.payload,
        state: 'failure',
      };
    default:
      return prevState;
  }
};
