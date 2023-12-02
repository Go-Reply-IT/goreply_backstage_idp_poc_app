import { createRouter } from '@internal/plugin-genai-recommendations-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { CatalogClient } from '@backstage/catalog-client';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // Here is where you will add all of the required initialization code that
  // your backend plugin needs to be able to start!

  // The env contains a lot of goodies, but our router currently only
  // needs a logger
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  return await createRouter({
    logger: env.logger,
    config: env.config,
    reader: env.reader,
    catalogClient: catalogClient,
    identity: env.identity
  });
}