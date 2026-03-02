# Contributing to LeadLoop

Thanks for your interest in improving LeadLoop.

## Development setup

1. Fork and clone the repository.
2. Install Node.js `>=20` (recommended via `.nvmrc` once added).
3. Install dependencies:
   - `npm install`
4. Create your env file:
   - `cp .env.example .env`
5. Start both apps in separate terminals:
   - `npm run dev` (frontend)
   - `npm run server` (API)

## Branching and commits

- Branch from `main` using a descriptive name:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
- Keep commits focused and easy to review.
- Use clear commit messages that explain why the change is needed.

## Pull request expectations

Before opening a PR, run:

- `npm run lint`
- `npm run build`
- `npm run test`

PRs should include:

- Problem statement and approach
- Screenshots/GIFs for UI changes
- Test notes (what you validated)
- Linked issue (if applicable)

## Code guidelines

- Prefer small, composable modules with explicit boundaries.
- Keep API contracts and shared types centralized.
- Avoid introducing secrets into commits.
- Update docs for user-facing or contributor-facing behavior changes.

## Reporting bugs and proposing features

- Use the issue templates to provide reproducible reports.
- For major changes, open an issue first to align on scope and approach.
