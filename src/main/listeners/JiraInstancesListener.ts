import { ipcMain } from 'electron';
import { Logger, LogLevel, ProcessInfoTaskKeys, StatusProgress } from '../util';
import jiraInstancesService from '../services/jiraInstancesService';
import { JiraInstance } from '../typings/JiraInstance';
import { ProcessInfo } from '../typings/ProcessInfo';
import { JiraVersionInfo } from '../typings/JiraVersionInfo';
import processService from '../services/processService';

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

  ipcMain.on('addNewInstance', async (event, args) => {
    LOGGER.log(LogLevel.INFO, 'Add New Instance: {0}', args);
    const jiraInstance = <JiraInstance>{
      serverPath: args[0].serverPath,
      homePath: args[0].homePath,
      name: args[0].name,
      description: args[0].description,
      quickReload: args[0].hasQuickReload,
      isRunning: false,
    };
    const jiraVersionInfo = <JiraVersionInfo>{
      zipUrl: args[0].jiraVersion.zipUrl,
      version: args[0].jiraVersion.version,
      size: args[0].jiraVersion.size,
    };
    const processInfo = <ProcessInfo>{
      status: StatusProgress.STARTING,
      jiraInstance,
      jiraVersionInfo,
      task: {
        [ProcessInfoTaskKeys.START]: 0,
        [ProcessInfoTaskKeys.DOWNLOAD]: 0,
        [ProcessInfoTaskKeys.CREATE_FOLDER]: 0,
        [ProcessInfoTaskKeys.UNZIP]: 0,
        [ProcessInfoTaskKeys.MOVE_FOLDER]: 0,
        [ProcessInfoTaskKeys.CLEAN_TEMP]: 0,
      },
    };
    const response = await jiraInstancesService.addNewInstance(processInfo);
    LOGGER.log(LogLevel.DEBUG, 'Add New Instance: {0}', [response]);
    event.reply('addNewInstance', { response });
  });

  ipcMain.on('fetchProcessInfo', async (event, args) => {
    LOGGER.log(LogLevel.INFO, 'Fetch Process Info');
    const response = await processService.getProcessById(args[0]);
    LOGGER.log(LogLevel.DEBUG, 'Fetch Process Info: {0}', [response]);
    event.reply('fetchProcessInfo', { response });
  });

  ipcMain.on('openEditFile', async (_event, args) => {
    LOGGER.log(LogLevel.INFO, 'Open Edit File to: {0}', args);
    jiraInstancesService.openEditor(args[0]);
  });

  ipcMain.on('deleteProcess', async (_event, args) => {
    LOGGER.log(LogLevel.INFO, 'Delete process: {0}', args);
    const response = processService.deleteProcessById(args[0]);
    LOGGER.log(LogLevel.DEBUG, 'Delete process: {0}', [response]);
  });

  ipcMain.on('cancelInstallNewInstance', async (event, args) => {
    LOGGER.log(LogLevel.INFO, 'Cancel Install New Intance: {0}', args);
    const response = await processService.cancelProcess(args[0]);
    event.reply('cancelInstallNewInstance', { response });
  });
};

const jiraInstancesListener: JiraInstancesListener = {
  on,
};

export default jiraInstancesListener;
