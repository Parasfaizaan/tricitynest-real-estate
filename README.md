# TricityNest

Premium real-estate platform for the Chandigarh corridor (Mohali, Chandigarh, Zirakpur, Kharar). Built as an npm workspaces monorepo with Next.js (App Router) for both the public site and staff dashboards.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Prisma + SQLite (swap `DATABASE_URL` for PostgreSQL in production)
- JWT httpOnly sessions (`jose` + bcrypt)
- Motion for editorial animation
- Zod validation on all mutations

## Apps

- `apps/web` — public website, `/admin`, `/super-admin`, and `/api/*`
- `packages/ui` — shared `cn` helper

## Setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Demo logins

- Super Admin: `superadmin@tricitynest.com` / `SuperAdmin@123`
- Admin: `admin@tricitynest.com` / `Admin@123`

Admins can create and edit listings. Permanent delete requires Super Admin approval.

## Scripts

- `npm run dev` — Next.js on port 3000
- `npm run build` — production build
- `npm run db:seed` — reset demo inventory

## Environment

See `apps/web/.env.example`.
