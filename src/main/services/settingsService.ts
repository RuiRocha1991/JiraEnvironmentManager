import settingsModel from '../db/settings-model';
import { Settings } from '../typings/Settings';

type SettingsService = {
  isFirstLaunch: () => Promise<boolean>;
  updateFirstLaunch: () => Promise<number>;
};

const isFirstLaunch = async () => {
  const firstLaunch = await settingsModel.getIsFirstLaunch();
  return firstLaunch;
};

const updateFirstLaunch = async () => {
  const rowsUpdated = settingsModel.updateSetting(<Settings>{
    isFirstLaunch: false,
  });
  return rowsUpdated;
};

const settingsService: SettingsService = {
  isFirstLaunch,
  updateFirstLaunch,
};

export default settingsService;
