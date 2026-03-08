import { describe, expect, it } from 'vitest';
import { analyzeSentiment, calculateEngagementScore } from './sentimentAnalysis';

describe('analyzeSentiment', () => {
  it('marks clearly positive text as positive', () => {
    const result = analyzeSentiment('Excellent product and awesome support');
    expect(result.sentiment).toBe('positive');
    expect(result.score).toBeGreaterThan(0);
  });
});

describe('calculateEngagementScore', () => {
  it('returns bounded score for interactions', () => {
    const score = calculateEngagementScore([
      { content: 'Great demo and definitely interested', timestamp: new Date(), type: 'email' },
      { content: 'Can we talk pricing?', timestamp: new Date(), type: 'chat' }
    ]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
