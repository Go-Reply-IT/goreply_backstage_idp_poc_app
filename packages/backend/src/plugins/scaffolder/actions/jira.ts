import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';
import { jiraInstance } from '../../../extension/jira';


export const createNewJiraTicketAction = () => {
  return createTemplateAction({
    id: 'goreply:ticket:create',
    schema: {
      input: z.object({
        title: z.string().describe('Title of the ticket'),
        description: z
          .string()
          .describe('Description of the ticket'),
      }),
      output: z.object({
        jiraIssueUrl: z.string().describe('Jira URL of the ticket'),
      }),

    },

    async handler(ctx) {
      if (!jiraInstance) {
        ctx.logger.log("error", "Jira non è stato confgiurato correttamente")
        return
      }

      ctx.logger.log("info", "Creo un nuovo Ticket Jira...")

      const issue = await jiraInstance.addNewIssue({
        fields: {
          project: {
            key: "IDP"
          },
          summary: ctx.input.title,
          description: ctx.input.description,
          issuetype: {
            name: "Bug"
          }
        }
      })

      ctx.output('jiraIssueUrl', `https://goreply.atlassian.net/browse/${issue.key}`)

      ctx.logger.log("info", "Ticket creato con successo")
    },
  });
};