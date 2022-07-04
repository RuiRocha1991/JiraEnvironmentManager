/* eslint-disable no-underscore-dangle */
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
import { ServiceResponse } from '../typings/ServiceResponse';

type ProcessService = {
  installInstance: (processInfo: ProcessInfo) => void;
  getProcessById: (id: string) => Promise<ServiceResponse>;
  deleteProcessById: (id: string) => Promise<ServiceResponse>;
  updateProcess: (process: ProcessInfo) => Promise<ServiceResponse>;
  cancelProcess: (processId: string) => Promise<ServiceResponse>;
};

const TEMP_PATH = path.join(userDataPath, 'temp', path.sep);

const LOGGER = new Logger('ProcessService');

let downloadProcess: any = null;

const getProcessById = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Process By ID: {0}', [id]);
    const response = <ServiceResponse>{
      status: 'OK',
      data: await processModel.getById(id),
    };
    LOGGER.log(LogLevel.DEBUG, 'Get Process By ID: {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Process By ID: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: `Get Process By ID: ${e.message}`,
    };
  }
};

let mainProcess: ProcessInfo;

const downloadInstance = async () => {
  LOGGER.log(LogLevel.INFO, 'Download Instance: {0}', [
    mainProcess.jiraVersionInfo.zipUrl,
  ]);
  const finalSize = fileUtils.humanReadableToBytes(
    mainProcess.jiraVersionInfo.size
  );
  return new Promise((resolve, reject) => {
    downloadProcess = spawn(
      'curl',
      [
        `${mainProcess.jiraVersionInfo.zipUrl}`,
        '-L',
        '-o',
        `${TEMP_PATH}${mainProcess.jiraInstance.name}.tar.gz`,
      ],
      {
        cwd: TEMP_PATH,
      }
    );

    downloadProcess.on('error', async (error: any) => {
      LOGGER.log(LogLevel.ERROR, 'Download error: {0}', [error]);
      mainProcess.status = StatusProgress.ABORTED;
      mainProcess.message = `Install Instance: ${JSON.stringify(error)}`;
      await processModel.update(mainProcess);
      return reject(new Error(`Download error: ${JSON.stringify(error)}`));
    });

    downloadProcess.stdout.on('data', (data: any) => {
      LOGGER.log(LogLevel.WARNING, 'Download Progress: {0}', [data]);
    });
    downloadProcess.stderr.on('data', async (_data: any) => {
      const actualSize: number = await fileUtils.calculateFolderSize(TEMP_PATH);
      const result = Math.ceil((actualSize * 100) / finalSize);
      LOGGER.log(LogLevel.DEBUG, 'Download Progress: {0}', [result]);
      mainProcess.task[ProcessInfoTaskKeys.DOWNLOAD] =
        result < 100 ? result : 99;
    });

    downloadProcess.on('close', (code: any) => {
      LOGGER.log(LogLevel.DEBUG, 'Download completed {0}', [code]);
      if (code === 0) {
        return resolve(code);
      }
      return reject(new Error('Download Canceled'));
    });
  });
};

const createFolders = () => {
  LOGGER.log(LogLevel.DEBUG, 'Create Instance Folder');
  const serverPath = `${mainProcess.jiraInstance.serverPath}${mainProcess.jiraInstance.name}`;
  const homePath = `${mainProcess.jiraInstance.homePath}${mainProcess.jiraInstance.name}`;
  if (!fs.existsSync(serverPath)) {
    LOGGER.log(LogLevel.DEBUG, 'Create folder: {0}', [serverPath]);
    fs.mkdirSync(serverPath);
  }
  if (!fs.existsSync(homePath)) {
    LOGGER.log(LogLevel.DEBUG, 'Create folder: {0}', [homePath]);
    fs.mkdirSync(homePath);
  }
};

const unzip = () => {
  LOGGER.log(LogLevel.INFO, 'Unzip and Move to server folder: {0}', [
    mainProcess,
  ]);

  return new Promise((resolve, reject) => {
    const unzipProcess = spawn(
      'tar',
      [
        '--extract',
        '--file',
        `${TEMP_PATH}${mainProcess.jiraInstance.name}.tar.gz`,
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

const moveToServerFolder = async () => {
  LOGGER.log(LogLevel.INFO, 'Move to server folder: {0}', [mainProcess]);
  const tempDirectoryName = getDirectories()[0];
  try {
    await rename(
      `${TEMP_PATH}${tempDirectoryName}`,
      `${mainProcess.jiraInstance.serverPath}${mainProcess.jiraInstance.name}`
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

const updateListener = async () => {
  console.log('call update listener: ', Date.now());
  if (!mainProcess.status.isError) {
    if (!mainProcess.status.isFinal) {
      await processModel.update(mainProcess);
      setTimeout(() => {
        try {
          updateListener();
        } catch (e: any) {
          throw new Error(`The process was ${mainProcess.status.name}`);
        }
      }, 5000);
    }
  } else {
    throw new Error(`The process was ${mainProcess.status.name}`);
  }
};

const installInstance = async (processInfo: ProcessInfo) => {
  LOGGER.log(LogLevel.INFO, 'Install Instance: {0}', [processInfo]);
  if (!fs.existsSync(TEMP_PATH)) {
    LOGGER.log(LogLevel.DEBUG, 'Create temp PATH: {0}', [TEMP_PATH]);
    fs.mkdirSync(TEMP_PATH);
  }
  try {
    mainProcess = processInfo;
    mainProcess.status = StatusProgress.PROCESSING;
    updateListener();
    await downloadInstance();
    mainProcess.task[ProcessInfoTaskKeys.DOWNLOAD] = 100;
    createFolders();
    mainProcess.task[ProcessInfoTaskKeys.CREATE_FOLDER] = 100;
    await unzip();
    mainProcess.task[ProcessInfoTaskKeys.UNZIP] = 100;
    await moveToServerFolder();
    mainProcess.task[ProcessInfoTaskKeys.MOVE_FOLDER] = 100;
    cleanTempFolder();
    mainProcess.task[ProcessInfoTaskKeys.CLEAN_TEMP] = 100;
    const instance = await jiraInstancesModel.addJiraInstance(
      mainProcess.jiraInstance
    );

    mainProcess.status = StatusProgress.FINISHED;
    mainProcess.jiraInstanceID = instance._id;
    processModel.update(mainProcess);
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Install Instance: {0}', [e.message]);
    downloadProcess.kill();
    cleanTempFolder();
    if (!mainProcess.status.isError) {
      mainProcess.status = StatusProgress.ABORTED;
    }
    processModel.update(mainProcess);
  }
};

const deleteProcessById = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Delete Process By ID: {0}', [id]);
    const response = <ServiceResponse>{
      status: 'OK',
      data: await processModel.deleteProcess(id),
    };
    LOGGER.log(LogLevel.DEBUG, 'Delete Process By ID: {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Delete Process By ID: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: `Get Process By ID: ${e.message}`,
    };
  }
};

const updateProcess = async (process: ProcessInfo) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update Process: {0}', [process]);
    const response = <ServiceResponse>{
      status: 'OK',
      data: await processModel.update(process),
    };
    LOGGER.log(LogLevel.DEBUG, 'Update Process: {0}', [response]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Update Process: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: `Get Process By ID: ${e.message}`,
    };
  }
};

const cancelProcess = async (processId: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Cancel Process: {0}', [processId]);
    let response;
    if (!mainProcess.status.isFinal) {
      downloadProcess.kill();
      mainProcess.status = StatusProgress.CANCELED;
      mainProcess.message = 'Canceled By User';
      response = <ServiceResponse>{
        status: 'OK',
        data: await processModel.update(mainProcess),
      };
      LOGGER.log(LogLevel.DEBUG, 'Cancel Process: {0}', [response]);
    }
    response = <ServiceResponse>{
      status: 'NOK',
      message: 'Process was not canceled',
    };
    LOGGER.log(LogLevel.DEBUG, 'Process was not canceled');
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Cancel Process: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: `Cancel Process: ${e.message}`,
    };
  }
};

const processService: ProcessService = {
  installInstance,
  getProcessById,
  deleteProcessById,
  updateProcess,
  cancelProcess,
};

export default processService;
