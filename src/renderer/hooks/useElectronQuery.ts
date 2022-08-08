import * as React from 'react';
import { asyncDataReducer, AsyncDataReducer } from '../reducers';

export const useElectronQuery = (query: keyof Window['queries']) => {
  const [state, dispatch] = React.useReducer<
    AsyncDataReducer<Awaited<ReturnType<Window['queries'][typeof query]>>>
  >(asyncDataReducer, {
    data: undefined,
    error: undefined,
    state: 'idle',
  });
  React.useEffect(() => {
    dispatch({ type: 'fetch' });
    window.queries[query]()
      .then(data => {
        dispatch({ type: 'resolve', payload: data });
      })
      .catch(error => {
        dispatch({ type: 'reject', payload: error });
      });
  }, [query]);

  return state;
};
