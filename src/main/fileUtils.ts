/* eslint-disable @typescript-eslint/return-await */
import { readdirSync } from 'fs';
import path from 'path';
import * as fs from 'fs';

type FileUtils = {
  calculateFolderSize: (filePath: string) => number;
  convertSizeToHumanReadable: (size: number) => string;
  humanReadableToBytes: (size: string) => number;
  deleteTempFile: (filePath: string) => number;
};

const getAllFiles = (dirPath: string) => {
  const files = readdirSync(dirPath);
  const arrayOfFiles: string[] = [];
  files.forEach((file) => {
    const dir = path.join(dirPath, file);
    if (fs.statSync(dir).isDirectory()) {
      arrayOfFiles.push(...getAllFiles(dir));
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const calculateFolderSize = (directoryPath: string) => {
  const arrayOfFiles = getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach((filePath) => {
    totalSize += fs.statSync(filePath).size;
  });

  return totalSize;
};

const convertSizeToHumanReadable = (size: number) => {
  const decimals = 2;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(size) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  const finalSize = parseFloat((size / Math.pow(k, i)).toFixed(dm));
  return finalSize > 0 ? `${finalSize} ${sizes[i]}` : `0 ${sizes[0]}`;
};

const KB_FACTOR = 1024;
const MB_FACTOR = 1024 * KB_FACTOR;
const GB_FACTOR = 1024 * MB_FACTOR;

const humanReadableToBytes = (size: string) => {
  const spaceNdx: number = size.indexOf(' ');
  const rest: number = Number.parseInt(size.substring(0, spaceNdx), 10);

  switch (size.substring(spaceNdx + 1)) {
    case 'GB':
      return rest * GB_FACTOR;
    case 'MB':
      return rest * MB_FACTOR;
    case 'KB':
      return rest * KB_FACTOR;
    default:
      return -1;
  }
};

const deleteTempFile = () => {
  return 1;
};

const fileUtils: FileUtils = {
  calculateFolderSize,
  convertSizeToHumanReadable,
  humanReadableToBytes,
  deleteTempFile,
};

export default fileUtils;
