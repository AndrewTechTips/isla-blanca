# Frontend

React 19 + TypeScript single-page app built with Vite, styled with Tailwind CSS 4 and animated
with Motion. It reproduces the Aurelia template 1:1 (see [design-spec.md](design-spec.md)) and
reads rooms from the API.

## Structure

```
frontend/
├── public/images/           photos, icons, video and panoramas (docs/assets.md)
└── src/
    ├── app/router.tsx       routes; every page except Home is lazy-loaded
    ├── components/
    │   ├── brand/           logo, social icons
    │   ├── layout/          root layout, navbar, mobile menu, footer
    │   ├── motion/          Reveal and WordReveal animation wrappers
    │   ├── rooms/           room card and its loading skeleton
    │   ├── sections/        page sections reused across pages (hero, booking bar, FAQ, ...)
    │   └── ui/              buttons, links, eyebrow labels, mask icons
    ├── data/                static copy: navigation, contact details, FAQ, testimonials
    ├── hooks/               useApi (data loading), usePageTitle
    ├── lib/
    │   ├── api/             typed fetch client and response types
    │   ├── motion.ts        spring and tween presets taken from the template
    │   └── ...              formatting, class names, sketch backgrounds
    ├── pages/               one component per route
    └── styles/index.css     Tailwind theme: colors, fonts, breakpoints, type scale
```

## Design system

- **Tokens** live in `styles/index.css` under `@theme`: the template's palette (`gold`, `forest`,
  `sage`, `cream`, `sand`, ...), three fonts and Framer's breakpoints (`md` = 810px,
  `lg` = 1200px).
- **Type roles** are utilities (`text-display`, `text-heading`, `text-subheading`,
  `text-card-title`, `text-quote`, `text-eyebrow`, `text-button`, `text-label`) that change size
  per breakpoint exactly like the template.
- **Animations** use the template's own values from `lib/motion.ts`: a hero load sequence,
  reveal-on-scroll for sections, word-by-word blur reveal, room cards dropping in from above,
  3D icon flips, a scroll-linked gallery collage, blurred review transitions and an animated
  FAQ accordion. Everything honours the visitor's "reduce motion" setting.

## Pages

| Route | Content |
|---|---|
| `/` | Hero with booking bar, About, CTA, featured rooms, experiences, gallery, reviews, FAQ |
| `/rooms` | All rooms from the API; with `check_in`, `check_out`, `guests` only free rooms |
| `/rooms/:slug` | Room hero with pre-selected booking bar, photos, description, amenities, other rooms |
| `/services` | Hero, intro, the three signature experiences |
| `/gallery` | Scroll-linked collage and a masonry grid |
| `/contact` | Contact form (opens the mail app), location and map |
| `*` | 404 page |

## Running

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, /api is proxied to the API on :8000
npm run build        # type-check and production build into dist/
npm run lint         # oxlint
npm run format       # prettier (with Tailwind class sorting)
```

In production the API address comes from `VITE_API_URL`.
