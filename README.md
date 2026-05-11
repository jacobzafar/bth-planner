# BTH Studieplanerare (BTH Planner)

En studieplanerare för studenter vid Blekinge Tekniska Högskola (BTH). Appen
samlar utbildningsplan, kurser, deluppgifter och kalender på ett ställe och
hjälper studenten att prioritera vad som bör göras härnäst.

- **Live (production):** https://bthplanner.com
- **Live (Lovable preview):** https://bthplanner.lovable.app

## Funktioner

- **Onboarding** med val av BTH-program och startår, som automatiskt
  laddar in rätt kurser från utbildningsplanen.
- **Kursöversikt** med HP-progress per år, status (ej påbörjad / pågående
  / godkänd) och förkunskapskrav som tydliggör om en kurs kräver
  *genomgången* eller *avklarad* förkunskap.
- **Deluppgifter** per kurs som synkas tvåvägs med kalendern och
  uppgiftslistan.
- **"Fokus härnäst"** – en prioriteringsalgoritm som rangordnar vad
  studenten bör arbeta med baserat på deadlines, HP och kursstatus.
- **Kalender** för tentor, inlämningar och egna studiehändelser.
- **Autentisering** via e-post + lösenord med "Glömt lösenord"-flöde.

All UI är på svenska.

## Teknikstack

- **Frontend:** React 18 + TypeScript + Vite 5
- **UI:** Tailwind CSS v3, shadcn/ui (Radix UI), lucide-react
- **Routing:** react-router-dom v6
- **Data & state:** @tanstack/react-query, lokala hooks
- **Formulär & validering:** react-hook-form + zod
- **Backend:** Lovable Cloud (Supabase) – Auth, Postgres med RLS, Edge
  Functions, Storage
- **Tester:** Vitest + @testing-library/react + jsdom
- **Lint:** ESLint 9 + typescript-eslint

## Kom igång lokalt

Krav: **Node.js 20+** och **npm** (eller bun/pnpm).

```sh
# 1. Klona repot
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Installera beroenden
npm install

# 3. Skapa en .env utifrån mallen och fyll i värdena
cp .env.example .env

# 4. Starta dev-servern
npm run dev
```

Appen körs som standard på <http://localhost:8080>.

> När projektet körs via Lovable populeras `.env` automatiskt av Lovable
> Cloud – du behöver inte konfigurera Supabase manuellt där.

## Miljövariabler

Alla variabler dokumenteras i [`.env.example`](./.env.example).

| Variabel                          | Beskrivning                                  |
| --------------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`               | Publik Supabase-URL för klienten             |
| `VITE_SUPABASE_PUBLISHABLE_KEY`   | Anon/publishable key (säker i browsern)      |
| `VITE_SUPABASE_PROJECT_ID`        | Supabase-projektets ref                      |
| `SUPABASE_URL`                    | Samma URL, för verktyg/skript utan Vite      |
| `SUPABASE_PUBLISHABLE_KEY`        | Samma anon-key, för verktyg/skript           |

`.env` är ignorerad av git och ska **aldrig** committas. Endast publika
Supabase-nycklar (anon/publishable) används i klientkoden – inga
service-role-nycklar.

## NPM-skript

| Skript              | Vad det gör                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Startar Vite dev-server med HMR                   |
| `npm run build`     | Produktionsbygge till `dist/`                     |
| `npm run build:dev` | Utvecklingsbygge (källmappar, ingen minifiering)  |
| `npm run preview`   | Förhandsgranska produktionsbygget lokalt          |
| `npm run lint`      | Kör ESLint över hela projektet                    |
| `npm run test`      | Kör Vitest en gång (CI-läge)                      |
| `npm run test:watch`| Kör Vitest i watch-läge                           |

## Mappstruktur

```text
src/
├─ assets/                Bilder och statiska resurser
├─ components/            App-komponenter (sidor och vyer)
│  ├─ ui/                 shadcn/ui-komponenter (genererade)
│  ├─ AuthPage.tsx        Logga in / registrera / glömt lösenord
│  ├─ Dashboard.tsx       Startvy med "Fokus härnäst"
│  ├─ CourseStatusPage.tsx Kursöversikt och deluppgifter
│  ├─ CalendarPage.tsx    Kalendervy
│  ├─ AddEventPage.tsx    Skapa studiehändelse
│  ├─ ProgramSetupPage.tsx Onboarding och programval
│  ├─ SettingsPage.tsx    Inställningar
│  └─ AppLayout.tsx       Layout med navigation
├─ hooks/                 Återanvändbara React-hooks
├─ integrations/supabase/ Auto-genererad Supabase-klient och typer
├─ lib/
│  ├─ programs/           Program-/kursmallar per BTH-program
│  ├─ prioritization.ts   "Fokus härnäst"-algoritm
│  ├─ store.ts, hooks.ts  Klient-state-helpers
│  ├─ types.ts            Domäntyper
│  └─ utils.ts            Hjälpfunktioner
├─ pages/                 Routade sidor (Index, NotFound, ResetPassword)
├─ test/                  Test-setup för Vitest
├─ App.tsx, main.tsx      App-rot och bootstrap
└─ index.css              Tailwind + designsystem-tokens
supabase/                 Supabase-konfig och migrationer
```

## Designsystem

Färger, typografi och spacing definieras som semantiska tokens i
`src/index.css` och `tailwind.config.ts`. Komponenter använder tokens
(`bg-background`, `text-primary`, …) – aldrig råa färgklasser. Temat är
inspirerat av BTH:s marinblå-och-vita profil.

## Tester

Tester körs med **Vitest** och **@testing-library/react** mot **jsdom**.
Test-setup ligger i `src/test/`. Lägg testfiler bredvid koden som
`*.test.ts(x)`.

```sh
npm run test         # kör en gång
npm run test:watch   # watch-läge under utveckling
```

## Backend (Lovable Cloud / Supabase)

- **Auth:** E-post + lösenord, inkl. "Glömt lösenord"-flöde via
  `supabase.auth.resetPasswordForEmail` som leder till `/reset-password`.
- **Databas:** Postgres med Row-Level Security. Tabeller (`profiles`,
  `user_courses`, `course_subtasks`, `study_events`, m.fl.) skyddas så
  att en användare bara ser sin egen data.
- **Migrationer:** Alla schemaändringar ligger i `supabase/migrations/`
  och appliceras automatiskt av Lovable Cloud.
- **Klient:** `src/integrations/supabase/client.ts` och `types.ts`
  genereras automatiskt – redigera dem inte för hand.

## Driftsättning

Projektet driftsätts via Lovable:

1. Öppna projektet i [Lovable](https://lovable.dev).
2. Klicka **Share → Publish** för att deploya.
3. Egen domän kan kopplas via **Project → Settings → Domains** (se
   [Lovables docs](https://docs.lovable.dev/features/custom-domain)).

Bygget som driftsätts är resultatet av `npm run build` (statiska filer i
`dist/`), så projektet kan även hostas på valfri statisk värd om det
behövs.

## Bidra

1. Skapa en branch.
2. Kör `npm run lint` och `npm run test` innan du pushar.
3. Öppna en pull request.
