import { Settings } from '../typings/Settings';
import { Logger, LogLevel } from '../util';
import mainDB from './db-main';

type SettingsModel = {
  getIsFirstLaunch: () => Promise<boolean>;
  updateSettings: (setting: Settings) => Promise<number>;
  getAllSettings: () => Promise<Settings[]>;
  getTerminalApp: () => Promise<string>;
};

const LOGGER = new Logger('Settings-Model');

const getIsFirstLaunch = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Is First Launch');
    const { isFirstLaunch = true } = (await mainDB.settings.findOne({})) || {};
    LOGGER.log(LogLevel.DEBUG, 'Get Is First Launch: {0}', [isFirstLaunch]);
    return isFirstLaunch;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Is First Launch: {0}', [e.message]);
    throw e;
  }
};

const updateSettings = async (settings: Settings) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update Settings');
    const rowsUpdated = await mainDB.settings.update(
      {},
      { $set: { ...settings } },
      { upsert: true }
    );
    LOGGER.log(LogLevel.DEBUG, 'Settings Updated: {0} rows', [rowsUpdated]);
    return rowsUpdated;
  } catch (e: any) {
    LOGGER.log(LogLevel.DEBUG, 'Update Settings: {0} - {1}', [
      settings,
      e.message,
    ]);
    throw e;
  }
};

const getAllSettings = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get All Settings');
    const settings = (await mainDB.settings.findOne({})) || {};
    LOGGER.log(LogLevel.DEBUG, 'Get all settings: {0}', [settings]);
    return settings;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get all settings: {0}', [e.message]);
    throw e;
  }
};

const getTerminalApp = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Terminal App');
    const { terminalName = 'Terminal' } =
      (await mainDB.settings.findOne({})) || {};
    LOGGER.log(LogLevel.DEBUG, 'Get Terminal App: {0}', [terminalName]);
    return terminalName;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Terminal App: {0}', [e.message]);
    throw e;
  }
};

const settingsModel: SettingsModel = {
  getIsFirstLaunch,
  updateSettings,
  getAllSettings,
  getTerminalApp,
};

export default settingsModel;
