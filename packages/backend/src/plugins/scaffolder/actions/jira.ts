import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import { z } from 'zod';
import { jiraInstance } from '../../../extension/jira';


export const createNewJiraTicketAction = () => {
  return createTemplateAction({
    id: 'goreply:ticket:create',
    schema: {
      input: z.object({
        key: z.string().describe('ID of an already created ticket').optional(),
        title: z.string().describe('Title of the ticket').optional(),
        description: z
          .string()
          .describe('Description of the ticket').optional(),
        type: z.string().describe('Type of the ticket').optional(),
        status: z.string().describe('Status of the ticket').optional(),
      }),
      output: z.object({
        jiraIssueUrl: z.string().describe('Jira URL of the ticket'),
        key: z.string().describe('ID of the ticket'),
      }),

    },

    async handler(ctx) {
      if (!jiraInstance) {
        ctx.logger.log("error", "Jira has not been configured correctly.")
        return
      }

      ctx.input.type = ctx.input.type == undefined ? "10563" : ctx.input.type

      ctx.logger.log("info", "I am declaring the task in Jira.")

      let issue

      if(!ctx.input.key) {
        issue = await jiraInstance.addNewIssue({
          fields: {
            project: {
              key: "IDP"
            },
            summary: ctx.input.title,
            description: ctx.input.description,
            issuetype: {
              id: ctx.input.type
            }
          }
        })
        ctx.output('jiraIssueUrl', `https://goreply.atlassian.net/browse/${issue.key}`)
        ctx.output('key', issue.key)
      } else {
        if(!ctx.input.status) {
          ctx.logger.log("error", "Unable to move the ticket, desired status not specified.")
          return
        }

        issue = await jiraInstance.transitionIssue(ctx.input.key, {
          transition: {
            id: ctx.input.status
          }
        })

      }
    }
  });
};