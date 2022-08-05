/* eslint-disable @typescript-eslint/no-namespace */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

const environments = ['prod', 'test'] as const;

type Commands = {
  setBitGoEnvironment(environment: typeof environments[number]): void;
};

type Queries = {
  getBitGoEnvironments(): Promise<typeof environments>;
};

const queries: Queries = {
  getBitGoEnvironments() {
    return ipcRenderer.invoke('getBitgoEnvironments');
  },
};

const commands: Commands = {
  setBitGoEnvironment(environment: typeof environments[number]) {
    ipcRenderer.send('setBitgoEnvironment', environment);
  },
};

contextBridge.exposeInMainWorld('commands', commands);
contextBridge.exposeInMainWorld('queries', queries);

// This is needed due to collisions of Electron.Parameters in the Electron namespace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TParameters<T extends (...args: any) => any> = Parameters<T>;

declare global {
  namespace Electron {
    export interface IpcRenderer {
      send<TChannel extends keyof Commands>(
        channel: TChannel,
        ...args: TParameters<Commands[TChannel]>
      ): void;
      invoke<TChannel extends keyof Queries>(
        channel: TChannel,
        ...args: TParameters<Queries[TChannel]>
      ): ReturnType<Queries[TChannel]>;
    }
    export interface IpcMain {
      on<TChannel extends keyof Commands>(
        channel: TChannel,
        listener: (...args: TParameters<Commands[TChannel]>) => void
      ): this;
      handle<TChannel extends keyof Queries>(
        channel: TChannel,
        listener: (
          event: IpcMainEvent,
          ...args: TParameters<Queries[TChannel]>
        ) => void
      ): void;
    }
  }
  interface Window {
    queries: Queries;
    commands: Commands;
  }
}
