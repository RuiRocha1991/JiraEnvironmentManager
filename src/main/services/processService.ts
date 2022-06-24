import path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { rename } from 'fs/promises';
import { ProcessInfo } from '../typings/ProcessInfo';
import {
  Logger,
  LogLevel,
  ProcessInfoTaskKeys,
  StatusProgress,
  userDataPath,
} from '../util';
import processModel from '../db/process-model';
import jiraInstancesModel from '../db/jiraInstances-model';
import fileUtils from '../fileUtils';

type ProcessService = {
  installInstance: (processInfo: ProcessInfo) => void;
};

const TEMP_PATH = path.join(userDataPath, 'temp', path.sep);

const LOGGER = new Logger('ProcessService');

const downloadInstance = async (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.INFO, 'Download Instance: {0}', [
    processInfo.jiraVersionInfo.zipUrl,
  ]);
  const finalSize = fileUtils.humanReadableToBytes(
    processInfo.jiraVersionInfo.size
  );
  return new Promise((resolve, reject) => {
    const downloadProcess = spawn(
      'curl',
      [
        `${processInfo.jiraVersionInfo.zipUrl}`,
        '-L',
        '-o',
        `${TEMP_PATH}${processInfo.jiraInstance.name}.tar.gz`,
      ],
      {
        cwd: TEMP_PATH,
      }
    );

    downloadProcess.on('error', (error) => {
      LOGGER.log(LogLevel.ERROR, 'Download error: {0}', [error]);
      processInfo.status = StatusProgress.ABORTED;
      processInfo.message = `Install Instance: ${JSON.stringify(error)}`;
      processModel.update(processInfo);
      reject(new Error(`Download error: ${JSON.stringify(error)}`));
    });

    downloadProcess.stdout.on('data', (data) => {
      LOGGER.log(LogLevel.DEBUG, 'Download Progress: {0}', [data]);
    });
    downloadProcess.stderr.on('data', async (_data) => {
      const actualSize: number = await fileUtils.calculateFolderSize(TEMP_PATH);
      const result = Math.ceil((actualSize * 100) / finalSize);
      processInfo.task = {
        ...processInfo.task,
        [ProcessInfoTaskKeys.DOWNLOAD]: result < 100 ? result : 99,
      };
      processModel.update(processInfo);
      LOGGER.log(LogLevel.DEBUG, 'Download Progress: {0}%', [
        processInfo.task[ProcessInfoTaskKeys.DOWNLOAD],
      ]);
    });

    downloadProcess.on('close', (code) => {
      processInfo.task = {
        ...processInfo.task,
        [ProcessInfoTaskKeys.DOWNLOAD]: 100,
      };
      processModel.update(processInfo);
      LOGGER.log(LogLevel.DEBUG, 'Download completed {0}', [code]);
      resolve(code);
    });
  });
};

const createFolders = (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.DEBUG, 'Create Instance Folder');
  const serverPath = `${processInfo.jiraInstance.serverPath}${processInfo.jiraInstance.name}`;
  const homePath = `${processInfo.jiraInstance.homePath}${processInfo.jiraInstance.name}`;
  if (!fs.existsSync(serverPath)) {
    LOGGER.log(LogLevel.DEBUG, 'Create folder: {0}', [serverPath]);
    fs.mkdirSync(serverPath);
  }
  if (!fs.existsSync(homePath)) {
    LOGGER.log(LogLevel.DEBUG, 'Create folder: {0}', [homePath]);
    fs.mkdirSync(homePath);
  }
};

const unzip = (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.INFO, 'Unzip and Move to server folder: {0}', [
    processInfo,
  ]);

  return new Promise((resolve, reject) => {
    const unzipProcess = spawn(
      'tar',
      [
        '--extract',
        '--file',
        `${TEMP_PATH}${processInfo.jiraInstance.name}.tar.gz`,
        '-C',
        TEMP_PATH,
      ],
      {
        cwd: TEMP_PATH,
      }
    );

    unzipProcess.on('error', (error) => {
      LOGGER.log(LogLevel.ERROR, 'Unzip error: {0}', [error]);
      reject(new Error(`Download error: ${JSON.stringify(error)}`));
    });

    unzipProcess.stdout.on('data', (data) => {
      LOGGER.log(LogLevel.DEBUG, 'Unzip Progress: {0}', [data]);
    });
    unzipProcess.stderr.on('data', async (data) => {
      LOGGER.log(LogLevel.DEBUG, 'Unzip Progress: {0}', [data]);
    });

    unzipProcess.on('close', (code) => {
      LOGGER.log(LogLevel.DEBUG, 'Unzip completed {0}', [code]);
      resolve(code);
    });
  });
};

const getDirectories = () =>
  readdirSync(TEMP_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const moveToServerFolder = async (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.INFO, 'Move to server folder: {0}', [processInfo]);
  const tempDirectoryName = getDirectories()[0];
  try {
    await rename(
      `${TEMP_PATH}${tempDirectoryName}`,
      `${processInfo.jiraInstance.serverPath}${processInfo.jiraInstance.name}`
    );
    LOGGER.log(LogLevel.DEBUG, 'Move to server folder done');
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Move to server folder: {0}', [e.message]);
    throw e;
  }
};

const cleanTempFolder = async () => {
  LOGGER.log(LogLevel.INFO, 'Clean Temp Folder');
  try {
    fs.readdir(TEMP_PATH, (err, files) => {
      if (err) throw err;

      files.forEach((file: string) => {
        fs.unlink(path.join(TEMP_PATH, file), (error: any) => {
          if (err) throw error;
        });
      });
    });
    LOGGER.log(LogLevel.DEBUG, 'Clean Temp Folder Done');
  } catch (e) {
    LOGGER.log(LogLevel.ERROR, 'Clean Temp Folder: {0}', [e]);
    throw e;
  }
};

const installInstance = async (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.INFO, 'Install Instance: {0}', [processInfo]);
  if (!fs.existsSync(TEMP_PATH)) {
    LOGGER.log(LogLevel.DEBUG, 'Create temp PATH: {0}', [TEMP_PATH]);
    fs.mkdirSync(TEMP_PATH);
  }
  try {
    processInfo.status = StatusProgress.PROCESSING;
    processModel.update(processInfo);
    await downloadInstance(processInfo);
    createFolders(processInfo);
    processInfo.task = {
      ...processInfo.task,
      [ProcessInfoTaskKeys.CREATE_FOLDER]: 100,
    };
    processModel.update(processInfo);
    await unzip(processInfo);
    processInfo.task = {
      ...processInfo.task,
      [ProcessInfoTaskKeys.UNZIP]: 100,
    };
    processModel.update(processInfo);
    await moveToServerFolder(processInfo);
    processInfo.task = {
      ...processInfo.task,
      [ProcessInfoTaskKeys.MOVE_FOLDER]: 100,
    };
    processModel.update(processInfo);
    cleanTempFolder();
    processInfo.task = {
      ...processInfo.task,
      [ProcessInfoTaskKeys.CLEAN_TEMP]: 100,
    };

    const instance = await jiraInstancesModel.addJiraInstance(
      processInfo.jiraInstance
    );
    processInfo.status = StatusProgress.FINISHED;
    // eslint-disable-next-line no-underscore-dangle
    processInfo.jiraInstanceID = instance._id;
    processModel.update(processInfo);
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Install Instance: {0}', [e.message]);
    processInfo.status = StatusProgress.ABORTED;
    processInfo.message = `Install Instance: ${e.message}`;
    console.log(processInfo);
    processModel.update(processInfo);
  }
};

const processService: ProcessService = {
  installInstance,
};

export default processService;
