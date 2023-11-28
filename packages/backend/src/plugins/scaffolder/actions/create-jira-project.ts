import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';
import { jiraInstance } from '../../../extension/jira';


export const createNewJiraProjectAction = () => {
  return createTemplateAction({
    id: 'goreply:jira:project:create',
    schema: {
      input: z.object({
        name: z.string().describe('Project Name'),
        key: z.string().describe('Project Key'),
        leadEmail: z.string().describe('Lead Email')
      }),
      output: z.object({
        jiraProjectUrl: z.string().describe('Jira URL of the ticket')
      }),

    },

    async handler(ctx) {
      if (!jiraInstance) {
        ctx.logger.log("error", "Jira has not been configured correctly.")
        return
      }

      ctx.logger.log("info", "I am creating the Jira project.")

      const leadUser = (await jiraInstance.searchUsers({
        query: ctx.input.leadEmail
      }))[0]

      console.log(leadUser)

      const project = await jiraInstance.createProject({
        name: ctx.input.name,
        key: ctx.input.key,
        leadAccountId: leadUser.accountId,
        description: "description",
        projectTemplateKey: "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban",
        projectTypeKey: "software"
      })

      console.log(project)
      ctx.output('jiraProjectUrl', `https://my-idp.atlassian.net/browse/${project.key}`)
    }
  });
};