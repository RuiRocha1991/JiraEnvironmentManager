import { Settings } from '../typings/Settings';
import { logger, LogLevel } from '../util';
import mainDB from './db-main';

const FILE_NAME_CONST = 'Settings-Model';

type SettingsModel = {
  getIsFirstLaunch: () => Promise<boolean>;
  updateSetting: (setting: Settings) => Promise<number>;
};

const getIsFirstLaunch = async () => {
  try {
    const { isFirstLaunch = true } = (await mainDB.settings.findOne({})) || {};
    return isFirstLaunch;
  } catch (e: any) {
    logger.log({
      level: LogLevel.ERROR,
      message: `Get Is First Launch: ${e.message}`,
      file: FILE_NAME_CONST,
    });
    throw e;
  }
};

const updateSetting = async (setting: Settings) => {
  try {
    const rowsUpdated = await mainDB.settings.update(
      {},
      { $set: { ...setting } },
      { upsert: true }
    );
    return rowsUpdated;
  } catch (e: any) {
    logger.log({
      level: LogLevel.ERROR,
      message: `Update Setting: ${JSON.stringify(setting)} - ${e.message}`,
      file: FILE_NAME_CONST,
    });
    throw e;
  }
};

const settingsModel: SettingsModel = {
  getIsFirstLaunch,
  updateSetting,
};

export default settingsModel;
