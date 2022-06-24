import childProcess from 'child_process';
import { Logger, LogLevel } from '../util';
import { ServiceResponse } from '../typings/ServiceResponse';
import { JiraVersionInfo } from '../typings/JiraVersionInfo';

const { exec } = childProcess;
type UtilsService = {
  getJiraVersions: () => Promise<ServiceResponse>;
};

const LOGGER = new Logger('UtilsService');

const rawToJson = (result: string) => {
  const jiraVersionsRaw = result
    .slice(result.indexOf('downloads([{"'), result.length)
    .replace('downloads([', '[')
    .replace('"}])', '"}]');
  return JSON.parse(jiraVersionsRaw);
};

const getCurrentVersions = async () => {
  const command: string =
    'curl -i -H "Accept: application/json" -H "Content-Type: ' +
    'application/json" -X GET https://my.atlassian' +
    '.com/download/feeds/current/jira-software.json';

  const result: string = await new Promise((resolve, reject) => {
    exec(command, function (error, stdout) {
      resolve(stdout);
      if (error !== null) {
        reject();
      }
    });
  });
  return rawToJson(result);
};

const getArchivedVersions = async () => {
  const command: string =
    'curl -i -H "Accept: application/json" -H "Content-Type: ' +
    'application/json" -X GET https://my.atlassian' +
    '.com/download/feeds/archived/jira-software.json';

  const result: string = await new Promise((resolve, reject) => {
    exec(command, function (error, stdout) {
      resolve(stdout);
      if (error !== null) {
        reject();
      }
    });
  });
  return rawToJson(result);
};

const isSupported = (version: string) => {
  const vMajor = parseInt(version.split('.')[0], 10);
  const vMinor = parseInt(version.split('.')[1], 10);
  return vMajor > 8 || (vMajor === 8 && vMinor >= 0);
};

const mapJiraVersions = (jiraVersionsRaw: any[]) => {
  const jiraVersionsFilteredBySoAndSupported = jiraVersionsRaw
    .filter(
      (jira) => jira.platform === 'Unix, Mac OS X' && isSupported(jira.version)
    )
    .map(
      (jira) =>
        <JiraVersionInfo>{
          zipUrl: jira.zipUrl,
          version: jira.version,
          size: jira.size,
        }
    );
  const map: any = {};
  jiraVersionsFilteredBySoAndSupported.forEach((jiraInfo) => {
    const vMajor = `V ${jiraInfo.version.split('.')[0]}`;
    const vMinor = `V ${jiraInfo.version.split('.')[0]}.${
      jiraInfo.version.split('.')[1]
    }`;

    let jiraMajors: any = {};
    let jiraMinors: JiraVersionInfo[] = [];
    if (map[vMajor]) {
      jiraMajors = map[vMajor];
      if (jiraMajors[vMinor]) {
        jiraMinors = jiraMajors[vMinor];
      } else {
        jiraMinors = [];
      }
    } else {
      jiraMajors = {};
      jiraMinors = [];
    }
    jiraMinors.push(jiraInfo);
    jiraMajors[vMinor] = jiraMinors;
    map[vMajor] = jiraMajors;
  });

  const mapOrdered = Object.keys(map)
    .sort((a: any, b: any) => b - a)
    .reduce((obj: any, key: string) => {
      const minorsOrdered = Object.keys(map[key])
        .sort((a: any, b: any) => b.split('.')[1] - a.split('.')[1])
        .reduce((minorObj: any, minorKey: string) => {
          minorObj[minorKey] = map[key][minorKey].sort(
            (a: any, b: any) =>
              b.version.split('.')[2] - a.version.split('.')[2]
          );
          return minorObj;
        }, {});
      obj[key] = minorsOrdered;
      return obj;
    }, {});
  return mapOrdered;
};

const loadJiraVersions = async () => {
  const [currentVersions, archivedVersions] = await Promise.all([
    getCurrentVersions(),
    getArchivedVersions(),
  ]);
  const jiraVersionRaw = [...currentVersions, ...archivedVersions];

  return mapJiraVersions(jiraVersionRaw);
};

const getJiraVersions = async () => {
  try {
    LOGGER.log(LogLevel.DEBUG, 'Load Jira Versions');
    const data = await loadJiraVersions();
    const response = <ServiceResponse>{
      status: 'OK',
      data,
    };
    LOGGER.log(LogLevel.DEBUG, 'Load Jira Versions: {0}', [data]);
    return response;
  } catch (e: any) {
    LOGGER.log(LogLevel.ERROR, 'Load Jira Versions: {0}', [e.message]);
    return <ServiceResponse>{
      status: 'NOK',
      message: 'Error on Get Jira Instances',
    };
  }
};

const utilsService: UtilsService = {
  getJiraVersions,
};

export default utilsService;
