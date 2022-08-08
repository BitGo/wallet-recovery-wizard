import * as React from 'react';
import { asyncDataReducer, AsyncDataReducer } from '../reducers';

export const useElectronCommand = (cmd: keyof Window['commands']) => {
  const [state, dispatch] = React.useReducer<
    AsyncDataReducer<Awaited<ReturnType<Window['commands'][typeof cmd]>>>
  >(asyncDataReducer, {
    data: undefined,
    error: undefined,
    state: 'idle',
  });
  const command = React.useCallback(
    (...args: Parameters<Window['commands'][typeof cmd]>) => {
      dispatch({ type: 'fetch' });
      window.commands[cmd](...args)
        .then(data => {
          dispatch({ type: 'resolve', payload: data });
        })
        .catch(error => {
          dispatch({ type: 'reject', payload: error });
        });
    },
    [cmd]
  );

  return [command, state] as const;
};
