export interface JiraInstance {
  _id?: string;
  name: string;
  description: string;
  serverSize?: number;
  serverPath: string;
  homeSize?: number;
  homePath: string;
  quickReload: boolean;
  pid?: number;
  lastRunning?: number;
  isRunning: boolean;
}
