import { ipcMain } from 'electron';
import { logger, LogLevel } from '../util';
import settingsService from '../services/settingsService';

type LaunchListener = {
  on: () => void;
};

const FILE_NAME_CONST = 'LaunchListener';

const on = () => {
  ipcMain.on('isFirstLaunch', async (event) => {
    logger.log({
      level: LogLevel.INFO,
      message: 'Check if first launch',
      file: FILE_NAME_CONST,
    });
    const isFirstLaunch = await settingsService.isFirstLaunch();
    logger.log({
      level: LogLevel.DEBUG,
      message: `Is first launch: ${isFirstLaunch}`,
      file: FILE_NAME_CONST,
    });
    event.reply('isFirstLaunch', { isFirstLaunch });
  });
};

const launchListeners: LaunchListener = {
  on,
};

export default launchListeners;
