import { createApiFactory,discoveryApiRef, fetchApiRef,createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import {GenAIClient, genAIApiRef} from '../api'

export const genaiRecommendationsPlugin = createPlugin({
  id: 'genai-recommendations',
  apis: [
    createApiFactory({
      api: genAIApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new GenAIClient({ discoveryApi, fetchApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const GenAIRecommendationsTestContent = genaiRecommendationsPlugin.provide(
  createRoutableExtension({
    name: 'GenAIRecommendationsTestContent',
    component: () =>
      import('./components/GenAIRecommendationsContent').then(m => m.GenAIRecommendationsTestContent),
    mountPoint: rootRouteRef,
  }),
);
