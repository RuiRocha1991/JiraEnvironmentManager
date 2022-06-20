import { ipcMain } from 'electron';
import { Logger, LogLevel } from '../util';
import settingsService from '../services/settingsService';
import { Settings } from '../typings/Settings';

type SettingsListener = {
  on: () => void;
};

const LOGGER = new Logger('SettingsListener');

const on = () => {
  ipcMain.on('getSettings', async (event) => {
    LOGGER.log(LogLevel.INFO, 'Get All Settings');
    const response = await settingsService.getAllSettings();
    LOGGER.log(LogLevel.DEBUG, 'Get All Settings: {0}', [response]);
    event.reply('getSettings', { response });
  });

  ipcMain.on('updateFirstLaunch', async (event) => {
    LOGGER.log(LogLevel.INFO, 'Update First Launch');
    const response = await settingsService.updateFirstLaunch();
    LOGGER.log(LogLevel.DEBUG, 'Update First Launch: {0}`', [response]);
    event.reply('updateFirstLaunch', { response });
  });

  ipcMain.on('updateSettingsConfig', async (event, args) => {
    LOGGER.log(LogLevel.INFO, 'Update Settings Config');
    const settings = <Settings>{
      serverPath: args.serverPath,
      homePath: args.homePath,
      memoryMin: args.memoryMin,
      memoryMax: args.memoryMax,
      quickReloadPath: args.quickReloadPath,
      terminalName: args.terminalName,
    };
    const response = await settingsService.updateSettingsConfig(settings);
    LOGGER.log(LogLevel.DEBUG, 'Settings Configuration Updated: {0}', [
      response,
    ]);
    event.reply('updateSettingsConfig', response);
  });
};

const settingsListener: SettingsListener = {
  on,
};

export default settingsListener;
