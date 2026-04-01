# Demonlist Eldenigas — Technical Handoff & AI Continuation Guide

## 1) Project overview

Private Demon List web app inspired by Pointercrate, built for a small friend group.

Main goals implemented:
- Minimal architecture, easy to maintain
- No auth / no admin roles
- Fast submit + leaderboard workflow
- Support for:
  - New demon submissions
  - Completion submissions on existing demons (with video link)
  - Progress submissions (%) on existing demons (no points)
  - Multiple video proofs per demon

---

## 2) Tech stack

- **Frontend/Backend framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + custom CSS (`app/globals.css`)
- **ORM:** Prisma
- **Database (production):** PostgreSQL (Neon)
- **Deployment:** Vercel

---

## 3) Main routes/pages

- `/` → **Main List**
  - Ranked demons
  - Thumbnail uses oldest completion video (or demon fallback video)
  - Expandable “Video proofs (N)” list with player + watch link

- `/players` → **Players**
  - Ranking by total points from completions only
  - Top 5 hardest demons (collapsible)
  - Progress list (collapsible) with `%` values (no points)

- `/submit` → **Submit**
  - Three tabs:
    1. `New demon`
    2. `Existing demon completion`
    3. `Existing demon %`
  - Player dropdown with defaults + add-new-player
  - Toast feedback messages for success/error

---

## 4) Data model (Prisma)

Located at: `prisma/schema.prisma`

Core models:
- `Demon`
  - `position` unique ranking
  - base info + fallback `videoUrl`
- `Player`
- `Completion`
  - unique per `(playerId, demonId)`
  - includes `videoUrl` for that player’s run
  - **gives points**
- `Progress`
  - unique per `(playerId, demonId)`
  - stores `percentage` only
  - **gives NO points**
- `Submission`
  - audit log for new demon submissions

---

## 5) Points system

Implemented in `lib/points.ts`.

- Position #1 = **350** points
- Position #75 = **30** points
- Linear interpolation between both
- Clamped to range 1..75

Only `Completion` rows contribute to points.

---

## 6) Important app behavior

### New demon submit
Server action: `submitDemon` (`app/submit/actions.ts`)
- Inserts demon at provided provisional position
- Shifts lower demons down
- Creates/ensures player
- Creates completion for submitter
- Stores submission log

### Existing demon completion submit
Server action: `submitCompletion`
- Select existing demon
- Add run video for selected player
- Upsert completion `(player,demon)`

### Existing demon progress submit
Server action: `submitProgress`
- Select existing demon
- Store/update progress `%`
- No points awarded

---

## 7) Styling system notes

Main file: `app/globals.css`

Current style direction:
- Light Pointercrate-inspired UI
- Dashed borders across most surfaces
- Collapsible details sections
- Basic loading skeletons (`app/loading.tsx`)
- Subtle transitions/animations

---

## 8) Deployment notes

Production URL currently:
- `https://demonlist-eldenigas.vercel.app`

Custom domain configured in Vercel project:
- `demonlist.eldenigas.mikiii`

If custom domain does not resolve, check DNS:
- A record for host should point to `76.76.21.21` (Vercel standard)

---

## 9) Local development commands

```bash
npm install
npm run prisma:generate
npm run dev
```

For schema sync (careful in production):
```bash
npx prisma db push
```

Build:
```bash
npm run build
```

---

## 10) Known risks / caveats

- Serverless cold starts can cause first-request delay after idle
- No authentication means anyone with link can submit data
- Free-tier limits (Vercel/Neon) can throttle heavy use
- Concurrent submissions at same position can still be edge-casey

---

## 11) AI continuation prompt (copy/paste)

Use this prompt in any future AI chat to continue development safely:

```text
You are a senior full-stack engineer maintaining a private app called “Demonlist Eldenigas”.

Project context:
- Stack: Next.js 15 App Router + TypeScript + Prisma + PostgreSQL (Neon) + Tailwind/CSS.
- Deployment: Vercel.
- Main pages: / (Main List), /players, /submit.
- Features already implemented:
  1) New demon submit with provisional position insertion + rank shifting.
  2) Existing demon completion submit with per-player video link.
  3) Existing demon progress submit (%) with no points.
  4) Multiple video proofs per demon shown on Main List.
  5) Players page with points, top-5 hardest demons, and progress list.
- Points system: position #1 = 350, position #75 = 30, linear in between (completions only).

What I need from you:
1) First inspect current files and summarize architecture briefly.
2) Propose minimal, maintainable changes only (no overengineering).
3) Implement requested changes with clean code and migrations if needed.
4) Validate with build + Prisma checks.
5) Provide a concise changelog and any required deploy steps.

Constraints:
- Keep code simple, readable, and easy to extend.
- Avoid unnecessary dependencies.
- Preserve existing behavior unless explicitly asked to change it.
```

---

## 12) Suggested next improvements (optional)

- Add lightweight rate-limiting / anti-spam
- Add soft-delete and edit history for submissions
- Add input normalization for player names (case-insensitive)
- Add export/import JSON backup page
- Add tiny health/admin diagnostics page (read-only)
