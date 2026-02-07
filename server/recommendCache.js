const TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

function hashPayload(payload) {
  const str = JSON.stringify(payload);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  }
  return String(h);
}

export function getCached(leads, teamMetrics) {
  const key = hashPayload({ leads: leads.map(l => l.id).sort(), teamMetrics: teamMetrics || {} });
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCached(leads, teamMetrics, result) {
  const key = hashPayload({ leads: leads.map(l => l.id).sort(), teamMetrics: teamMetrics || {} });
  cache.set(key, { result, expiresAt: Date.now() + TTL_MS });
}
