import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLearnedWeights, fitMLWeightsFromFeedback } from './feedbackLearning.js';

test('computeLearnedWeights increases positive stage/source weight', () => {
  const learned = computeLearnedWeights([
    { outcomeType: 'helpful', metadata: { stage: 'qualified', source: 'Website' } },
    { outcomeType: 'helpful', metadata: { stage: 'qualified', source: 'Website' } },
    { outcomeType: 'not_helpful', metadata: { stage: 'prospect', source: 'Cold Outreach' } }
  ]);

  assert.ok(learned);
  assert.ok(learned.stageWeights.qualified > 1);
  assert.ok(learned.sourceWeights.Website > 1);
});

test('fitMLWeightsFromFeedback returns weights when enough data exists', () => {
  const feedback = [
    { outcomeType: 'helpful', metadata: { stage: 'qualified', recencyNorm: 0.9, countNorm: 0.8, sentimentNorm: 0.7, intentNorm: 1 } },
    { outcomeType: 'not_helpful', metadata: { stage: 'prospect', recencyNorm: 0.2, countNorm: 0.1, sentimentNorm: 0.2, intentNorm: 0 } },
    { outcomeType: 'helpful', metadata: { stage: 'opportunity', recencyNorm: 0.7, countNorm: 0.6, sentimentNorm: 0.6, intentNorm: 0.5 } }
  ];
  const weights = fitMLWeightsFromFeedback(feedback);
  assert.ok(weights);
  assert.equal(typeof weights.bias, 'number');
});
