/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import path from 'path';
import * as url from 'url';
import fs from 'fs';
import { app, dialog } from 'electron';
import winston from 'winston';

export const LogLevel = {
  INFO: 'info',
  DEBUG: 'debug',
  ERROR: 'error',
  WARNING: 'warn',
};

const isDev: boolean = process.env.NODE_ENV === 'development';
export const userDataPath: string = app.getPath('userData');
export const logDir: string = path.join(userDataPath, path.sep, 'logs');
export let logger: any;

export const StatusProgress = {
  STARTING: { name: 'Starting', isFinal: false, isError: false },
  ABORTED: { name: 'Aborted', isFinal: true, isError: true },
  PROCESSING: { name: 'Processing', isFinal: false, isError: false },
  FINISHED: { name: 'Finished', isFinal: true, isError: false },
  CANCELED: { name: 'Canceled', isFinal: true, isError: true },
};

export const ProcessInfoTaskKeys = {
  START: 'Start',
  DOWNLOAD: 'Download',
  CREATE_FOLDER: 'CreateFolder',
  UNZIP: 'Unzip',
  MOVE_FOLDER: 'MoveFolder',
  CLEAN_TEMP: 'CleanTemp',
};

export class Logger {
  file: string;

  constructor(file: string) {
    this.file = file;
  }

  log(level: string, message: string, args?: any[]) {
    let finalMessage: string;
    if (args) {
      finalMessage = message;
      args.forEach((arg, index) => {
        finalMessage = finalMessage.replace(`{${index}}`, JSON.stringify(arg));
      });
    } else {
      finalMessage = message;
    }
    logger.log({
      level,
      message: finalMessage,
      file: this.file,
    });
  }
}

export const loggerUtils: (
  level: string,
  message: string,
  file: string
) => void = (level: string, message: string, file: string) => {
  logger.log({ level, message, file });
};

const LOGGER = new Logger('Util');

export const resolveHtmlPath: (hashRoute: string) => string = (
  hashRoute: string
) => {
  LOGGER.log(LogLevel.DEBUG, 'Resolve HTML Path: {0}', [hashRoute]);
  const port = process.env.PORT || 1212;
  const devBasePath = `http://localhost:${port}${hashRoute}`;

  const startURL = isDev
    ? devBasePath
    : url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: hashRoute,
      });
  LOGGER.log(LogLevel.DEBUG, 'Resolved html Path: {0}', [startURL]);
  return startURL;
};

export const createLoggerUtil: () => void = async () =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve, reject) => {
    try {
      // Create the log directory if it does not exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }

      const logFormat = winston.format.printf((info) => {
        if (info.file) {
          return `${info.timestamp} [${info.file}] ${info.level}: ${info.message}`;
        }
        return `${info.timestamp} ${info.level}: ${info.message}`;
      });
      const logLevel = 'info'; // TODO create a function to get logo level to we change log levels in prod environment
      logger = winston.createLogger({
        level: isDev ? 'debug' : logLevel,
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          logFormat
        ),
        transports: [
          new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            maxFiles: 10,
            maxsize: 2000000,
            level: 'error', // only error or higher
          }),
          new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxFiles: 10,
            maxsize: 2000000,
          }),
        ],
      });

      // only on development it prints on console
      if (isDev) {
        logger.add(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              logFormat
            ),
          })
        );
      }
      LOGGER.log(LogLevel.INFO, 'Logger was created with success');
      resolve();
    } catch (e) {
      const options = {
        type: 'error',
        title: 'Error',
        message: 'Error creating the log folder. Please relaunch the app.',
        buttons: ['Close'],
      };
      dialog.showMessageBoxSync(options);
      reject();
    }
  });
