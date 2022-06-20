import { ipcMain } from 'electron';
import { Logger, LogLevel } from '../util';
import jiraInstancesService from '../services/jiraInstancesService';

type JiraInstancesListener = {
  on: () => void;
};

const LOGGER = new Logger('JiraInstancesListener');

const on = () => {
  ipcMain.on('loadJiraInstances', async (event) => {
    LOGGER.log(LogLevel.INFO, 'Load Jira Instances');
    const response = await jiraInstancesService.getJiraInstances();
    LOGGER.log(LogLevel.DEBUG, 'Load Jira Instances: {0}', [response]);
    event.reply('loadJiraInstances', { response });
  });
};

const jiraInstancesListener: JiraInstancesListener = {
  on,
};

export default jiraInstancesListener;
