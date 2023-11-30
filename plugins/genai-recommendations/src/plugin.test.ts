import { genaiRecommendationsPlugin } from './plugin';

describe('genai-recommendations', () => {
  it('should export plugin', () => {
    expect(genaiRecommendationsPlugin).toBeDefined();
  });
});
