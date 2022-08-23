import * as React from 'react';
import { asyncDataReducer, AsyncDataReducer } from '../reducers';

type Queries = Window['queries'];

export const useElectronQuery = <TQuery extends keyof Queries>(
  queryName: TQuery,
  args: Parameters<Queries[TQuery]>
) => {
  type Return = ReturnType<Queries[TQuery]>;
  const query = window.queries[queryName];
  const [state, dispatch] = React.useReducer<AsyncDataReducer<Awaited<Return>>>(
    asyncDataReducer,
    {
      data: undefined,
      error: undefined,
      state: 'idle',
    }
  );
  React.useEffect(() => {
    dispatch({ type: 'fetch' });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    query(...args)
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dispatch({ type: 'resolve', payload: data });
      })
      .catch(error => {
        dispatch({ type: 'reject', payload: error });
      });
  }, [queryName, ...args]);

  return state;
};
