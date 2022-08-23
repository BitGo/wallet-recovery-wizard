import * as React from 'react';
import { asyncDataReducer, AsyncDataReducer } from '../reducers';

type Commands = Window['commands'];

export const useElectronCommand = <TCommand extends keyof Commands>(
  commandName: TCommand
) => {
  type Command = Commands[TCommand];
  type Params = Parameters<Command>;
  type Return = ReturnType<Command>;
  const command = window.commands[commandName];
  const [state, dispatch] = React.useReducer<AsyncDataReducer<Awaited<Return>>>(
    asyncDataReducer,
    {
      data: undefined,
      error: undefined,
      state: 'idle',
    }
  );
  const callback = React.useCallback(
    (...args: Params) => {
      dispatch({ type: 'fetch' });
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
    [commandName]
  );

  return [callback, state] as const;
};
