import { readdir, stat } from 'fs/promises';
import path from 'path';

type FileUtils = {
  calculateFolderSize: (filePath: string) => Promise<number>;
  convertSizeToHumanReadable: (size: number) => string;
  humanReadableToBytes: (size: string) => number;
  deleteTempFile: (filePath: string) => number;
};

const calculateFolderSize = async (filePath: string) => {
  const files = await readdir(filePath);
  const stats = files.map((file) => stat(path.join(filePath, file)));

  return (await Promise.all(stats)).reduce(
    (accumulator, { size }) => accumulator + size,
    0
  );
};

const convertSizeToHumanReadable = (size: number) => {
  const decimals = 2;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(size) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((size / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
