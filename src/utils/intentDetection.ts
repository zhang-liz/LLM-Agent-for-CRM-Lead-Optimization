/**
 * Client-side buyer intent detection (mirrors server logic for mock data).
 * Used to enrich mock interactions with intent signals.
 */

import type { IntentSignal } from '../types';

const PATTERNS: Array<{ intent: string; strength: 'high' | 'medium' | 'low'; patterns: RegExp[] }> = [
  { intent: 'demo_request', strength: 'high', patterns: [/request.*demo/i, /schedule.*demo/i, /interested in.*demo/i] },
  { intent: 'trial_signup', strength: 'high', patterns: [/trial/i, /try.*free/i] },
  { intent: 'pricing_view', strength: 'medium', patterns: [/pricing/i, /how much/i, /cost/i, /price/i, /budget/i] },
  { intent: 'case_study', strength: 'medium', patterns: [/case study/i, /success story/i, /similar.*company/i] },
  { intent: 'feature_inquiry', strength: 'medium', patterns: [/tell me more/i, /how does.*work/i, /features/i] },
  { intent: 'postpone', strength: 'low', patterns: [/postpone/i, /next quarter/i, /budget.*constraint/i] }
];

export function extractIntent(content: string, subject?: string): IntentSignal[] {
  const combined = [content, subject].filter(Boolean).join(' ');
  const signals: IntentSignal[] = [];

  for (const { intent, strength, patterns } of PATTERNS) {
    if (patterns.some(p => p.test(combined))) {
      signals.push({ intent, strength, source: 'content' });
    }
  }

  return signals;
}
