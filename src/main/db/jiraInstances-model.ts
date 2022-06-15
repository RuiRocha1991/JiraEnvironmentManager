import { JiraInstance } from '../typings/JiraInstance';

const { jiraInstances } = require('./db-main');

type JiraInstancesModel = {
  addJiraInstance: (jiraInstance: JiraInstance) => Promise<JiraInstance>;
  getJiraInstances: () => Promise<JiraInstance[]>;
};

const addJiraInstance = async (jiraInstance: JiraInstance) => {
  const instance = await jiraInstances
    .insert(jiraInstance)
    .then(async (data: JiraInstance) => {
      return data;
    })
    .catch((e: Error) => {
      throw e;
    });
  return <JiraInstance>{
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
  };
};

const getJiraInstances = async () => {
  const instances = await jiraInstances.find({});

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

const jiraInstancesModel: JiraInstancesModel = {
  addJiraInstance,
  getJiraInstances,
};

export default jiraInstancesModel;
