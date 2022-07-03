import fs from 'fs';
import path from 'path';
import { Logger, LogLevel, ProcessInfoTaskKeys } from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';
import jiraInstancesModel from '../db/jiraInstances-model';
import { ProcessInfo } from '../typings/ProcessInfo';
import processModel from '../db/process-model';
// eslint-disable-next-line import/no-cycle
import processService from './processService';
import { JiraInstance } from '../typings/JiraInstance';
import {exec} from "child_process";

type JiraInstancesService = {
  getJiraInstances: () => Promise<ServiceResponse>;
  addNewInstance: (processInfo: ProcessInfo) => Promise<ServiceResponse>;
  getInstaceById: (id: string) => Promise<JiraInstance>;
  openEditor: (id: string) => void;
};

const LOGGER = new Logger('JiraInstancesService');

const getJiraInstances = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Jira Instances');
    const response = <ServiceResponse>{
      status: 'OK',
      data: await jiraInstancesModel.getJiraInstances(),
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

const getInstaceById = async (id: string) => {
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

const jiraInstancesService: JiraInstancesService = {
  getJiraInstances,
  addNewInstance,
  getInstaceById,
  openEditor,
};

export default jiraInstancesService;
