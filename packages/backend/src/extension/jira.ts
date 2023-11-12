import { Config } from '@backstage/config';
import JiraApi from 'jira-client';

let jiraInstance: JiraApi | null = null

function initializeJira(config: Config): JiraApi {
  if(!jiraInstance){
    jiraInstance = new JiraApi({
      protocol: 'https',
      host: 'goreply.atlassian.net',
      username: config.get("atlassian.username"),
      password: config.get("atlassian.token"),
      apiVersion: '2',
      strictSSL: true
    });
  }
  return jiraInstance
}

export {initializeJira, jiraInstance}