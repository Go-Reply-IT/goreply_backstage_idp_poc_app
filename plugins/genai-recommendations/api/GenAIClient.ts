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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { GenAIRecommendationsApi, GenAIRecommendationList } from './types';

/**
 * Options for creating an AdrClient.
 *
 * @public
 */
export interface GenAIClientOptions {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

const listTestEndpoint = 'unit_test';
const pushTestEndpoint = 'pushTests';

/**
 * An implementation of the AdrApi that communicates with the ADR backend plugin.
 *
 * @public
 */
export class GenAIClient implements GenAIRecommendationsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: GenAIClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async fetchGenAIApi<T>(endpoint: string, options: RequestInit): Promise<T> {
    const baseUrl = await this.discoveryApi.getBaseUrl('genai');
    const targetUrl = `${baseUrl}/${endpoint}`;

    const result = await this.fetchApi.fetch(targetUrl, options);
    const data = await result.json();

    if (!result.ok) {
      throw new Error(`${data.message}`);
    }
    return data;
  }

  async listTestRecommendations(options?: RequestInit): Promise<GenAIRecommendationList> {
    return this.fetchGenAIApi<GenAIRecommendationList>(listTestEndpoint, options || {});
  }

  async pushNewTest(options?: RequestInit): Promise<any> {
    return this.fetchGenAIApi<any>(pushTestEndpoint, options || {});
  }
}