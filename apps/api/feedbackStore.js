const feedback = [];

export function addFeedback(entry) {
  const record = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    leadId: entry.leadId,
    outcomeType: entry.outcomeType || 'contacted',
    recommendationId: entry.recommendationId || null,
    metadata: entry.metadata || {},
    createdAt: new Date().toISOString()
  };
  feedback.push(record);
  return record;
}

export function getRecentFeedback(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return feedback.filter(f => new Date(f.createdAt) >= since);
}
