import { JiraInstance } from './JiraInstance';
import { JiraVersionInfo } from './JiraVersionInfo';

export interface ProcessInfo {
  _id?: string;
  task?: any;
  status: any;
  jiraInstance: JiraInstance;
  message?: string;
  jiraVersionInfo: JiraVersionInfo;
  jiraInstanceID?: string;
}
