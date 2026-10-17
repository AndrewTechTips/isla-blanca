# Frontend

React 19 + TypeScript single-page app built with Vite, styled with Tailwind CSS 4 and animated
with Motion. The public site reproduces the Aurelia template 1:1 (see
[design-spec.md](design-spec.md)); behind it are the booking flow, the guest account and the
staff dashboard, all backed by the API.

## Structure

```
frontend/
├── public/images/            photos, icons, video and panoramas (docs/assets.md)
└── src/
    ├── app/                  router (lazy routes and guards), React Query client
    ├── components/
    │   ├── brand/            logo, social icons
    │   ├── layout/           root layout, navbar with account link, mobile menu, footer
    │   ├── motion/           Reveal and WordReveal animation wrappers
    │   ├── rooms/            room card and its loading skeleton
    │   ├── sections/         marketing sections reused across pages (hero, booking bar, FAQ…)
    │   └── ui/               buttons, form fields, dialog, status badge, pagination, loaders
    ├── data/                 static copy: navigation, contact details, FAQ, testimonials
    ├── features/
    │   ├── auth/             auth context, login, register, route guards, safe redirects
    │   ├── booking/          booking page with live price quote and availability
    │   ├── account/          my bookings, booking detail (cancel, review), profile
    │   ├── admin/            dashboard, bookings, rooms, services, amenities, guests
    │   └── rooms/            360° tour, room reviews
    ├── hooks/                usePageTitle
    ├── lib/
    │   ├── api/              typed client, generated schema, token store, React Query hooks
    │   ├── motion.ts         spring and tween presets taken from the template
    │   └── …                 dates, formatting, class merging, control styles
    ├── pages/                marketing pages (home, rooms, room, services, gallery, contact)
    ├── styles/index.css      Tailwind theme: colors, fonts, breakpoints, type scale
    └── test/                 Vitest setup
```

`pages/` holds the public marketing pages; `features/` holds everything a guest or staff member
does once they interact with their data.

## Data and API

- **Types are generated** from the API's OpenAPI schema with `npm run api:types`
  (`lib/api/schema.d.ts`), so a backend change that breaks the frontend fails `tsc`.
- **`openapi-fetch`** makes every call typed end to end: paths, query parameters, bodies and
  responses. A middleware adds the bearer token and signs out on a rejected token.
- **TanStack Query** caches and refreshes data. Query keys live in one file
  (`lib/api/queries/keys.ts`) and every mutation invalidates exactly what it changes: a booking
  refreshes the guest's bookings, room availability and the admin numbers.
- Errors become an `ApiError` with the API's message, its stable `code` and per-field messages
  for validation errors, which the forms show next to each field.

## Authentication and routes

| Route | Access | Content |
|---|---|---|
| `/`, `/rooms`, `/rooms/:slug`, `/services`, `/gallery`, `/contact` | everyone | Marketing site |
| `/book/:slug` | everyone (booking needs sign-in) | Dates, guests, extras, live price, availability |
| `/login`, `/register` | signed-out only | Sign in, create an account |
| `/account`, `/account/bookings/:ref`, `/account/profile` | signed in | Bookings, cancel, review, profile |
| `/admin/*` | admins only | Dashboard, bookings, rooms, services, amenities, guests |

- The JWT is kept in `localStorage`; `AuthProvider` loads the current user from `/auth/me`.
- `RequireAuth`, `RequireAdmin` and `GuestOnly` guard the route groups. Visitors sent to the login
  page come back to where they were (`?next=`), with their booking choices intact. `safeNext`
  only accepts in-app paths, so the return link can't be abused to send people to another site.

## Booking flow

1. Pick dates and party size in the hero's booking bar (or on a room page).
2. `/book/:slug` shows the room, the extras with their pricing unit, and a summary priced by the
   API's `/bookings/quote` on every change. Already-booked dates are flagged before submitting.
3. Signed-out guests sign in and return with dates, guests and extras kept.
4. Confirming creates the booking and opens its page with a confirmation message.
5. From the account the guest can cancel before arrival (with a confirmation dialog) and review
   the stay once it has ended.

## Design system

- **Tokens** live in `styles/index.css` under `@theme`: the template's palette (`gold`, `forest`,
  `sage`, `cream`, `sand`, …), three fonts and Framer's breakpoints (`md` = 810px,
  `lg` = 1200px).
- **Type roles** are utilities (`text-display`, `text-heading`, `text-subheading`,
  `text-card-title`, `text-quote`, `text-eyebrow`, `text-button`, `text-label`) that change size
  per breakpoint exactly like the template. `cn()` (tailwind-merge) knows them, so later classes
  override earlier ones predictably.
- **Animations** use the template's own values from `lib/motion.ts`. Everything honours the
  visitor's "reduce motion" setting.
- **Revenue chart** (admin): one series, sage columns (gold fails 3:1 contrast on white), a value
  label only on the latest month, tooltips on hover and focus, and a hidden data table for screen
  readers.

## Performance

- Every page except Home is lazy-loaded. React, Motion and the 360° viewer are separate chunks
  that browsers cache across deploys.
- The 360° tour (Photo Sphere Viewer + three.js, ~630 kB) downloads only when a visitor presses
  "Start the 360° tour"; until then the room page shows a small preview image.

## Running and testing

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, /api is proxied to the API on :8000
npm test             # Vitest: dates, API client, class merging, safe redirects, route guards
npm run build        # type-check and production build into dist/
npm run lint         # oxlint
npm run format       # prettier (with Tailwind class sorting)
npm run api:types    # regenerate API types (needs the API running)
```

In production the API origin comes from `VITE_API_URL` (e.g. `https://…onrender.com`).
