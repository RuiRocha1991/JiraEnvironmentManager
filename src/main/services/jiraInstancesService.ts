import fs from 'fs';
import path from 'path';
import {Logger, LogLevel, ProcessInfoTaskKeys} from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';
import jiraInstancesModel from '../db/jiraInstances-model';
import { ProcessInfo } from '../typings/ProcessInfo';
import processModel from '../db/process-model';
import processService from './processService';

type JiraInstancesService = {
  getJiraInstances: () => Promise<ServiceResponse>;
  addNewInstance: (processInfo: ProcessInfo) => Promise<ServiceResponse>;
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

const jiraInstancesService: JiraInstancesService = {
  getJiraInstances,
  addNewInstance,
};

export default jiraInstancesService;
