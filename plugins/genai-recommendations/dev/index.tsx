import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { genaiRecommendationsPlugin, GenaiRecommendationsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(genaiRecommendationsPlugin)
  .addPage({
    element: <GenaiRecommendationsPage />,
    title: 'Root Page',
    path: '/genai-recommendations'
  })
  .render();
