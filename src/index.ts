import { app, BrowserWindow, session } from 'electron';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let loadingWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

function createMainWindow() {
  loadingWindow = new BrowserWindow({
    show: false,
    frame: true,
    autoHideMenuBar: false,
    width: 1200,
    height: 800,
    webPreferences: {
      devTools: true,
    },
  });

  loadingWindow.webContents.once('dom-ready', async () => {
    mainWindow = new BrowserWindow({
      show: false,
      frame: true,
      autoHideMenuBar: false,
      // 'screen' needs to be after the ready event
      // https://github.com/electron/electron/issues/5897
      width: 1200,
      height: 800,
      // TODO(Peter): we should figure out how to remove this
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: true,
      },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();

      // Open the DevTools.
      // mainWindow.webContents.openDevTools()

      loadingWindow.hide();
      loadingWindow.close();
    });
  });

  // BitGo API doesn't accept access tokens from Origin's that are different
  // from it's source, so we need to override.
  // https://stackoverflow.com/questions/51254618/how-do-you-handle-cors-in-an-electron-app/56376799#56376799
  // Modify the origin for all requests to the following urls.
  const filter = {
    urls: ['https://app.bitgo-test.com/*', 'https://app.bitgo.com/*'],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    // TODO(louis): need to check prod, 'https://app.bitgo-test.com' worked on test
    details.requestHeaders['Origin'] = null;
    callback({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    // details.responseHeaders['Access-Control-Allow-Origin'] = ['capacitor-electron://-'];
    callback({ responseHeaders: details.responseHeaders });
  });

  // Note that we copy over the loading.html file in packages/offline-vault/webpack.main.config.js
  loadingWindow.loadURL(`file://${__dirname}/loading/index.html`);
  loadingWindow.show();
}

app.on('ready', createMainWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
