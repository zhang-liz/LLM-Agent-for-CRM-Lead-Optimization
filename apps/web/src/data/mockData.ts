import type { Lead, Interaction, ScoreHistory, TeamMetrics } from '@leadloop/shared';
import { calculateEngagementScore, getScoreTrend, type AttributionOptions } from '../utils/sentimentAnalysis';
import { extractIntent } from '../utils/intentDetection';

function enrichWithIntent(i: Omit<Interaction, 'intentSignals'>): Interaction {
  const intentSignals = extractIntent(i.content, i.metadata?.subject);
  return { ...i, intentSignals };
}

// Mock interaction data (enriched with intent signals)
const sampleInteractions: Interaction[] = [
  enrichWithIntent({
    id: '1',
    leadId: 'lead1',
    type: 'email',
    content: 'Thank you for the demo! I was really impressed with the features. Our team is excited to move forward.',
    sentiment: 'positive',
    sentimentScore: 0.8,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: 'email',
    metadata: { subject: 'Re: Product Demo Follow-up' }
  }),
  enrichWithIntent({
    id: '2',
    leadId: 'lead1',
    type: 'chat',
    content: 'Hi! Can you tell me more about pricing options?',
    sentiment: 'neutral',
    sentimentScore: 0.2,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    source: 'website_chat'
  }),
  enrichWithIntent({
    id: '3',
    leadId: 'lead2',
    type: 'email',
    content: 'I\'m not sure this is the right fit for us. The pricing seems too high for our budget.',
    sentiment: 'negative',
    sentimentScore: -0.6,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    source: 'email',
    metadata: { subject: 'Re: Pricing Inquiry' }
  }),
  enrichWithIntent({
    id: '4',
    leadId: 'lead3',
    type: 'support_ticket',
    content: 'The trial is working great so far. Love the user interface and the reporting features!',
    sentiment: 'positive',
    sentimentScore: 0.7,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    source: 'support_portal'
  }),
  enrichWithIntent({
    id: '5',
    leadId: 'lead4',
    type: 'email',
    content: 'We need to postpone our decision for another quarter. Budget constraints.',
    sentiment: 'neutral',
    sentimentScore: -0.1,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: 'email'
  })
];

export type DemoScenarioId = 'default' | 'stalledPipeline' | 'highIntentWeek' | 'recoveryPlan';

export interface DemoScenarioDefinition {
  id: DemoScenarioId;
  label: string;
  description: string;
}

export const demoScenarios: DemoScenarioDefinition[] = [
  { id: 'default', label: 'Baseline', description: 'Balanced pipeline with mixed lead quality.' },
  { id: 'stalledPipeline', label: 'Stalled Pipeline', description: 'Fewer hot leads and lower momentum.' },
  { id: 'highIntentWeek', label: 'High Intent Week', description: 'Spike in strong buying intent and recent engagement.' },
  { id: 'recoveryPlan', label: 'Recovery Plan', description: 'Previously cold pipeline showing measured recovery.' }
];

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function seededInt(seed: number, min: number, max: number): number {
  return Math.floor(seededUnit(seed) * (max - min + 1)) + min;
}

function seededFromString(text: string): number {
  return text.split('').reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 0);
}

// Generate mock leads with calculated engagement scores
function generateMockLeads(): Lead[] {
  const companies = ['TechCorp', 'InnovateInc', 'DataSystems', 'CloudWorks', 'NextGen Solutions', 'Digital Dynamics', 'FutureTech', 'SmartBusiness'];
  const positions = ['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Product Manager', 'Operations Manager'];
  const sources = ['Website', 'LinkedIn', 'Trade Show', 'Referral', 'Cold Outreach', 'Content Marketing'];
  const stages = ['prospect', 'qualified', 'opportunity', 'customer'] as const;
  const names = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 'Jessica Williams',
    'Robert Kim', 'Amanda Davis', 'Christopher Lee', 'Nicole Brown', 'James Wilson',
    'Maria Garcia', 'Kevin Anderson', 'Lisa Martinez', 'Daniel Taylor', 'Rachel Green',
    'Matthew Jones', 'Ashley Miller', 'Brandon White', 'Stephanie Clark', 'Justin Lewis',
    'Melissa Walker', 'Ryan Hall', 'Jennifer Young', 'Andrew King', 'Laura Wright',
    'Tyler Scott', 'Samantha Adams', 'Jonathan Baker', 'Kimberly Turner', 'Nicholas Phillips',
    'Heather Campbell', 'Alexander Parker', 'Megan Evans', 'Joshua Edwards', 'Brittany Collins',
    'Nathan Stewart', 'Danielle Morris', 'Jacob Rogers', 'Kayla Reed', 'Zachary Cook',
    'Vanessa Bailey', 'Ethan Cooper', 'Tiffany Richardson', 'Lucas Cox', 'Jasmine Ward',
    'Mason Torres', 'Alexis Peterson', 'Caleb Gray', 'Sierra Ramirez', 'Owen James'
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const leadNumber = i + 1;
    const leadInteractions = sampleInteractions.filter(int => int.leadId === `lead${i + 1}`);
    const currentScore = calculateEngagementScore(leadInteractions.map(int => ({
      content: int.content,
      timestamp: int.timestamp,
      type: int.type
    })), { attributionMode: 'time_decay', timeDecayLambda: 0.1 });
    const previousScore = currentScore + seededInt(leadNumber * 97, -10, 10);

    // Aggregate intent signals from interactions
    const byIntent = new Map<string, { intent: string; strength: 'high' | 'medium' | 'low'; count: number }>();
    for (const int of leadInteractions) {
      for (const s of int.intentSignals ?? []) {
        const key = s.intent;
        if (!byIntent.has(key)) byIntent.set(key, { ...s, count: 0 });
        byIntent.get(key)!.count++;
      }
    }
    const intentSignals = Array.from(byIntent.values()).sort((a, b) => b.count - a.count);
    const hasHigh = intentSignals.some(s => s.strength === 'high');
    const hasLow = intentSignals.some(s => s.strength === 'low');
    let intentSummary = 'No clear intent signals';
    if (hasHigh) intentSummary = 'Strong buying signals (demo, trial, or quote interest)';
    else if (intentSignals.length > 0) intentSummary = `Interest in: ${intentSignals.slice(0, 3).map(s => s.intent.replace(/_/g, ' ')).join(', ')}`;
    if (hasLow) intentSummary += '; some hesitation signals';

    return {
      id: `lead${i + 1}`,
      name: names[i % names.length],
      email: `contact${i + 1}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
      company: companies[i % companies.length],
      position: positions[i % positions.length],
      engagementScore: Math.round(currentScore),
      previousScore: Math.round(previousScore),
      trend: getScoreTrend(currentScore, previousScore),
      lastInteraction: new Date(Date.now() - seededInt(leadNumber * 131, 2, 7) * 24 * 60 * 60 * 1000),
      totalInteractions: seededInt(leadNumber * 17, 1, 15),
      stage: stages[seededInt(leadNumber * 41, 0, stages.length - 1)],
      source: sources[seededInt(leadNumber * 59, 0, sources.length - 1)],
      hubspotId: `hs_${i + 1000}`,
      intentSignals: intentSignals.length > 0 ? intentSignals : undefined,
      intentSummary: intentSignals.length > 0 ? intentSummary : undefined
    };
  });
}

// Generate score history for trends
function generateScoreHistory(_leadId: string): ScoreHistory[] {
  const history: ScoreHistory[] = [];
  const days = 30;
  const seed = seededFromString(_leadId);
  let currentScore = 50 + seededInt(seed, -20, 20);

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const scoreChange = seededInt(seed + i * 13, -5, 5);
    currentScore = Math.max(0, Math.min(100, currentScore + scoreChange));
    const interactions = seededInt(seed + i * 7, 0, 4);

    history.push({
      date,
      score: Math.round(currentScore),
      interactions,
      majorEvents: i % 9 === 0 ? ['Demo completed', 'Pricing discussion'] : undefined
    });
  }

  return history;
}

export const mockLeads = generateMockLeads();

export const mockInteractions = sampleInteractions;

export function applyDemoScenario(baseLeads: Lead[], scenarioId: DemoScenarioId): Lead[] {
  if (scenarioId === 'default') return baseLeads;

  return baseLeads.map((lead, index) => {
    const idx = index + 1;
    const daysAgo = seededInt(idx * 113, 0, 14);
    if (scenarioId === 'stalledPipeline') {
      const score = Math.max(15, Math.round(lead.engagementScore - (idx % 3 === 0 ? 18 : 10)));
      return {
        ...lead,
        engagementScore: score,
        previousScore: Math.min(100, score + seededInt(idx * 19, 6, 14)),
        trend: 'down',
        totalInteractions: Math.max(1, lead.totalInteractions - 2),
        stage: lead.stage === 'customer' ? 'opportunity' : lead.stage,
        lastInteraction: new Date(Date.now() - (daysAgo + 8) * 24 * 60 * 60 * 1000)
      };
    }

    if (scenarioId === 'highIntentWeek') {
      const score = Math.min(98, Math.round(lead.engagementScore + (idx % 4 === 0 ? 18 : 12)));
      return {
        ...lead,
        engagementScore: score,
        previousScore: Math.max(0, score - seededInt(idx * 23, 8, 16)),
        trend: 'up',
        totalInteractions: lead.totalInteractions + 3,
        stage: lead.stage === 'prospect' ? 'qualified' : lead.stage,
        lastInteraction: new Date(Date.now() - seededInt(idx * 29, 0, 2) * 24 * 60 * 60 * 1000)
      };
    }

    const score = Math.round(lead.engagementScore + (idx % 2 === 0 ? 8 : -4));
    return {
      ...lead,
      engagementScore: Math.max(20, Math.min(92, score)),
      previousScore: Math.max(0, Math.round(score - seededInt(idx * 31, 2, 10))),
      trend: idx % 3 === 0 ? 'stable' : 'up',
      totalInteractions: lead.totalInteractions + 1,
      stage: lead.stage === 'prospect' ? 'qualified' : lead.stage,
      lastInteraction: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    };
  });
}

/** Recalculate engagement scores for leads using the given attribution mode */
export function applyAttributionToLeads(
  leads: Lead[],
  interactions: Interaction[],
  options: AttributionOptions
): Lead[] {
  return leads.map(lead => {
    const leadInteractions = interactions.filter(int => int.leadId === lead.id);
    const currentScore = calculateEngagementScore(
      leadInteractions.map(int => ({ content: int.content, timestamp: int.timestamp, type: int.type })),
      options
    );
    const previousScore = lead.previousScore ?? currentScore;
    return {
      ...lead,
      engagementScore: Math.round(currentScore),
      trend: getScoreTrend(currentScore, previousScore)
    };
  });
}

export const mockTeamMetrics: TeamMetrics = {
  totalLeads: mockLeads.length,
  averageEngagementScore: Math.round(mockLeads.reduce((sum, lead) => sum + lead.engagementScore, 0) / mockLeads.length),
  highQualityLeads: mockLeads.filter(lead => lead.engagementScore > 75).length,
  scoreImprovement: 8.3,
  interactionsToday: 23,
  conversionRate: 14.2
};

export { generateScoreHistory };