/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { createLoggerUtil, logger, resolveHtmlPath } from './util';
import MenuBuilder from './menu';

const FILE_NAME_CONST = 'MAIN';

export default class AppUpdater {
  constructor() {
    this.checkUpdate();
  }

  // eslint-disable-next-line class-methods-use-this
  async checkUpdate() {
    if (!logger) {
      await createLoggerUtil();
    }
    autoUpdater.logger = logger;
    logger.log({
      level: 'debug',
      message: 'Check for update',
      file: FILE_NAME_CONST,
    });
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let modalWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  logger.log({
    level: 'debug',
    message: 'Install dev tools extensions',
    file: FILE_NAME_CONST,
  });
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWindow = async () => {
  if (!logger) {
    await createLoggerUtil();
  }
  logger.log({
    level: 'debug',
    message: 'Start create the main window',
    file: FILE_NAME_CONST,
  });
  if (isDebug) {
    await installExtensions();
    logger.log({
      level: 'debug',
      message: 'Install dev tools extensions is done',
      file: FILE_NAME_CONST,
    });
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('/'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      logger.log({
        level: 'error',
        message: '"mainWindow" is not defined',
        file: FILE_NAME_CONST,
      });
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  logger.log({
    level: 'debug',
    message: 'Create menu',
    file: FILE_NAME_CONST,
  });
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on('writeLog', async (_event, args) => {
  logger.log({
    level: args[0].level,
    message: args[0].message,
    file: args[0].file,
  });
});

const newWindow = async () => {
  logger.log({
    level: 'debug',
    message: 'Start create a modal',
    file: FILE_NAME_CONST,
  });
  if (mainWindow && !modalWindow) {
    modalWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 500,
      parent: mainWindow,
      modal: true,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    modalWindow.loadURL(resolveHtmlPath('/secondWindow'));

    modalWindow.on('ready-to-show', () => {
      if (!modalWindow) {
        logger.log({
          level: 'error',
          message: '"modal" is not defined',
          file: FILE_NAME_CONST,
        });
        throw new Error('"modal" is not defined');
      }
      logger.log({
        level: 'debug',
        message: 'Modal is ready',
        file: FILE_NAME_CONST,
      });
      modalWindow.show();
    });

    modalWindow.on('closed', () => {
      modalWindow = null;
    });
  }
};

ipcMain.on('openModal', (_event) => {
  newWindow();
});

ipcMain.on('closeModal', (_event) => {
  modalWindow?.close();
});
