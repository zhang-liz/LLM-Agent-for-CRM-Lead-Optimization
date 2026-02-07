const MAX_VERSIONS = 5;

const defaultConfig = {
  version: 1,
  scoringWeights: {
    recencyDecay: 0.1,
    emailWeight: 1.2,
    chatWeight: 1.0,
    supportWeight: 0.8,
    engagementBonusCap: 20
  },
  systemPrompt: 'You are a lead prioritization assistant. Given a list of leads with scores and context, suggest the top leads to contact and a brief recommended action for each.',
  updatedAt: new Date().toISOString()
};

let current = { ...defaultConfig };
const history = [{ ...defaultConfig }];

export function getConfig() {
  return { ...current };
}

export function getConfigHistory() {
  return history.map(c => ({ version: c.version, updatedAt: c.updatedAt }));
}

export function applyPatch(patch) {
  const allowedKeys = ['scoringWeights', 'systemPrompt'];
  const next = { ...current, version: current.version + 1, updatedAt: new Date().toISOString() };

  if (patch.scoringWeights && typeof patch.scoringWeights === 'object') {
    const weights = { ...current.scoringWeights };
    const wKeys = ['recencyDecay', 'emailWeight', 'chatWeight', 'supportWeight', 'engagementBonusCap'];
    wKeys.forEach(k => {
      if (typeof patch.scoringWeights[k] === 'number') weights[k] = patch.scoringWeights[k];
    });
    next.scoringWeights = weights;
  }
  if (patch.systemPrompt && typeof patch.systemPrompt === 'string' && patch.systemPrompt.length <= 2000) {
    next.systemPrompt = patch.systemPrompt;
  }

  current = next;
  history.push({ ...current });
  if (history.length > MAX_VERSIONS) history.shift();
  return current;
}

export function rollback(version) {
  const found = history.find(c => c.version === version);
  if (!found) return null;
  current = { ...found };
  return current;
}
