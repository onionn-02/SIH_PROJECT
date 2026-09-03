# Farmers Procurement Tracking System

Mobile-first web app that gives farmers clear procurement schedule,
token/queue and status information, and gives procurement officers a
simple daily queue workflow. See `CLAUDE.md` for the full product
specification and 7-day build plan.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase (Firestore, Authentication, Admin SDK)
- Zod for validation

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project config
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/            Route segments (App Router)
  components/
    ui/           shadcn/ui primitives
    farmer/       Farmer-facing components
    officer/      Officer-facing components
    admin/        Admin-facing components
    shared/       Shared layout/nav components
  lib/
    firebase/     client.ts (browser SDK) and admin.ts (server-only Admin SDK)
    auth/         Auth helpers
    validation/   Zod schemas and status-transition rules
    utils/        Generic utilities
  services/       Application/business logic
  hooks/          React hooks
  types/          Shared TypeScript types (incl. Firestore schema)
  config/         App configuration (route map, etc.)
  i18n/           Translation strings (English first; Marathi/Hindi later)
```

## Firebase setup

1. Create a Firebase project with Firestore and Authentication enabled.
2. Copy the Web app config into `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
3. Create a service account and copy its credentials into the
   `FIREBASE_ADMIN_*` server-only variables. **Never commit `.env.local`
   or service-account JSON.**
4. Deploy `firestore.rules` (currently a deny-all stub — full rules land
   Day 4).

## Data model

See `src/types/firestore.ts` for the Firestore collection schema
(`profiles`, `procurement_centers`, `procurement_schedules`,
`appointments`, `procurement_records`, `notifications`,
`status_history`, `payments`) and `CLAUDE.md` §10 for the rationale.

## Build status

Following the 7-day plan in `CLAUDE.md` §23. Current checkpoint:
`day-1-foundation`.
