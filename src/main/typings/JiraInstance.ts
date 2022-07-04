export interface JiraInstance {
  _id?: string;
  name: string;
  description: string;
  serverSize?: string;
  serverPath: string;
  homeSize?: string;
  homePath: string;
  quickReload: boolean;
  pid?: number;
  lastRunning?: string;
  isRunning: boolean;
}
