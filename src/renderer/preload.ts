/* eslint-disable @typescript-eslint/no-namespace */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

type IPCAPI = {
  setTitle(title: string): void;
};

const API: IPCAPI = {
  setTitle: (title: string) => ipcRenderer.send("setTitle", title),
};

contextBridge.exposeInMainWorld("ipc", API);

// This is needed due to collisions of Electron.Parameters in the Electron namespace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TParameters<T extends (...args: any) => any> = Parameters<T>;

declare global {
  namespace Electron {
    export interface IpcRenderer {
      send<TChannel extends keyof IPCAPI>(
        channel: TChannel,
        ...args: TParameters<IPCAPI[TChannel]>
      ): void;
    }
    export interface IpcMain {
      on<TChannel extends keyof IPCAPI>(
        channel: TChannel,
        listener: (
          event: IpcMainEvent,
          ...args: TParameters<IPCAPI[TChannel]>
        ) => void
      ): this;
    }
  }
  interface Window {
    ipc: IPCAPI;
  }
}
