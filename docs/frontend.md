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
  scrolling underneath, so scroll restoration and Motion's scroll effects keep working. Lenis
  runs inside Motion's frame loop, so there is one animation loop and every scroll-linked
  effect reads the position of the same frame. Dialogs and the mobile menu lock the page while
  open (`useScrollLock`).
- **Page transitions**: each new page fades in. The page a visitor lands on appears at once, and
  moving between tabs of the account or staff area keeps their layout still.
- **Parallax** (`useParallax`): the hero photo sinks as the page scrolls over it, the reviews
  photo drifts behind its section, and the framed video in About rises a little faster than
  the text beside it.
- **Off the main thread.** Movement is animated as one `transform` (plus `opacity`), never as
  separate `x`/`y`/`scale` values, because Motion only hands `transform` and `opacity` to the
  browser:
  - entrance animations (`Reveal`, room cards, `FlipIn` icons, word reveals) run as Web
    Animations on the compositor, so ten room cards springing in no longer restyle the page on
    every frame;
  - scroll-linked effects (parallax, the gallery collage) are attached to native scroll
    timelines where the browser has them (Chrome, Edge, Safari 26), so they stay glued to the
    scroll even on a busy phone, and fall back to Motion's JavaScript tracking elsewhere.
  `useMove()` in `lib/motion.ts` builds these transforms and leaves them out for "reduce motion".
- With the operating system's "reduce motion" setting on, there is no smooth scrolling, no
  parallax and no movement: elements only fade in.

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

Measured, not guessed: a scroll benchmark (Chrome, a real window with vsync, page scrolled top to
bottom, phone run with the CPU slowed 4×) records frame times and how busy the main thread is,
and Lighthouse runs on the production build. Every change below was kept only if those numbers
improved and the page looked the same (old and new screenshots compared side by side, and the
scroll-linked elements checked to sit within 1 px of where they were).

**Loading**
- Every page except Home is lazy-loaded. React, Motion and the 360° viewer are separate chunks
  that browsers cache across deploys. The 360° tour (Photo Sphere Viewer + three.js, ~630 kB)
  downloads only when a visitor presses "Start the 360° tour".
- **Data in parallel with code**: the router starts a page's main request (the room list, a
  room) while the page's chunk is still downloading (`loader` in `app/router.tsx`), instead of
  after it has rendered. The booking bar and the featured rooms share one room-list request.
- **Next pages ahead of time** (`app/prefetch.ts`): a page's code is fetched as soon as the
  pointer is over a link to it (or a finger touches one), and all public pages a few seconds
  after load, when the browser is idle. Skipped in "save data" mode.
- **Images**: every photo has WebP copies 400, 800, 1200 and 1600 px wide (`npm run images`).
  `photo(src, sizes)` returns `src`, `srcSet`, `sizes` and `decoding="async"`, so a phone gets the
  size it shows and a large photo coming into view is decoded off the main thread. The first
  room cards load their photo straight away (the first with high priority); the rest wait until
  they are near.
- The home hero photo is preloaded only on the home page (a small script in `index.html`), so
  other pages don't spend a phone's bandwidth on it.
- **Fonts** are served with the site (`public/fonts`, variable woff2, Latin only) and requested
  after the first page has painted and loaded (`lib/fonts.ts`), so they never compete with the
  first paint or the first screen's photos. Until they arrive, local fonts resized to the same
  metrics (`size-adjust`, `ascent-override`) stand in, so the swap doesn't move the text.
- The About video is re-encoded (0.7 MB instead of 1.5 MB, visually the same), and only
  downloads and plays when it is near the screen; it pauses once it has scrolled away.

**Scrolling and animation**
- Entrance animations and scroll-linked effects run on the compositor, not the main thread
  (see "Motion and scrolling" above), and Lenis shares Motion's frame loop.
- The reviews carousel only turns while it is on screen: its blur-to-sharp change can't run on
  the compositor, and a carousel turning out of sight kept every page that has it restyling on
  every frame.
- No backdrop blur behind the near-opaque booking bar and price badges, where it wasn't visible.

Lighthouse on a phone, production build (`npm run build && npm run preview`), median of three
runs with real network and CPU throttling (DevTools), before and after the performance work:

| Page | Score | First paint | Largest paint | Layout shift | Speed Index | Transfer |
|---|---|---|---|---|---|---|
| Home | 76 → 83 | 3.08 → 2.77 s | 4.72 → 3.92 s | 0.053 → 0.006 | 3.79 → 3.47 s | 2264 → 715 kB |
| Rooms | 68 → 74 | 3.58 → 3.26 s | 6.01 → 4.89 s | 0 → 0 | 4.70 → 4.09 s | 772 → 753 kB |
| Room | 71 → 75 | 3.56 → 3.44 s | 4.77 → 4.55 s | 0.018 → 0 | 5.65 → 4.62 s | 603 → 569 kB |
| Services | 70 → 77 | 3.62 → 3.28 s | 5.24 → 4.43 s | 0.001 → 0 | 5.02 → 4.23 s | 623 → 595 kB |
| Gallery | 67 → 71 | 3.56 → 3.26 s | 6.32 → 5.46 s | 0 → 0.001 | 4.85 → 4.53 s | 919 → 900 kB |
| Club | 71 → 79 | 3.68 → 3.34 s | 4.90 → 3.96 s | 0.049 → 0.009 | 4.84 → 4.21 s | 440 → 408 kB |
| Contact | 72 → 79 | 3.58 → 3.31 s | 4.83 → 3.92 s | 0.001 → 0.001 | 5.22 → 4.63 s | 915 → 895 kB |

With Lighthouse's default simulated throttling (what PageSpeed Insights shows) the phone scores
are 86–93 (Rooms 78, where the simulation and the real-throttling run disagree), and desktop is
98–100 on every page.

Scrolling a whole page on a phone (CPU slowed 4×), the main thread is busy 15% of the time on
Home (was 22%), 33% on Rooms (was 47%) and 14% on a room page (was 17%); at rest it now does no
work at all (the reviews carousel used to restyle every page that has it on every frame).

On a throttled phone the largest element is often the hero text, which the design brings in
with a delay and a 2 s fade; Lighthouse counts that in Largest Contentful Paint.

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
