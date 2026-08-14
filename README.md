# Blog Website — Project Scaffold

Full-stack scaffold implementing the SRS/design doc: React (Vite + TS + Tailwind) frontend,
Express (TypeScript + Prisma) backend, Postgres via Supabase, images via Supabase Storage.

This is a working foundation, not a finished product — see "What's implemented" and
"What's next" below before you start building on it.

## Project layout

```
blog-project/
  backend/     Express API, Prisma schema, auth, posts, images
  frontend/    React app — public site + /admin
```

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine) with:
  - A Postgres database (copy the connection string for `DATABASE_URL`)
  - A Storage bucket for images, set to **public** (name it to match `SUPABASE_IMAGES_BUCKET`, default `post-images`)
  - The **service role key** (Project Settings → API) for `SUPABASE_SERVICE_ROLE_KEY` — never expose this to the frontend

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL, SESSION_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run prisma:migrate    # creates tables from prisma/schema.prisma
npm run prisma:seed       # creates your single admin user from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                # starts the API on http://localhost:4000
```

After seeding, consider removing `ADMIN_PASSWORD` from `.env` or changing it — it's only
read once, at seed time.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev    # starts the app on http://localhost:5173
```

Visit `http://localhost:5173` for the public site, `http://localhost:5173/admin/login` to sign in.

## What's implemented

- **Public site**: homepage with cursor-paginated infinite scroll (FR-002), individual post
  pages by slug (FR-003), rich-text rendering with inline images.
- **Admin**: session-cookie login, dashboard (draft/published list, delete), post editor
  (Tiptap rich text, image insertion, save draft / publish, preview using the same renderer
  as the public page).
- **Backend**: REST API matching the design doc's endpoint table, `requireAuth` middleware
  enforced server-side on every `/api/admin/*` route, Zod validation on writes, bcrypt password
  hashing, rate limiting on login and uploads.
- **Images**: upload → validated → resized (max 1600px) → re-encoded to WebP (+ JPEG fallback
  variant stored alongside) via `sharp` → pushed to Supabase Storage; orphaned images are
  reconciled against post content on every save and on delete.
- **Pagination**: keyset/cursor pagination on `(published_at, id)`, matching design §4.2.

## What's next (not yet built — see design doc §9/§10 and SRS §15 for the full backlog)

- Automated tests (none included yet — recommend Vitest for both packages).
- `<picture>`-based WebP/JPEG fallback in the frontend `<img>` rendering (the backend already
  returns both URLs from the upload endpoint; the editor currently only stores the WebP URL).
- Production `helmet`/CSP tuning, and a real request logger (`pino` or similar).
- CI (lint + typecheck + build) before deploying to Render.
- Deployment: Render service configs (`render.yaml`) for both apps aren't included — set build
  command `npm install && npm run build`, start command `npm start` for the backend; for the
  frontend, deploy `frontend/dist` as a static site with `VITE_API_BASE_URL` set at build time.

## Notes on the design decisions actually used here

- **TypeScript** end-to-end.
- **Prisma** as the ORM, with a migration-based schema (`prisma/schema.prisma`).
- **Excerpts**: auto-generated from post content (`src/utils/excerpt.ts`) unless the admin
  types one manually in the editor, in which case the manual version is preserved on later
  auto-saves (`excerptIsManual` flag).
- **Images**: WebP primary + JPEG fallback, both generated server-side and uploaded to Storage.
