import * as React from 'react';
import { asyncDataReducer, AsyncDataReducer } from '../reducers';

export const useElectronCommand = (cmd: keyof Window['commands']) => {
  type Command = Window['commands'][typeof cmd];
  type Params = Parameters<Command>;
  type Return = ReturnType<Command>;
  const [state, dispatch] = React.useReducer<AsyncDataReducer<Awaited<Return>>>(
    asyncDataReducer,
    {
      data: undefined,
      error: undefined,
      state: 'idle',
    }
  );
  const command = React.useCallback(
    (...args: Params) => {
      dispatch({ type: 'fetch' });
      const command = window.commands[cmd];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      command(...args)
        .then(data => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
