import { Logger, LogLevel } from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';
import jiraInstancesModel from '../db/jiraInstances-model';

type JiraInstancesService = {
  getJiraInstances: () => Promise<ServiceResponse>;
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

const jiraInstancesService: JiraInstancesService = {
  getJiraInstances,
};

export default jiraInstancesService;
