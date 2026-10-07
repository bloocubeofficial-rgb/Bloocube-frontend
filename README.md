# BlooCube

Brands post. Creators apply. Deals happen.

BlooCube is a creator–brand collaboration marketplace: brands post campaigns with
a budget and requirements, creators discover and apply with their own bid, the
brand selects and funds escrow, the creator delivers content, and payment is
released on approval.

## Features

- **Public marketplace site** — homepage, creator directory, open campaigns,
  pricing, how-it-works, contact (all wired to real data, not static copy).
- **Auth** — email/password signup (creator or brand), login, logout, token
  refresh, password reset. Role-based onboarding (creator vs brand profile).
- **Creator dashboard** — profile card, recommended campaigns, applications,
  collaborations (content submission), messages, wallet & payments, withdrawals.
- **Brand dashboard** — campaign management, the 5-step campaign creation
  wizard (brief → deliverables → creator requirements → budget & bidding →
  review & publish), applications review (accept/reject), messages, payments
  (approve & release escrow).
- **Admin panel** (`/admin`) — platform overview, user management
  (activate/deactivate), campaigns, payments, withdrawals, disputes, contact
  messages, platform settings. Protected both client-side and server-side.
- **Payments** — mock escrow (`PaymentService`) isolated behind a service
  layer so a real provider (Razorpay/Stripe) can replace it later without
  touching callers. Never hardcodes a fake "success."
- **Messaging** — real conversations tied to a campaign application, between
  the matched brand and creator.

## Tech Stack

**Frontend** (`/`): Next.js 15 (App Router), TypeScript, Tailwind CSS 4,
Framer Motion, Radix UI primitives, Zustand.

**Backend** (`/backend`): Express, TypeScript, Prisma ORM, SQLite (zero-infra
for local dev — swap the Prisma datasource to `postgresql` + a `DATABASE_URL`
for production), JWT auth via HttpOnly cookies, bcrypt, Zod.

The backend did not exist before this work — the frontend was already built
against a REST contract (cookie-based JWT auth, `{success, data}` JSON shape)
that nothing was serving locally. It now implements that contract.

## Architecture

```
src/                      Next.js frontend (App Router)
  app/
    (landing)/             public marketing site + /find-creators, /campaigns,
                            /pricing, /how-it-works, /resources, /contact
    (auth)/                 login, signup, forgot-password, verify-otp
    (dashboard)/
      creator/              creator dashboard, marketplace, bids, messages,
                             collaborations, payments, settings, analytics...
      brand/                 brand dashboard, campaigns (+ campaigns/new wizard),
                              bids, messages, payments, settings, analytics...
      admin/                 platform admin
  Components/               shared UI, per-role layouts/sidebars
  hooks/, lib/, store/       data hooks, API client, Zustand stores
  types/                     shared TS types

backend/                  Express API
  prisma/schema.prisma      User, CreatorProfile, BrandProfile, Campaign,
                            CampaignApplication, Collaboration, ContentSubmission,
                            Conversation, Message, Payment, Wallet,
                            WalletTransaction, Withdrawal, Subscription,
                            Notification, Review, Dispute, AuditLog, ContactMessage
  prisma/seed.ts             demo data (see Seed Data below)
  src/routes/                auth, profile, campaigns, bids, collaborations,
                              messages (conversations), payments, wallet,
                              notifications, admin, contact, config, stubs
  src/services/              PaymentService (mock escrow), NotificationService
                              (console provider for local dev)
  src/middleware/auth.ts     requireAuth / requireRole — every protected route
                              is gated server-side, never only in the frontend
```

The core marketplace flow is implemented end-to-end and has been manually
verified: brand publishes a campaign → creator applies with a bid → brand
accepts (creates an escrow payment) → creator submits content → brand
approves & releases → creator's wallet is credited → creator withdraws.

## Local Setup

Requires Node 18+.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env            # defaults work out of the box
npx prisma migrate dev          # creates backend/dev.db (SQLite)
npm run seed                    # demo creators, brands, campaigns, admin
npm run dev                     # http://localhost:5050

# 2. Frontend (separate terminal, from the repo root)
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5050" > .env.local
npm run dev -- --port 3080      # http://localhost:3080
```

Open `http://localhost:3080`.

> **Note on port 5000:** the frontend originally hardcoded the backend URL
> to `http://localhost:5000` in dev. On macOS, that port is often already
> held by the AirPlay Receiver (ControlCenter), so this backend defaults to
> **5050** instead, and `src/lib/config.ts` was changed to respect
> `NEXT_PUBLIC_API_URL` in development rather than ignoring it. If you'd
> rather use 5000, disable AirPlay Receiver in System Settings → General →
> AirDrop & Handoff, then set `PORT=5000` in `backend/.env` and drop the
> `NEXT_PUBLIC_API_URL` override.

### Seed Data (DEMO DATA — not real people or real brand partnerships)

All seeded accounts share the password `Demo@12345`:

| Role | Emails |
|---|---|
| Creator | ananya@, rohan@, mehak@, karan@, isha@, arjun@ `demo.bloocube.local` |
| Brand | garnier@, philips@, zomato@, cerave@, ajio@ `demo.bloocube.local` |
| Admin | admin@bloocube.local |

### Environment Variables

**`backend/.env`** (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (swap to a Postgres URL for production) |
| `PORT` | Backend port (default 5050) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | **Change these in production** |
| `FRONTEND_ORIGIN` | CORS allow-origin, must match the frontend's URL |

**`.env.local`** (frontend root):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL |

## Development Commands

```bash
# Frontend
npm run dev          # dev server
npm run lint         # ESLint (pre-existing codebase has lint debt — see below)
npm run build         # production build + typecheck
npm run start         # serve the production build

# Backend
cd backend
npm run dev           # dev server (tsx watch)
npm run build         # tsc build
npm run start         # run the built server
npx prisma studio     # browse the SQLite database visually
npx prisma migrate dev --name <name>   # after editing schema.prisma
npm run seed          # re-seed demo data
```

## Testing

No automated test suite exists yet (none existed before this work either).
What was verified manually, end-to-end, through the actual UI and/or API:
homepage, signup (creator + brand), login, logout, protected-route
redirects, creator dashboard, brand dashboard, the 5-step campaign wizard
(create → publish → appears in the marketplace), a creator applying, a
brand accepting (creating escrow), content submission, payment release,
wallet credit, a withdrawal request, bidirectional messaging, and the
admin panel (including that deactivating a user actually blocks their
login server-side, not just in the UI).

`npm run build` (frontend) and `npm run build` (backend) both succeed.

## Known Limitations / Remaining Production Integrations

These were deliberately **not faked** — each returns an honest "not
configured" response rather than pretending to work:

- **Real payment provider** — `PaymentService` is a mock. Swap its
  implementation for Razorpay/Stripe; callers (routes) don't need to change.
- **Social platform OAuth** (Instagram/YouTube/Twitter/Facebook/LinkedIn/Google)
  — the frontend has UI for these; the backend returns `501 NOT_CONFIGURED`.
- **Email/SMS delivery** — no provider configured. Signup skips OTP instead of
  faking a sent code; password reset logs the reset link to the backend
  console instead of emailing it.
- **AI features** (AI video gen, AI score, competitor analysis) — pre-existing
  frontend modules from before this work; backend returns empty/zero state
  rather than crashing, since no AI provider is configured.
- **SEO** — no `sitemap.xml` / `robots.txt` added yet.
- **Subscription billing** — the ₹199/month creator membership is modeled
  (`Subscription` table, `/api/config/pricing`) but there's no real billing
  integration; nothing currently enforces the paywall.
- **Pre-existing lint debt** — `next.config.ts` already had
  `eslint.ignoreDuringBuilds: true` before this work, covering ~250
  pre-existing errors (mostly `any` types and unescaped JSX entities) in
  code not touched here. Everything added or modified in this effort passes
  `tsc --noEmit` with zero errors.

## Deployment

The frontend has pre-existing `Dockerfile` / `cloudbuild.yaml` / `cloudrun.yaml`
for GCP Cloud Run. For the backend: set `DATABASE_URL` to a managed Postgres
instance (switch the Prisma `provider` in `schema.prisma` from `sqlite` to
`postgresql`), run `prisma migrate deploy`, set real JWT secrets, and set
`FRONTEND_ORIGIN` to the deployed frontend URL.
