/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createApiRef } from '@backstage/core-plugin-api';

export type GenAIRecommendationInfo = {
  path: string;
  original: string;
  code: string;
  context?: string;
};

export type GenAIRecommendationList = {
  data: GenAIRecommendationInfo[];
};

export interface GenAIRecommendationsApi {
  /** Lists the ADRs at the provided url. */
  listTestRecommendations(options?: RequestInit): Promise<GenAIRecommendationList>;
  pushNewTest(options?: RequestInit): Promise<any>
}

/**
 * ApiRef for the AdrApi.
 *
 * @public
 */
export const genAIApiRef = createApiRef<GenAIRecommendationsApi>({
  id: 'plugin.genai.api',
});