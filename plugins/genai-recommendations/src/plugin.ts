import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const genaiRecommendationsPlugin = createPlugin({
  id: 'genai-recommendations',
  routes: {
    root: rootRouteRef,
  },
});

export const GenAIRecommendationsContent = genaiRecommendationsPlugin.provide(
  createRoutableExtension({
    name: 'GenAIRecommendationsContent',
    component: () =>
      import('./components/GenAIRecommendationsContent').then(m => m.GenAIRecommendationsContent),
    mountPoint: rootRouteRef,
  }),
);
