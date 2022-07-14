/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { Logger, LogLevel, ProcessInfoTaskKeys } from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';
import jiraInstancesModel from '../db/jiraInstances-model';
import { ProcessInfo } from '../typings/ProcessInfo';
import processModel from '../db/process-model';
// eslint-disable-next-line import/no-cycle
import processService from './processService';
import { JiraInstance } from '../typings/JiraInstance';
import FileUtils from '../fileUtils';
import settingsService from './settingsService';

type JiraInstancesService = {
  getJiraInstances: () => Promise<ServiceResponse>;
  addNewInstance: (processInfo: ProcessInfo) => Promise<ServiceResponse>;
  getInstanceById: (id: string) => Promise<JiraInstance>;
  openEditor: (id: string) => void;
  startOrStopInstance: (id: string) => Promise<JiraInstance>;
  updateJiraInstance: (fields: any) => Promise<JiraInstance>;
  deleteInstance: (id: string) => Promise<void>;
};

const LOGGER = new Logger('JiraInstancesService');

const getJiraInstances = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Jira Instances');
    const instances = await jiraInstancesModel.getJiraInstances();
    const finalInstance = await Promise.all(
      instances.map(async (instance) => {
        const homeSize = FileUtils.convertSizeToHumanReadable(
          FileUtils.calculateFolderSize(`${instance.homePath}${instance.name}`)
        );
        const serverSize = FileUtils.convertSizeToHumanReadable(
          FileUtils.calculateFolderSize(
            `${instance.serverPath}${instance.name}`
          )
        );

        return <JiraInstance>{
          _id: instance._id,
          name: instance.name,
          description: instance.description,
          serverPath: instance.serverPath,
          homePath: instance.homePath,
          homeSize,
          serverSize,
          quickReload: instance.quickReload,
          pid: instance.pid,
          lastRunning: instance.lastRunning,
          isRunning: instance.isRunning,
        };
      })
    );
    const response = <ServiceResponse>{
      status: 'OK',
      data: finalInstance,
    };
    LOGGER.log(LogLevel.DEBUG, 'Get Jira Instances: {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Jira Instances: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on Get Jira Instances',
    };
  }
};

const addNewInstance = async (processInfo: ProcessInfo) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Add New Instance: {0}', [processInfo]);
    const { jiraInstance } = processInfo;

    let validatePath: string = path.join(
      jiraInstance.serverPath,
      jiraInstance.name
    );
    if (fs.existsSync(validatePath.toString())) {
      throw new Error('Server path already exist');
    }
    validatePath = path.join(jiraInstance.homePath, jiraInstance.name);
    if (fs.existsSync(validatePath.toString())) {
      throw new Error('Home path already exist');
    }
    processInfo.task = {
      ...processInfo.task,
      [ProcessInfoTaskKeys.START]: 100,
    };
    const response = <ServiceResponse>{
      status: 'OK',
      data: await processModel.create(processInfo),
    };
    processService.installInstance(<ProcessInfo>response.data);
    LOGGER.log(LogLevel.DEBUG, 'Add New Instance, Process info: {0}', [
      response,
    ]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Add New Instance: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: `Error on Add New Instance: ${e.message}`,
    };
  }
};

const getInstanceById = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Instance by ID: {0}', [id]);
    const instance = jiraInstancesModel.getInstanceById(id);
    LOGGER.log(LogLevel.DEBUG, 'Get Instance by ID: {0}', [instance]);
    return await instance;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Instance by ID: {0}', [e.message]);
    throw new Error(e);
  }
};

const openEditor = async (id: string) => {
  LOGGER.log(LogLevel.DEBUG, 'Open Editor: {0}', [id]);
  const instance = await jiraInstancesModel.getInstanceById(id);
  LOGGER.log(LogLevel.DEBUG, 'Open Editor: {0}', [instance]);
  const setEnvPath = path.join(
    instance.serverPath,
    instance.name,
    'bin',
    'setenv.sh'
  );
  LOGGER.log(LogLevel.DEBUG, 'Open Editor: {0}', [setEnvPath]);
  const command = `open -e ${setEnvPath}`;
  LOGGER.log(LogLevel.DEBUG, 'Open Editor: {0}', [command]);
  exec(command);
  LOGGER.log(LogLevel.DEBUG, 'Open Editor Done: {0}', [command]);
};

const isInstancesRunning = async () => {
  return (await jiraInstancesModel.getInstanceRunning()) !== undefined;
};

const startInstance = (instance: JiraInstance) => {
  return new Promise((resolve, reject) => {
    // start environment

    const command = spawn(`./catalina.sh`, [`jpda`, 'start'], {
      cwd: path.join(instance.serverPath, instance.name, 'bin/'),
    });

    command.on('error', async (error: any) => {
      LOGGER.log(LogLevel.ERROR, 'Start Instance: {0}', [error]);
      return reject(new Error(`Start Instance: ${JSON.stringify(error)}`));
    });

    command.stdout.on('data', (data: any) => {
      LOGGER.log(LogLevel.WARNING, 'Start Instance: {0}', [data.toString()]);
    });
    command.stderr.on('data', async (data: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Start Instance: {0}', [data.toString()]);
    });

    command.on('close', (code: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Start Instance Completed: {0}', [code]);
      if (code === 0) {
        return resolve(code);
      }
      return reject(new Error('Start Instance Canceled'));
    });
  });
};

const getPID = async (instance: JiraInstance) => {
  let psResult = '';
  return new Promise((resolve, reject) => {
    // start environment

    const command = spawn('ps', ['-ef'], {
      cwd: path.join(instance.serverPath, instance.name, 'bin/'),
    });

    command.on('error', async (error: any) => {
      LOGGER.log(LogLevel.ERROR, 'Start Instance: {0}', [error]);
      return reject(new Error(`Start Instance: ${JSON.stringify(error)}`));
    });

    command.stdout.on('data', (data: any) => {
      LOGGER.log(LogLevel.WARNING, 'Start Instance: {0}', [data.toString()]);
      psResult += data.toString();
    });
    command.stderr.on('data', async (data: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Start Instance: {0}', [data.toString()]);
    });

    command.on('close', (code: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Start Instance Completed: {0}', [code]);
      if (code === 0) {
        return resolve(code);
      }
      return reject(new Error('Start Instance Canceled'));
    });
  })
    .then(() => {
      let isSecondValue = false;
      let pid = '0';
      psResult
        .split('\n')
        .find((value) => value.includes(instance.serverPath))
        ?.split(' ')
        .forEach((value) => {
          if (/[0-9]+/.test(value)) {
            if (isSecondValue && parseInt(pid, 10) === 0) {
              pid = value.trim();
            }
            isSecondValue = true;
          }
        });
      return pid;
    })
    .catch((error) => {
      throw error;
    });
};

const isFileExists = (file: string) => {
  return fs.existsSync(file);
};

const openAppLogs = async (instance: JiraInstance) => {
  const file = path.join(instance.homePath, 'log', 'atlassian-jira.log');
  let fileExist = false;
  setTimeout(() => {
    if (!fileExist) {
      fileExist = isFileExists(file);
    }
  }, 2000);
  const terminalApp = await settingsService.getTerminalApp();
  const command = `open -a ${terminalApp} ${path.join(
    instance.homePath,
    instance.name,
    'log/'
  )}`;
  await new Promise((resolve, reject) => {
    exec(command, function (error, stdout) {
      resolve(stdout);
      if (error !== null) {
        console.log(error);
        reject(error);
      }
    });
  });
};

const stopJiraInstance = async (instance: JiraInstance) => {
  LOGGER.log(LogLevel.DEBUG, 'Stop Jira Instance: {0}', [instance]);
  return new Promise((resolve, reject) => {
    const command = spawn(`./catalina.sh`, [`stop`, '-force'], {
      cwd: path.join(instance.serverPath, instance.name, 'bin/'),
    });

    command.on('error', async (error: any) => {
      LOGGER.log(LogLevel.ERROR, 'Stop Jira Instance: {0}', [error]);
      return reject(new Error(`Stop Jira Instance: ${JSON.stringify(error)}`));
    });

    command.stdout.on('data', (data: any) => {
      LOGGER.log(LogLevel.WARNING, 'Stop Jira Instance: {0}', [
        data.toString(),
      ]);
    });
    command.stderr.on('data', async (data: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Stop Jira Instance: {0}', [data.toString()]);
    });

    command.on('close', (code: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Stop Jira Instance Completed: {0}', [code]);
      if (code === 0) {
        return resolve(code);
      }
      return reject(new Error('Stop Jira Instance Canceled'));
    });
  });
};

const startOrStopInstance = async (id: string) => {
  LOGGER.log(LogLevel.DEBUG, 'Start Or Stop Instance: {0}', [id]);
  // validar se existe alguma a correr
  const instance = await jiraInstancesModel.getInstanceById(id);
  LOGGER.log(LogLevel.DEBUG, 'Start Or Stop Instance: {0}', [instance]);
  if (instance.isRunning) {
    LOGGER.log(LogLevel.DEBUG, 'Stop Instance: {0}', [instance]);
    await stopJiraInstance(instance);
    instance.isRunning = false;
    instance.pid = 0;
    instance.lastRunning = `${Date.now()}`;
    await jiraInstancesModel.updateInstance(instance);
    return instance;
  }
  if (await isInstancesRunning()) {
    LOGGER.log(LogLevel.ERROR, 'Start Or Stop Instance: {0}', [instance]);
    // return an error
  }
  LOGGER.log(LogLevel.DEBUG, 'Start Instance: {0}', [instance]);
  await startInstance(instance);
  LOGGER.log(LogLevel.DEBUG, 'Started Instance: {0}', [instance]);
  const pid = await getPID(instance);
  LOGGER.log(LogLevel.DEBUG, 'Started Instance with PID: {0}', [pid]);
  instance.pid = parseInt(pid, 10);
  instance.isRunning = true;
  instance.lastRunning = `${Date.now()}`;
  await jiraInstancesModel.updateInstance(instance);
  await openAppLogs(instance);
  LOGGER.log(LogLevel.DEBUG, 'Started Instance and updated: {0}', [pid]);
  return instance;
};

const updateJiraInstance = async (fields: any) => {
  LOGGER.log(LogLevel.DEBUG, 'Update Instance: {0}', [fields]);
  const instance = await jiraInstancesModel.getInstanceById(fields.id);
  LOGGER.log(LogLevel.DEBUG, 'Update Instance: {0}', [instance]);
  instance.description = fields.description;
  LOGGER.log(LogLevel.DEBUG, 'Update Instance: descritpion updated');
  await jiraInstancesModel.updateInstance(instance);
  LOGGER.log(LogLevel.DEBUG, 'Instance Updated: {0}', [instance]);
  return instance;
};

const deleteInstanceDirectories = async (dirPath: string) => {
  await fs.rm(
    dirPath,
    {
      recursive: true,
    },
    (err) => {
      if (err) {
        LOGGER.log(LogLevel.ERROR, 'Delete directory: {0} - {1}', [
          dirPath,
          err,
        ]);
        return;
      }
      LOGGER.log(LogLevel.DEBUG, 'Directory Deleted: {0}', [dirPath]);
    }
  );
};

const deleteInstance = async (id: string) => {
  LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}', [id]);
  const instance = await getInstanceById(id);
  LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}', [instance]);
  if (instance.isRunning) {
    LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}, is running', [instance]);
    await stopJiraInstance(instance);
    LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}, Stopped', [instance]);
  }
  LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}, Delete directories', [
    instance,
  ]);
  await deleteInstanceDirectories(
    path.join(instance.serverPath, instance.name)
  );
  await deleteInstanceDirectories(path.join(instance.homePath, instance.name));
  LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}, Directories Deleted', [
    instance,
  ]);
  await jiraInstancesModel.deleteInstance(id);
  LOGGER.log(LogLevel.DEBUG, 'Delete Instance: {0}, Instance removed', [
    instance,
  ]);
};

const jiraInstancesService: JiraInstancesService = {
  getJiraInstances,
  addNewInstance,
  getInstanceById,
  openEditor,
  startOrStopInstance,
  updateJiraInstance,
  deleteInstance,
};

export default jiraInstancesService;
