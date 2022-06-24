import { ipcMain } from 'electron';
import { Logger, LogLevel } from '../util';
import utilsService from '../services/utilsService';

type CommonListener = {
  on: () => void;
};

const LOGGER = new Logger('CommonListener');

const on = () => {
  ipcMain.on('loadJiraVersions', async (event) => {
    LOGGER.log(LogLevel.INFO, 'Load Jira Versions');
    const response = await utilsService.getJiraVersions();
    LOGGER.log(LogLevel.DEBUG, 'Load Jira Versions: {0}', [response]);
    event.reply('loadJiraVersions', { response });
  });
};

const commonListener: CommonListener = {
  on,
};

export default commonListener;
