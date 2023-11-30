import {
  createRouter,
  buildTechInsightsContext,
  createFactRetrieverRegistration
} from '@backstage/plugin-tech-insights-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { FactRetriever } from '@backstage/plugin-tech-insights-node';
import { JSON_RULE_ENGINE_CHECK_TYPE, JsonRulesEngineFactCheckerFactory } from '@backstage/plugin-tech-insights-backend-module-jsonfc';
import { CatalogClient } from '@backstage/catalog-client';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const myFactRetriever: FactRetriever = {
    id: 'documentation-number-factretriever', // unique identifier of the fact retriever
    version: '0.1.1', // SemVer version number of this fact retriever schema. This should be incremented if the implementation changes
    entityFilter: [{ kind: 'component' }], // EntityFilter to be used in the future (creating checks, graphs etc.) to figure out which entities this fact retrieves data for.
    schema: {
      // Name/identifier of an individual fact that this retriever returns
      examplenumberfact: {
        type: 'integer', // Type of the fact
        description: 'A fact of a number', // Description of the fact
      },
    },
    handler: async ctx => {
      // Handler function that retrieves the fact
      const { discovery, config, logger } = ctx;
      const catalogClient = new CatalogClient({
        discoveryApi: discovery,
      });
      const entities = await catalogClient.getEntities({
        filter: [{ kind: 'component' }],
      });
      /**
      * snip: Do complex logic to retrieve facts from external system or calculate fact values
      */

      // Respond with an array of entity/fact values
      return entities.items.map(it => {
        return {
          // Entity information that this fact relates to
          entity: {
            namespace: it.metadata.namespace,
            kind: it.kind,
            name: it.metadata.name,
          },

          // All facts that this retriever returns
          facts: {
            examplenumberfact: 3, //
          },
          // (optional) timestamp to use as a Luxon DateTime object
        };
      });
    },
  };
  const myFactRetrieverRegistration = createFactRetrieverRegistration({
    cadence: '* * * * * ', // On the first minute of the second day of the month
    factRetriever: myFactRetriever,
  });

  const myFactCheckerFactory = new JsonRulesEngineFactCheckerFactory({
    logger: env.logger,
    checks: [
      {
        id: 'exampleNumberCheck',
        type: JSON_RULE_ENGINE_CHECK_TYPE,
        name: 'Example Number Check',
        description: 'Verifies that the example number is larger is equal to 3.',
        factIds: ['documentation-number-factretriever'],
        rule: {
          conditions: {
            all: [
              {
                fact: 'examplenumberfact',
                operator: 'equal',
                value: 3,
              },
            ],
          },
        },
      },
     ],
  })

  const builder = buildTechInsightsContext({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    scheduler: env.scheduler,
    tokenManager: env.tokenManager,
    factRetrievers: [myFactRetrieverRegistration], // Fact retrievers registrations you want tech insights to use, we'll add these in the next step
    factCheckerFactory: myFactCheckerFactory // Fact checker, we'll add this in the next steps
  });

  return await createRouter({
    ...(await builder),
    logger: env.logger,
    config: env.config,
  });

}
