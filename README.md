# LeadLoop

Self-Improving AI Agent for Lead Optimization.

Open-source lead-prioritization product with an AI-assisted recommendation engine.

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)

## 5-minute quickstart

### Prerequisites
- Node.js 20+ (`.nvmrc` included)
- npm 10+

### Install

```bash
git clone https://github.com/zhang-liz/leadloop.git
cd leadloop
npm install
cp .env.example .env
```

### Run

```bash
# starts web + API together
npm run dev
```

App endpoints:
- Web: `http://localhost:5173`
- API: `http://localhost:3000`

## What it does

- Scores leads from interaction signals (`0-100`)
- Prioritizes outreach with AI recommendations
- Learns from thumbs up/down feedback
- Explains trends via lead profile and analytics

## Demo in 5 Minutes

Run the app:

```bash
npm run dev
```

Then open `http://localhost:5173` and use the **Lead Demo Studio** controls at the top of Dashboard.

### Business Demo (5-7 minutes)

1. Set **Track** to `Business`.
2. Choose scenario `High Intent Week`.
3. Walk through top KPI row (pipeline health, top opportunities, confidence, expected uplift).
4. Open **AI Recommendations**, click top lead, and explain the recommended action.
5. Switch scenario to `Stalled Pipeline` to show contrast and recovery narrative.

Success target: value story is clear in under 60 seconds.

### Developer Demo (7-10 minutes)

1. Set **Track** to `Developer`.
2. Show the **System View** flow and **Debug Mode** panel.
3. Trigger **Refresh recommendations** and point out diagnostics:
   - recommendation engine (`heuristic` or `llm_tools`)
   - sentiment provider (`keyword` or `llm`)
   - cache status (`hit`/`miss`)
4. Open a lead and explain score trend, intent signals, and ML fields.
5. Record thumbs up/down feedback on a recommendation to show the learning loop.

Success target: architecture and extension points are clear in under 3 minutes.

### API Walkthrough (Developer)

- `POST /api/agent/recommend` with leads/interactions payload returns prioritized lead suggestions plus diagnostics metadata.
- `POST /api/agent/feedback` records `helpful` or `not_helpful` outcomes for learning.
- `POST /api/agent/improve` applies recent feedback to update weighting logic.

See `docs/DEMO_GUIDE.md` for complete scripts and fallback paths.

## Workspace architecture

```text
apps/
  web/       React + Vite UI
  api/       Express API and recommendation engine
packages/
  shared/    Shared contracts/types
```

## Commands

```bash
npm run dev        # run web + api
npm run dev:web    # run only web
npm run dev:api    # run only api
npm run lint       # lint all packages
npm run build      # build shared + web
npm run test       # run web + api tests
npm run check      # lint + build + test
```

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Scope | Default | Description |
|---|---|---|---|
| `PORT` | API | `3000` | API port |
| `CORS_ORIGIN` | API | `http://localhost:5173` | Allowed web origin |
| `SENTIMENT_PROVIDER` | API | `keyword` | `keyword` or `llm` |
| `OPENAI_API_KEY` | API | n/a | Required for LLM sentiment/recommendations |
| `RECOMMEND_CACHE_TTL_MIN` | API | `10` | Recommendation cache TTL |
| `VITE_API_URL` | Web | `http://localhost:3000` | API base URL |

## Open-source standards

- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Changelog: `CHANGELOG.md`
- License: `LICENSE`

## Contributing

Contributions are welcome. Please use issue templates for bug reports and features, and follow `CONTRIBUTING.md` before opening a pull request.

## License

MIT. See `LICENSE`.
