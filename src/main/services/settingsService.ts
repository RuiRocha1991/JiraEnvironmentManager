import settingsModel from '../db/settings-model';
import { Settings } from '../typings/Settings';
import { Logger, LogLevel } from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';

type SettingsService = {
  isFirstLaunch: () => Promise<ServiceResponse>;
  updateFirstLaunch: () => Promise<ServiceResponse>;
  updateSettingsConfig: (settings: Settings) => Promise<ServiceResponse>;
  getAllSettings: () => Promise<ServiceResponse>;
  getTerminalApp: () => Promise<string>;
};

const LOGGER = new Logger('SettingsService');

const isFirstLaunch = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Is first Launch');
    const firstLaunch = <ServiceResponse>{
      status: 'OK',
      data: await settingsModel.getIsFirstLaunch(),
    };
    LOGGER.log(LogLevel.DEBUG, 'Is first Launch: {0}', [firstLaunch]);
    return firstLaunch;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Is first Launch: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on getting isFirstLaunch Setting',
    };
  }
};

const updateFirstLaunch = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update first Launch');
    await settingsModel.updateSettings(<Settings>{
      isFirstLaunch: false,
    });
    const response = <ServiceResponse>{
      status: 'OK',
      message: 'First launch updated',
    };
    LOGGER.log(LogLevel.DEBUG, 'Updated first Launch {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Updated first Launch {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on Update first Launch',
    };
  }
};

const updateSettingsConfig = async (settings: Settings) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update Settings Config');
    await settingsModel.updateSettings(settings);
    const response = <ServiceResponse>{
      status: 'OK',
      message: `Settings Configuration Updated`,
    };
    LOGGER.log(LogLevel.DEBUG, 'Updated Settings Configuration: {0}', [
      response,
    ]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Updated Settings Configuration: {0}', [
      e.message,
    ]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on Update first Launch',
    };
  }
};

const getAllSettings = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get all Settings');
    const response = <ServiceResponse>{
      status: 'OK',
      data: await settingsModel.getAllSettings(),
    };
    LOGGER.log(LogLevel.DEBUG, 'Get all Settings: {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get all Settings: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on Update first Launch',
    };
  }
};

const getTerminalApp = async () => {
  LOGGER.log(LogLevel.DEBUG, 'Get Terminal App');
  const terminalName = await settingsModel.getTerminalApp();
  LOGGER.log(LogLevel.DEBUG, 'Get Terminal App: {0}', [terminalName]);
  return terminalName;
};

const settingsService: SettingsService = {
  isFirstLaunch,
  updateFirstLaunch,
  updateSettingsConfig,
  getAllSettings,
  getTerminalApp,
};

export default settingsService;
