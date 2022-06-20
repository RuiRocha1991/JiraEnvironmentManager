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
import {
  createLoggerUtil,
  Logger,
  logger,
  LogLevel,
  resolveHtmlPath,
} from './util';
import MenuBuilder from './menu';
import settingsListener from './listeners/SettingsListener';
import jiraInstancesListener from "./listeners/JiraInstancesListener";

const LOGGER = new Logger('Main');
let mainWindow: BrowserWindow | null = null;
let modalWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

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
    LOGGER.log(LogLevel.INFO, 'Check for update');
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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
  LOGGER.log(LogLevel.DEBUG, 'Install dev tools extensions');
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
  LOGGER.log(LogLevel.DEBUG, 'Create Main Window');
  if (isDebug) {
    await installExtensions();
    LOGGER.log(LogLevel.DEBUG, 'Install dev tools extensions is done');
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
      LOGGER.log(LogLevel.ERROR, '"mainWindow" is not defined');
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
  LOGGER.log(LogLevel.DEBUG, 'Create menu');
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Start Listeners
  settingsListener.on();
  jiraInstancesListener.on();

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
  LOGGER.log(LogLevel.DEBUG, 'Create modal started');
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
        LOGGER.log(LogLevel.ERROR, '"modal" is not defined');
        throw new Error('"modal" is not defined');
      }
      LOGGER.log(LogLevel.DEBUG, 'Modal is ready');
      modalWindow.show();
    });

    modalWindow.on('closed', () => {
      modalWindow = null;
    });
  }
};

const openSettingsWindow = () => {
  LOGGER.log(LogLevel.DEBUG, 'Create Settings Window');
  if (mainWindow && !settingsWindow) {
    settingsWindow = new BrowserWindow({
      show: false,
      resizable: false,
      width: 800,
      height: 700,
      parent: mainWindow,
      modal: true,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    settingsWindow.loadURL(resolveHtmlPath('/settings'));

    settingsWindow.on('ready-to-show', () => {
      if (!settingsWindow) {
        LOGGER.log(LogLevel.ERROR, '"Settings Window" is not defined');
        throw new Error('"Settings Window" is not defined');
      }
      LOGGER.log(LogLevel.DEBUG, 'Settings Window is ready');
      settingsWindow.show();
    });

    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }
};

ipcMain.on('openModal', (_event) => {
  newWindow();
});

ipcMain.on('closeModal', (_event) => {
  modalWindow?.close();
});

ipcMain.on('openSettingsScreen', (_event) => {
  LOGGER.log(LogLevel.INFO, 'Open Settings Screen');
  openSettingsWindow();
});

ipcMain.on('closeSettingsWindow', (_event) => {
  settingsWindow?.close();
});

ipcMain.on('forceUpdate', (_event) => {
  mainWindow?.webContents.send('forceUpdate');
});

ipcMain.on('redirectMainWindow', (_event, args) => {
  LOGGER.log(LogLevel.INFO, 'Redirect Main Window to: ', args);
  mainWindow?.loadURL(resolveHtmlPath(args[0]));
});
