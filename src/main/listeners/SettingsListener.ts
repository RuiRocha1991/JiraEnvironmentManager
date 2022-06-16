import { ipcMain } from 'electron';
import { logger } from '../util';
import settingsService from '../services/settingsService';

type SettingsListener = {
  on: () => void;
};

const FILE_NAME_CONST = 'SettingsListener';

const on = () => {
  ipcMain.on('updateFirstLaunch', async (_event) => {
    logger.log({
      level: 'info',
      message: 'Update First Launch',
      file: FILE_NAME_CONST,
    });
    await settingsService.updateFirstLaunch();
  });
};

const settingsListener: SettingsListener = {
  on,
};

export default settingsListener;
