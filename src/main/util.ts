/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import path from 'path';
import * as url from 'url';
import fs from 'fs';
import { app, dialog } from 'electron';
import winston from 'winston';

const FILE_NAME_CONST = 'UTILS';

const isDev: boolean = process.env.NODE_ENV === 'development';

export const resolveHtmlPath: (hashRoute: string) => string = (
  hashRoute: string
) => {
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
  return startURL;
};

export const userDataPath: string = app.getPath('userData');
export const logDir: string = path.join(userDataPath, path.sep, 'logs');
export let logger: any;

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
      logger.log({
        level: 'info',
        message: 'Logger was created with success',
        file: FILE_NAME_CONST,
      });
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
