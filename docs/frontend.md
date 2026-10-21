# Frontend

React 19 + TypeScript single-page app built with Vite, styled with Tailwind CSS 4 and animated
with Motion. The public site follows the design in [design-spec.md](design-spec.md); behind it
are the booking flow, the guest account and the staff dashboard, all backed by the API.

## Structure

```
frontend/
├── public/images/            photos (+ WebP copies), icons, video and panoramas (docs/assets.md)
├── scripts/                  optimize-images.sh: makes the 800/1600 px WebP copies
└── src/
    ├── app/                  router (lazy routes and guards), React Query client
    ├── components/
    │   ├── brand/            logo, social icons
    │   ├── club/             the Isla Blanca Club member card
    │   ├── layout/           root layout, navbar with account link, mobile menu, footer
    │   ├── motion/           Reveal and WordReveal animation wrappers
    │   ├── rooms/            room card and its loading skeleton
    │   ├── sections/         marketing sections reused across pages (hero, booking bar, FAQ…)
    │   └── ui/               buttons, form fields, dialog, status badge, pagination, loaders
    ├── data/                 static copy: navigation, contact details, FAQ, testimonials, club
    ├── features/
    │   ├── auth/             auth context, login, register, route guards, safe redirects
    │   ├── booking/          booking page with live price quote and availability
    │   ├── account/          my bookings, booking detail (cancel, review), club card, profile
    │   ├── admin/            dashboard, bookings, rooms, services, amenities, guests
    │   └── rooms/            availability calendar, 360° tour, room reviews
    ├── hooks/                page title, parallax, scroll lock, media queries
    ├── lib/
    │   ├── api/              typed client, generated schema, token store, React Query hooks
    │   ├── motion.ts         spring and tween presets used across the site
    │   ├── smoothScroll.ts   Lenis smooth scrolling and the scroll lock for overlays
    │   ├── images.ts         srcset/sizes for the site's photos
    │   └── …                 dates, formatting, class merging, control styles
    ├── pages/                marketing pages (home, rooms, room, services, gallery, club, contact)
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
| `/`, `/rooms`, `/rooms/:slug`, `/services`, `/gallery`, `/club`, `/contact` | everyone | Marketing site |
| `/book/:slug` | everyone (booking needs sign-in) | Dates, guests, extras, live price, availability |
| `/login`, `/register` | signed-out only | Sign in, create an account |
| `/account`, `/account/bookings/:ref`, `/account/club`, `/account/profile` | signed in | Bookings, cancel, review, club card, profile |
| `/admin/*` | admins only | Dashboard, bookings, rooms, services, amenities, guests |

- The JWT is kept in `localStorage`; `AuthProvider` loads the current user from `/auth/me`.
- `RequireAuth`, `RequireAdmin` and `GuestOnly` guard the route groups. Visitors sent to the login
  page come back to where they were (`?next=`), with their booking choices intact. `safeNext`
  only accepts in-app paths, so the return link can't be abused to send people to another site.

## Booking flow

1. Pick dates and party size in the hero's booking bar, or in the availability calendar on a
   room page.
2. `/book/:slug` shows the room, the extras with their pricing unit, and a summary priced by the
   API's `/bookings/quote` on every change. Already-booked dates are flagged before submitting.
3. Signed-out guests sign in and return with dates, guests and extras kept.
4. Confirming creates the booking and opens its page with a confirmation message.
5. From the account the guest can cancel before arrival (with a confirmation dialog) and review
   the stay once it has ended.

## Isla Blanca Club

The club gives every account a tier (Silver, Gold, Platinum) with a discount on room nights;
the rules live in the API (see [api.md](api.md#isla-blanca-club)).

- `/club` presents the tiers. Its numbers come from `/membership/tiers`; the same values ship
  in `data/club.ts` and show until the API answers, so the page never waits on a sleeping server.
- `MemberCard` draws the card in CSS (brushed-metal gradients, an engraved frame, a chip), so it
  carries the guest's own name and number. It tilts towards the pointer with a moving
  reflection, and stays still for visitors who prefer reduced motion. Its text is sized in
  container units, so the card looks the same at any width.
- `/account/club` shows the guest's card and their progress to the next tier.
- Signed-in guests see their member rate as its own line in the booking summary and on the
  booking's page. The quote's cache key includes the tier, so signing in reprices the stay.
- Staff change a guest's tier from the Guests page; completing a stay refreshes the guest's card.
- Prices show cents only when there are any (`formatPrice`), so a discounted bill adds up exactly.

## Availability calendar

Each room page shows two months (one on phones) of that room's calendar, from
`/rooms/{slug}/availability` for the next 365 days. Booked nights are struck through; the guest
picks an arrival and then a departure date and goes on to `/book/:slug` with them.

- A stay may end on the morning another one starts, so a booked night is still offered as a
  departure date. The latest departure is the next booked night or 30 nights, whichever is
  first (`features/rooms/calendar.ts`, unit-tested).
- It works from the keyboard like a date picker: one day is in the tab order, arrow keys move
  by day or week, Page Up/Down by four weeks, Home/End to the week's ends, and the months follow.
  Each day has a full label ("Saturday 31 October 2026, booked") and the selection is announced.

## Motion and scrolling

- **Smooth scrolling** with Lenis (`lib/smoothScroll.ts`). It keeps native
  scrolling underneath, so scroll restoration and Motion's scroll effects keep working. Dialogs
  and the mobile menu lock the page while open (`useScrollLock`).
- **Page transitions**: each new page fades in. The page a visitor lands on appears at once, and
  moving between tabs of the account or staff area keeps their layout still.
- **Parallax** (`useParallax`): the hero photo sinks as the page scrolls over it, the reviews
  photo drifts behind its section, and the framed video in About rises a little faster than
  the text beside it.
- With the operating system's "reduce motion" setting on, there is no smooth scrolling, no
  parallax and Motion skips its animations.

## Accessibility

- A "Skip to content" link, a visible focus ring, labelled icon buttons and landmarks.
- Dialogs and the mobile menu trap focus, close with Escape and return focus to what opened them.
- **Contrast**: the brand gold (2.5:1 on cream) and sage (3.9:1) are too light for text on
  light backgrounds, so text there uses `gold-deep` and `sage-deep` (5.2:1 and 5.5:1, same hues).
  The original gold stays on the dark green sections, where it passes. `Eyebrow` and
  `ArrowLink` take a `tone` for the surface they sit on.
- Lighthouse accessibility: 100 on every public page.

## Design system

- **Tokens** live in `styles/index.css` under `@theme`: the palette (`gold`, `forest`,
  `sage`, `cream`, `sand`, …), three fonts and the breakpoints (`md` = 810px,
  `lg` = 1200px).
- **Type roles** are utilities (`text-display`, `text-heading`, `text-subheading`,
  `text-card-title`, `text-quote`, `text-eyebrow`, `text-button`, `text-label`) that change size
  per breakpoint as the design spec sets out. `cn()` (tailwind-merge) knows them, so later classes
  override earlier ones predictably.
- **Animations** use the values from `lib/motion.ts`. Everything honours the
  visitor's "reduce motion" setting.
- **Revenue chart** (admin): one series, sage columns (gold fails 3:1 contrast on white), a value
  label only on the latest month, tooltips on hover and focus, and a hidden data table for screen
  readers.

## Performance

- Every page except Home is lazy-loaded. React, Motion and the 360° viewer are separate chunks
  that browsers cache across deploys.
- The 360° tour (Photo Sphere Viewer + three.js, ~630 kB) downloads only when a visitor presses
  "Start the 360° tour"; until then the room page shows a small preview image.
- **Images**: every photo has WebP copies 800 and 1600 px wide (`npm run images` after adding
  one). `photo(src, sizes)` from `lib/images.ts` returns `src`, `srcSet` and `sizes`, so phones
  download a ~50 kB WebP instead of a ~400 kB JPEG. The sketch backgrounds use the same copies.
- The home hero photo is preloaded with high priority; Google Fonts load without blocking the
  first paint.

Lighthouse (production build, `npm run build && npm run preview`):

| Page | Desktop: perf / a11y / best practices / SEO | Mobile performance |
|---|---|---|
| Home | 97 / 100 / 100 / 100 | 80 |
| Rooms | 100 / 100 / 100 / 100 | 87 |
| Room | 97 / 100 / 100 / 100 | 78 |
| Gallery | 98 / 100 / 100 / 100 | 87 |
| Services | 97 / 100 / 100 / 100 | 79 |
| Contact | 91 / 100 / 100 / 100 | 74 |
| Sign in | 99 / 100 / 100 / 100 | 93 |

On a throttled phone the largest element is usually the hero title, and the design brings it
in with a 0.5 s delay and a 2 s fade, which Lighthouse counts in Largest Contentful Paint.
Accessibility, best practices and SEO are 100 on mobile too.

## Running and testing

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, /api is proxied to the API on :8000
npm test             # Vitest: dates, calendar, images, prices, API client, redirects, guards, card
npm run build        # type-check and production build into dist/
npm run lint         # oxlint
npm run format       # prettier (with Tailwind class sorting)
npm run api:types    # regenerate API types (needs the API running)
npm run images       # WebP copies of new photos (needs cwebp: brew install webp)
```

In production the API origin comes from `VITE_API_URL` (e.g. `https://…onrender.com`) and the
site's folder from `VITE_BASE` (see [deployment.md](deployment.md)).
