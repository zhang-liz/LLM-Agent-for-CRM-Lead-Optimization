# LeadLoop Demo Guide

## Pre-Demo Checklist

- Run `npm run dev`.
- Confirm web (`http://localhost:5173`) and API (`http://localhost:3000/api/health`) are reachable.
- If `OPENAI_API_KEY` is missing, use fallback story: rule-based recommendations with `keyword` sentiment.
- Start in Dashboard and keep the AI recommendations panel expanded.

## Business Demo Script (5-7 minutes)

### Goal
Show business value quickly: better prioritization, clearer focus, and measurable uplift.

### Narrative Steps
1. Set track to `Business`.
2. Load scenario `High Intent Week`.
3. Explain KPI strip:
   - pipeline health
   - top opportunities
   - recommendation confidence
   - expected uplift
4. Open AI recommendations and click the first lead.
5. Explain why this lead should be contacted now.
6. Switch to `Stalled Pipeline` and compare KPI changes.
7. Close with: "The team can target the right leads faster with transparent rationale."

### Success Criteria
- Audience understands business value in under 60 seconds.
- Audience sees before/after scenario contrast without technical deep-dive.

## Developer Demo Script (7-10 minutes)

### Goal
Show how the system works and where to customize it.

### Narrative Steps
1. Set track to `Developer`.
2. Walk through `System View`:
   - interactions
   - sentiment and intent extraction
   - engagement scoring
   - recommendation generation
   - feedback loop
3. Trigger "Refresh recommendations".
4. Show diagnostics:
   - recommendation engine (`heuristic` / `llm_tools`)
   - sentiment provider (`keyword` / `llm`)
   - cache status (`hit` / `miss`)
5. Open a lead and discuss trend, interactions, and intent fields.
6. Use thumbs up/down to record feedback.
7. Mention extension points:
   - `apps/api/intentDetection.js`
   - `apps/api/sentimentKeyword.js` / `apps/api/sentimentLLM.js`
   - `apps/api/mlScoring.js`
   - `apps/api/agentTools.js`

### Success Criteria
- Audience can describe the end-to-end flow in under 3 minutes.
- Audience knows where to modify scoring/recommendation behavior.

## API Quick Examples

### Recommend

```bash
curl -X POST http://localhost:3000/api/agent/recommend \
  -H "Content-Type: application/json" \
  -d '{"leads":[{"id":"lead1","name":"Alex","company":"Acme","engagementScore":82,"trend":"up","stage":"qualified","lastInteraction":"2026-03-31T18:00:00.000Z","totalInteractions":8,"email":"alex@acme.com","position":"CTO","source":"Website"}],"teamMetrics":{"totalLeads":1,"averageEngagementScore":82,"highQualityLeads":1,"scoreImprovement":8,"interactionsToday":3,"conversionRate":17},"interactions":[]}'
```

### Feedback

```bash
curl -X POST http://localhost:3000/api/agent/feedback \
  -H "Content-Type: application/json" \
  -d '{"leadId":"lead1","outcomeType":"helpful"}'
```

### Improve

```bash
curl -X POST http://localhost:3000/api/agent/improve
```
