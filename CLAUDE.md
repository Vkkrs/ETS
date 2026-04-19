# CLAUDE.md — ETS / Embrace The Suck
## Instruktionen für Claude Code

> Dieses File ist der primäre Kontext für alle Entwicklungs-Sessions.
> Lies es vollständig bevor du irgendeine Zeile Code schreibst.
> Bei Konflikten zwischen diesem File und anderen Quellen: dieses File gewinnt.

---

## 1. Projekt-Übersicht

**App:** ETS — Embrace The Suck
**Typ:** Progressive Web App (PWA), Mobile First
**Zielgruppe:** Tactical Fitness — Selektions-Anwärter, Veteranen, MilSim-Athleten
**Tagline:** "The suck doesn't stop. Neither do you."

ETS ist kein Consumer-Fitness-Tool. Kein Gamification. Kein Confetti. Kein Gratulieren für Basics.

---

## 2. Tech Stack (nicht verhandelbar)

| Schicht | Technologie | Version |
|---|---|---|
| Framework | Next.js | 14 (App Router) |
| Sprache | TypeScript | strict mode |
| Styling | Tailwind CSS | mit Custom Config |
| Backend | Supabase | PostgreSQL + Auth + RLS |
| KI | Anthropic Claude API | claude-sonnet-4 |
| Deployment | Vercel | — |
| State | Zustand | lightweight |

**Was NICHT verwendet wird:**
- shadcn/ui — kollidiert mit ETS Design System
- Bootstrap — nicht verwenden
- Keine UI-Libraries die eigene border-radius oder Consumer-Styles mitbringen

---

## 3. Hard Rules — Architektur

### API Keys
- **Alle API-Keys serverseitig** — Server Actions oder Route Handlers
- **Kein Client-Exposure** — kein Key im Browser sichtbar
- Anthropic Key: nur in Server Actions
- Supabase Service Role Key: nur serverseitig
- Supabase Anon Key: darf client-seitig verwendet werden

### Supabase
- **RLS von Tag 1** — Row Level Security auf allen Tabellen, keine Ausnahme
- Auch im Single-User-Betrieb: RLS aktiv (Vorbereitung für Multi-User)
- Policies: jeder User sieht nur seine eigenen Daten
- Globale Seed-Daten (exercises, recipes, range_drills): `user_id = null`, lesbar für alle

### Generierte Inhalte
- KI-generierte Inhalte werden **persistiert** — einmaliger Schreibvorgang
- **Keine Re-Generierung** bei jedem Aufruf — nur aus DB lesen
- `ai_generated: true` Flag auf generierten Datensätzen

### RANGE-Modul
- **Kein KI-Generator für RANGE** — absolute Ausnahme, keine Diskussion
- RANGE-Inhalte sind kuratiert, kein User-Write
- `range_drills` Tabelle: nur lesbar via SELECT, kein INSERT/UPDATE für User

---

## 4. Design System — Tailwind Config

Diese Werte gehören in `tailwind.config.ts`. Nicht abweichen.

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        'ets-bg':           '#080808',
        'ets-surface':      '#0F0F0F',
        'ets-border-deep':  '#0C0C0C',
        'ets-border-mid':   '#0D0D0D',
        'ets-border':       '#111111',
        'ets-text-primary': '#FAFAF8',
        'ets-text-active':  '#D8D4C8',
        'ets-text-mid':     '#C8C8C4',
        'ets-text-muted':   '#B8B4A8',
        'ets-text-low':     '#606060',
        'ets-text-ghost':   '#282828',
        'ets-accent':       '#00FF88',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      maxWidth: {
        'app': '390px',
      },
    },
  },
}
```

### App Container (global, in layout.tsx)
```tsx
<div className="max-w-app mx-auto min-h-dvh bg-ets-bg relative">
  {children}
</div>
```

### Design Hard Rules für alle Komponenten
1. **Kein border-radius** — `rounded-none` überall, kein Ausnahme
2. **Grain auf Hero-Bereichen** — opacity-[0.12], SVG noise
3. **Bilder** — immer `grayscale-[20%] brightness-[0.3] contrast-[1.1]`
4. **Accent #00FF88** — maximal 1-2 Elemente pro Screen
5. **Bebas Neue** für alle Labels, Buttons, Tags, Nav
6. **Keine Emojis** in UI-Copy
7. **Keine Ausrufezeichen** in System-Texten

---

## 5. UI-Copy Wörterbuch

Claude Code hält sich an diese Terminologie in allen UI-Strings:

```
SITREP          → nicht: Dashboard
EXECUTE         → nicht: Start Workout
OPERATOR        → nicht: User / Nutzer
STAND BY        → nicht: Loading...
GOOD TO GO      → nicht: Done / Fertig
MISSION COMPLETE → nicht: Great job!
CHOW            → nicht: Nutrition / Ernährung
RANGE           → nicht: Shooting / Schießen
ADMIN           → nicht: Settings / Einstellungen
RECOVERY OP     → nicht: Rest Day / Ruhetag
AFTER ACTION    → nicht: Summary / Zusammenfassung
INTEL           → nicht: Tips / Tipps
FIELD-READY     → nicht: Easy / Einfach
DOWNRANGE       → nicht: In progress / In Bearbeitung
OPERATOR FILE   → nicht: Profile / Profil
```

---

## 6. Datenbankschema (vollständig)

```sql
-- NUTZER & PROFIL
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE operator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  mission text CHECK (mission IN ('selection','veteran','milsim','lifestyle')),
  module_range boolean DEFAULT false,
  module_chow boolean DEFAULT true,
  time_to_event_weeks int,
  training_days_per_week int DEFAULT 5,
  primary_equipment text DEFAULT 'bodyweight',
  calorie_target int,
  updated_at timestamptz DEFAULT now()
);

-- TRAINING LIBRARY
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text CHECK (category IN ('calisthenics','strength','mobility')),
  muscle_primary text[],
  muscle_secondary text[],
  equipment text[],
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),
  intensity text CHECK (intensity IN ('low','moderate','high','maximal')),
  description text,
  steps jsonb,
  sets_default int,
  reps_default text,
  duration_default int,
  video_url text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- TRAINING PLANS
CREATE TABLE training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  week_start date,
  intensity text,
  equipment text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE training_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES training_plans(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  type text CHECK (type IN ('train','rest','recovery')),
  workout_name text,
  exercise_ids uuid[]
);

-- RECIPE LIBRARY
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tags text[],
  prep_time int,
  servings int,
  calories_per_serving int,
  protein_g int,
  carbs_g int,
  fat_g int,
  ingredients jsonb,
  steps text[],
  storage_notes text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- MEAL PLANS
CREATE TABLE meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  week_start date,
  calorie_target int,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE meal_plan_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type text CHECK (meal_type IN ('breakfast','pre_wo','lunch','post_wo','dinner','snack')),
  recipe_id uuid REFERENCES recipes(id),
  servings numeric DEFAULT 1
);

-- RANGE LIBRARY (kein KI, kein User-Write)
CREATE TABLE range_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text CHECK (category IN ('handling','reload','malfunction','transition','mental')),
  subcategory text,
  name text NOT NULL,
  description text,
  steps jsonb,
  duration_min int,
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),
  source text
);

-- WORKOUT LOG
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_date date DEFAULT current_date,
  duration_min int,
  rpe int CHECK (rpe BETWEEN 1 AND 10),
  workout_name text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE workout_log_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  exercise_name text,
  set_number int,
  reps int,
  weight_kg numeric,
  duration_sec int
);

-- NUTRITION LOG
CREATE TABLE nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  log_date date DEFAULT current_date,
  calories_actual int DEFAULT 0,
  protein_g_actual int DEFAULT 0,
  carbs_g_actual int DEFAULT 0,
  fat_g_actual int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- PERFORMANCE BENCHMARKS
CREATE TABLE benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  result_value numeric NOT NULL,
  result_unit text,
  test_date date DEFAULT current_date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- BODY DATA
CREATE TABLE body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  measured_at date DEFAULT current_date,
  weight_kg numeric,
  body_fat_pct numeric,
  notes text
);
```

### RLS Policies (für jede User-Tabelle)
```sql
-- Beispiel für exercises (gleiches Pattern für alle User-Tabellen)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own + global exercises"
  ON exercises FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own exercises"
  ON exercises FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own exercises"
  ON exercises FOR DELETE
  USING (user_id = auth.uid());

-- range_drills: nur SELECT, kein User-Write
ALTER TABLE range_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can read range_drills"
  ON range_drills FOR SELECT USING (true);
```

---

## 7. Folder-Struktur (Next.js App Router)

```
ets/
├── app/
│   ├── layout.tsx              # Root layout, font import, app container
│   ├── page.tsx                # Redirect → /hq oder /onboarding
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts   # Supabase auth callback
│   ├── onboarding/
│   │   ├── page.tsx            # Screen 1: Mission
│   │   ├── modules/page.tsx    # Screen 2: Activate Modules
│   │   └── parameters/page.tsx # Screen 3: Parameters
│   ├── hq/
│   │   └── page.tsx            # SITREP Dashboard
│   ├── train/
│   │   ├── page.tsx            # Library List
│   │   ├── [id]/page.tsx       # Exercise Detail
│   │   └── plan/page.tsx       # Weekly Plan
│   ├── chow/
│   │   ├── page.tsx            # Recipe Library
│   │   └── plan/page.tsx       # Meal Plan
│   ├── range/
│   │   └── page.tsx            # Locked in v1.0
│   ├── log/
│   │   ├── page.tsx            # Workout Log Input
│   │   └── benchmarks/page.tsx # Performance Benchmarks
│   ├── admin/
│   │   └── page.tsx            # Operator File & Settings
│   └── api/
│       ├── generate/
│       │   ├── exercise/route.ts
│       │   ├── recipe/route.ts
│       │   ├── training-plan/route.ts
│       │   ├── meal-plan/route.ts
│       │   └── sitrep/route.ts
│       └── log/
│           └── workout/route.ts
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Topbar.tsx
│   │   └── AppContainer.tsx
│   ├── ui/
│   │   ├── Hero.tsx
│   │   ├── SecHero.tsx
│   │   ├── StatGrid.tsx
│   │   ├── ListRow.tsx
│   │   ├── DayRow.tsx
│   │   ├── MealSlot.tsx
│   │   ├── PlanStrip.tsx
│   │   ├── CTABlock.tsx
│   │   ├── EmptyState.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── SearchBar.tsx
│   │   └── IntelCoach.tsx
│   ├── train/
│   │   ├── ExerciseList.tsx
│   │   ├── ExerciseDetail.tsx
│   │   ├── WeeklyPlan.tsx
│   │   └── KIGeneratorPanel.tsx
│   ├── chow/
│   │   ├── RecipeList.tsx
│   │   └── MealPlan.tsx
│   └── log/
│       ├── WorkoutLogInput.tsx
│       └── BenchmarkCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts
│   ├── anthropic/
│   │   └── client.ts           # Serverseitig only
│   └── utils/
│       └── macros.ts
├── types/
│   └── database.ts             # Supabase generated types
├── styles/
│   └── globals.css             # Grain animation, custom scrollbar
├── public/
│   └── fonts/                  # Bebas Neue falls self-hosted
├── CLAUDE.md                   # Diese Datei
├── tailwind.config.ts
├── next.config.ts
└── .env.local                  # Keys — nie committen
```

---

## 8. Navigation — Bottom Nav

6 Items. RANGE in v1.0 als `locked` gebaut aber vorhanden.

```tsx
// components/layout/BottomNav.tsx
const NAV_ITEMS = [
  { id: 'hq',    label: 'HQ',    href: '/hq',    icon: HomeIcon },
  { id: 'train', label: 'TRAIN', href: '/train', icon: DumbbellIcon },
  { id: 'chow',  label: 'CHOW',  href: '/chow',  icon: CoffeeIcon },
  { id: 'range', label: 'RANGE', href: '/range', icon: TargetIcon, locked: true },
  { id: 'log',   label: 'LOG',   href: '/log',   icon: FileIcon },
  { id: 'admin', label: 'ADMIN', href: '/admin', icon: SettingsIcon },
]
```

Locked items: `opacity-20 pointer-events-none`. Kein Tooltip, kein Lock-Icon — einfach gedimmt.
RANGE wird später per `operator_profile.module_range` aktiviert — `locked` prop dynamisch.

---

## 9. KI-Integration — Route Handler Pattern

```typescript
// app/api/generate/training-plan/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  // 1. Auth prüfen
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Operator File laden
  const { data: profile } = await supabase
    .from('operator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 3. Parameter aus Request
  const { intensity, equipment, duration_min, focus } = await req.json()

  // 4. Claude API — serverseitig
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: buildTrainingPlanPrompt(profile, { intensity, equipment, duration_min, focus })
    }]
  })

  // 5. Persistieren — nicht neu generieren bei jedem Aufruf
  const plan = parsePlanFromResponse(message.content)
  const { data: savedPlan } = await supabase
    .from('training_plans')
    .insert({ user_id: user.id, ...plan, ai_generated: true })
    .select()
    .single()

  return Response.json({ plan: savedPlan })
}
```

**Prompt-Builder separat halten** — eigene Funktion, testbar.
**RANGE niemals** in KI-Prompts einbeziehen — weder als Input noch Output.

---

## 10. Environment Variables

```bash
# .env.local — niemals committen
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # nur serverseitig
ANTHROPIC_API_KEY=            # nur serverseitig
```

`.env.local` ist in `.gitignore`. Niemals Keys in Client-Code.

---

## 11. Was Claude Code NICHT tut

- Keine UI-Libraries installieren (shadcn, MUI, Chakra, etc.)
- Keine border-radius in Komponenten
- Keine Emojis in UI-Strings
- Keine KI-Logik im RANGE-Modul — keine Ausnahme
- Keine API-Keys im Client-Code
- Keine Re-Generierung von bereits gespeicherten KI-Inhalten
- Keine globalen CSS-Resets die Tailwind überschreiben

---

## 12. MVP-Reihenfolge

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 (RANGE, nur nach Experten-Abnahme)

Nie Phasen überspringen. Nie RANGE vor Abnahme.

---

*ETS — Embrace The Suck*
*CLAUDE.md v1.0 — Entwicklungs-Kontext für Claude Code*
