import { Logger, LogLevel } from '../util';
import mainDB from './db-main';
import { ProcessInfo } from '../typings/ProcessInfo';

type ProcessModel = {
  create: (process: ProcessInfo) => Promise<ProcessInfo>;
  update: (process: ProcessInfo) => Promise<number>;
  getById: (id: string) => Promise<ProcessInfo>;
  deleteProcess: (id: string) => void;
};

const LOGGER = new Logger('Process-Model');

const create = async (process: ProcessInfo) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Create Process');
    const processInfo = await mainDB.process.insert(process);
    LOGGER.log(LogLevel.DEBUG, 'Create Process: {0}', [processInfo]);
    return processInfo;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Create Process: {0}', [e.message]);
    throw e;
  }
};

const update = async (process: ProcessInfo) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Update Process Info {0}', [process]);
    const rowsUpdated = await mainDB.process.update(
      // eslint-disable-next-line no-underscore-dangle
      { _id: process._id },
      { $set: { ...process } },
      { upsert: true }
    );
    LOGGER.log(LogLevel.DEBUG, 'Process Info Updated: {0} rows', [rowsUpdated]);
    return rowsUpdated;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Update Process Info: {0} - {1}', [
      process,
      e.message,
    ]);
    throw e;
  }
};

const getById = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Get Process By ID: {0}', [id]);
    const process = (await mainDB.process.findOne({ _id: id })) || {};
    LOGGER.log(LogLevel.DEBUG, 'Get Process By ID: {0}', [process]);
    return process;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Get Process By ID: {0}', [e.message]);
    throw e;
  }
};

const deleteProcess = async (id: string) => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Delete Process');
    const rows = (await mainDB.process.remove({ _id: id })) || {};
    LOGGER.log(LogLevel.DEBUG, 'Delete Process: {0}', [rows]);
    return rows;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Delete Process: {0}', [e.message]);
    throw e;
  }
};

const processModel: ProcessModel = {
  create,
  update,
  getById,
  deleteProcess,
};

export default processModel;
