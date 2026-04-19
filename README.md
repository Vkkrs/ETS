# ETS — Embrace The Suck

> The suck doesn't stop. Neither do you.

Tactical ops system for training, nutrition, weapons handling, and AI-assisted planning. Built for selection candidates, veterans, MilSim athletes, and tactical lifestyle operators.

This is not a consumer fitness app. No gamification. No confetti.

---

## Modules

| Module | Status |
|---|---|
| HQ / SITREP — Dashboard | v1.0 |
| TRAIN — Training Library & Weekly Plan | v1.0 |
| CHOW — Recipe Library & Meal Plan | v1.0 |
| LOG — Workout Log, Benchmarks, Body Data | v1.0 |
| ADMIN — Operator File & Settings | v1.0 |
| RANGE — Dry Fire & Mental Reps | v1.1 — pending expert review |

---

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS — custom design system, no UI libraries
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** Anthropic Claude API — server-side only
- **Deployment:** Vercel

---

## Setup

```bash
git clone https://github.com/DEIN-NAME/ets.git
cd ets
npm install
cp .env.local.example .env.local
# Add your keys to .env.local
npm run dev
```

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## Development

See `CLAUDE.md` for architecture decisions, design system, database schema, and hard rules.

See `docs/PRD.md` for full product specification.

---

*Private project. Not open for contributions.*
