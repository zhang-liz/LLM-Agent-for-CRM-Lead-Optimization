/**
 * Preference learning from thumbs up/down feedback.
 * Bandit-style weight update: positive feedback boosts features, negative reduces them.
 * Derives stageWeights and sourceWeights from (leadId, outcomeType, metadata) pairs.
 */

const LEARNING_RATE = 0.15;
const SMOOTHING = 2;
const MIN_WEIGHT = 0.5;
const MAX_WEIGHT = 1.5;

/**
 * Compute learned weights for stage and source from feedback.
 * @param {Array} feedback - [{ leadId, outcomeType, metadata: { stage?, source? } }]
 * @returns {{ stageWeights: Object, sourceWeights: Object } | null}
 */
export function computeLearnedWeights(feedback) {
  const helpful = feedback.filter(f => f.outcomeType === 'helpful');
  const notHelpful = feedback.filter(f => f.outcomeType === 'not_helpful');

  if (helpful.length === 0 && notHelpful.length === 0) return null;

  const stageCounts = {};
  const sourceCounts = {};

  function ensureKey(counts, key) {
    if (!counts[key]) counts[key] = { pos: 0, neg: 0 };
  }

  for (const f of helpful) {
    const m = f.metadata || {};
    if (m.stage) {
      ensureKey(stageCounts, m.stage);
      stageCounts[m.stage].pos++;
    }
    if (m.source) {
      ensureKey(sourceCounts, m.source);
      sourceCounts[m.source].pos++;
    }
  }

  for (const f of notHelpful) {
    const m = f.metadata || {};
    if (m.stage) {
      ensureKey(stageCounts, m.stage);
      stageCounts[m.stage].neg++;
    }
    if (m.source) {
      ensureKey(sourceCounts, m.source);
      sourceCounts[m.source].neg++;
    }
  }

  const stageWeights = {};
  const sourceWeights = {};

  for (const [stage, { pos, neg }] of Object.entries(stageCounts)) {
    const total = pos + neg + SMOOTHING;
    const delta = (pos - neg) / total;
    const adj = LEARNING_RATE * delta;
    stageWeights[stage] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, 1 + adj));
  }

  for (const [source, { pos, neg }] of Object.entries(sourceCounts)) {
    const total = pos + neg + SMOOTHING;
    const delta = (pos - neg) / total;
    const adj = LEARNING_RATE * delta;
    sourceWeights[source] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, 1 + adj));
  }

  return {
    stageWeights: Object.keys(stageWeights).length > 0 ? stageWeights : null,
    sourceWeights: Object.keys(sourceWeights).length > 0 ? sourceWeights : null
  };
}

/**
 * Merge learned weights with existing config weights.
 * New learned values override; we keep existing for keys not in feedback.
 */
export function mergeWeights(existingStage, existingSource, learned) {
  const stageWeights = { ...(existingStage || {}) };
  const sourceWeights = { ...(existingSource || {}) };

  if (learned?.stageWeights) {
    for (const [k, v] of Object.entries(learned.stageWeights)) {
      stageWeights[k] = v;
    }
  }
  if (learned?.sourceWeights) {
    for (const [k, v] of Object.entries(learned.sourceWeights)) {
      sourceWeights[k] = v;
    }
  }

  return { stageWeights, sourceWeights };
}

// --- ML weight fitting (logistic regression from feedback) ---

const ML_FEATURE_KEYS = ['stage_prospect', 'stage_qualified', 'stage_opportunity', 'stage_customer', 'recency', 'count', 'sentiment', 'intent'];

function buildFeatureVecFromMetadata(metadata) {
  const m = metadata || {};
  const stage = m.stage || 'prospect';
  const stageIdx = ['prospect', 'qualified', 'opportunity', 'customer'].indexOf(stage);
  const stageOneHot = [0, 0, 0, 0];
  if (stageIdx >= 0) stageOneHot[stageIdx] = 1;

  const recency = typeof m.recencyNorm === 'number' ? m.recencyNorm : 0.5;
  const count = typeof m.countNorm === 'number' ? m.countNorm : 0.2;
  const sentiment = typeof m.sentimentNorm === 'number' ? m.sentimentNorm : 0.5;
  const intent = typeof m.intentNorm === 'number' ? m.intentNorm : 0;

  return [...stageOneHot, recency, count, sentiment, intent];
}

/**
 * Fit logistic regression weights from feedback with ML metadata.
 * @param {Array} feedback - entries with outcomeType helpful/not_helpful and metadata.recencyNorm, countNorm, sentimentNorm, intentNorm
 * @returns {Object|null} mlWeights or null if insufficient data
 */
export function fitMLWeightsFromFeedback(feedback) {
  const withML = feedback.filter(f => {
    const m = f.metadata || {};
    return (f.outcomeType === 'helpful' || f.outcomeType === 'not_helpful') &&
      typeof m.recencyNorm === 'number' && typeof m.countNorm === 'number';
  });
  if (withML.length < 3) return null;

  const X = withML.map(f => buildFeatureVecFromMetadata(f.metadata));
  const y = withML.map(f => f.outcomeType === 'helpful' ? 1 : 0);
  const dim = ML_FEATURE_KEYS.length + 1; // +1 bias
  let weights = { bias: -0.5, stage_prospect: 0, stage_qualified: 0.1, stage_opportunity: 0.3, stage_customer: 0.4, recency: 0.3, count: 0.2, sentiment: 0.3, intent: 0.4 };
  const lr = 0.3;
  const iters = 80;

  for (let iter = 0; iter < iters; iter++) {
    let gradBias = 0;
    const gradW = {};
    ML_FEATURE_KEYS.forEach(k => { gradW[k] = 0; });

    for (let i = 0; i < X.length; i++) {
      const vec = X[i];
      let z = weights.bias;
      for (let j = 0; j < ML_FEATURE_KEYS.length; j++) {
        z += (weights[ML_FEATURE_KEYS[j]] ?? 0) * (vec[j] ?? 0);
      }
      const p = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
      const err = p - y[i];
      gradBias += err;
      for (let j = 0; j < ML_FEATURE_KEYS.length; j++) {
        gradW[ML_FEATURE_KEYS[j]] += err * (vec[j] ?? 0);
      }
    }

    const n = X.length;
    weights.bias -= lr * (gradBias / n);
    for (const k of ML_FEATURE_KEYS) {
      weights[k] = (weights[k] ?? 0) - lr * (gradW[k] / n);
    }
  }

  return weights;
}
