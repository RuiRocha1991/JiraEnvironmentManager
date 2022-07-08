import { JiraInstance } from '../typings/JiraInstance';
import mainDB from './db-main';
import { Logger, LogLevel } from '../util';

type JiraInstancesModel = {
  addJiraInstance: (jiraInstance: JiraInstance) => Promise<JiraInstance>;
  getJiraInstances: () => Promise<JiraInstance[]>;
  getInstanceById: (id: string) => Promise<JiraInstance>;
  getInstanceRunning: () => Promise<JiraInstance>;
  updateInstance: (jiraIntance: JiraInstance) => Promise<number>;
};

const LOGGER = new Logger('JiraInstances-Model');

const addJiraInstance = async (jiraInstance: JiraInstance) => {
  LOGGER.log(LogLevel.DEBUG, 'Add Jira instance: {0}', [jiraInstance]);
  try {
    jiraInstance.lastRunning = `${Date.now()}`;
    jiraInstance.pid = 0;
    const instance = await mainDB.jiraInstances.insert(jiraInstance);

    const environment = <JiraInstance>{
      // eslint-disable-next-line no-underscore-dangle
      _id: instance._id,
      name: instance.name,
      description: instance.description,
      serverPath: instance.serverPath,
      homePath: instance.homePath,
      quickReload: instance.quickReload,
      pid: instance.pid,
      lastRunning: instance.lastRunning,
      isRunning: instance.isRunning,
    };
    LOGGER.log(LogLevel.DEBUG, 'Add Jira instance: {0}', [environment]);
    return environment;
  } catch (e) {
    LOGGER.log(LogLevel.DEBUG, 'Add Jira instance: {0}', [jiraInstance]);
    throw new Error(`Add Jira instance: ${JSON.stringify(jiraInstance)}`);
  }
};

const getJiraInstances = async () => {
  LOGGER.log(LogLevel.DEBUG, 'Get Jira Instances');
  const instances = (await mainDB.jiraInstances.find({})) || {};
  LOGGER.log(LogLevel.DEBUG, 'Get Jira Instances: {0}', [instances]);
  return instances.map(
    (instance: any) =>
      <JiraInstance>{
        // eslint-disable-next-line no-underscore-dangle
        _id: instance._id,
        name: instance.name,
        description: instance.description,
        serverSize: instance.serverSize,
        serverPath: instance.serverPath,
        homeSize: instance.homeSize,
        homePath: instance.homePath,
        quickReload: instance.quickReload,
        pid: instance.pid,
        lastRunning: instance.lastRunning,
        isRunning: instance.isRunning,
      }
  );
};

const getInstanceById = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Instance By ID: {0}', [id]);
    const instance = (await mainDB.jiraInstances.findOne({ _id: id })) || {};
    LOGGER.log(LogLevel.DEBUG, 'Get Instance By ID: {0}', [instance]);
    return instance;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Instance By ID: {0}', [e.message]);
    throw e;
  }
};

const getInstanceRunning = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Instance Running');
    const instance =
      (await mainDB.jiraInstances.findOne({ isRunning: true })) || undefined;
    LOGGER.log(LogLevel.DEBUG, 'Get Instance Running: {0}', [instance]);
    return instance;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Instance Running: {0}', [e.message]);
    throw e;
  }
};

const updateInstance = async (jiraInstance: JiraInstance) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update instance {0}', [jiraInstance]);
    const rowsUpdated = await mainDB.jiraInstances.update(
      // eslint-disable-next-line no-underscore-dangle
      { _id: jiraInstance._id },
      { $set: { ...jiraInstance } },
      { upsert: true }
    );
    LOGGER.log(LogLevel.DEBUG, 'Instance Info Updated: {0} rows', [
      rowsUpdated,
    ]);
    return rowsUpdated;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Update Instance Info: {0} - {1}', [
      process,
      e.message,
    ]);
    throw e;
  }
};

const jiraInstancesModel: JiraInstancesModel = {
  addJiraInstance,
  getJiraInstances,
  getInstanceById,
  getInstanceRunning,
  updateInstance,
};

export default jiraInstancesModel;
