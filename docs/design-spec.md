# Design spec

Measured from the live Aurelia template (https://aurelia-template.framer.website/) on
2026-10-17, so the frontend can reproduce it 1:1 before we improve on it. Colors, fonts and
the asset map are in [`assets/ASSETS.md`](../assets/ASSETS.md).

Values marked **TBD (Remix)** can only be read from the Framer editor: animation durations,
easing and spring settings.

## Breakpoints

Framer uses three layouts. Tailwind config should match them exactly.

| Name | Width | Notes |
|---|---|---|
| Desktop | ≥ 1200px | Design reference width: 1440px |
| Tablet | 810–1199px | Two-column sections keep their row layout, smaller type |
| Phone | < 810px | Everything stacks into one column, burger menu |

## Layout grid

- Content container: `max-width: 1180px`, horizontal padding `24px` at every breakpoint
- Navbar: `72px` tall, transparent over the hero, container padding `16px 24px`
- Vertical section padding:

| Section | Desktop | Tablet | Phone |
|---|---|---|---|
| Standard section (About, Rooms, Gallery, FAQ) | 160px | 64px (About: 120px top, 64px bottom) | 64px |
| Services (dark) | 120px | 64px | 64px |
| CTA band | 40px | 40px | 40px |
| Footer | 80px | 80px | 32px |

## Typography

All headings use **Cormorant Garamond** with negative letter-spacing (−4% of the font size).
Body text uses **Manrope**. Small labels use **Inter** or Manrope in uppercase with wide tracking.

| Role | Font | Desktop | Tablet | Phone | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|---|
| Hero title (h1) | Cormorant Garamond | 80px | 64px | 56px | 500 | 1.1 | −0.04em |
| Section title (h2) | Cormorant Garamond | 64px | 48px | 48px | 600–700 | 1.0 | −0.04em |
| Review quote | Cormorant Garamond, italic | 40px | 32px | 24px | 700 | 1.4 | −0.04em |
| CTA band sentence | Cormorant Garamond | 36px | 28px | 22px | 700 | 1.1 | −0.04em |
| Service title | Cormorant Garamond | 36px | 28px | 22px | 900 | 1.1 | −0.04em |
| Card title (room name) | Cormorant Garamond | 28px | 22px | 22px | 700 | 1.1 | −0.04em |
| Body | Manrope | 16px | 16px | 16px | 500 | 1.6 | −0.02em |
| Body small (card meta, footer) | Manrope | 14px | 14px | 14px | 500 | 1.6 | −0.02em |
| Button label | Manrope | 13px | 13px | 13px | 600 (800 for text links) | 1.6 | 0.133em |
| Nav link | Manrope, uppercase | 12px | — | — | 600 | 1.5 | 0.15em |
| Eyebrow (above titles) | Inter, uppercase | 12px | 12px | 12px | 800 | 1.6 | 0.19em |
| Price label ("From $239") | Manrope | 12px | 12px | 12px | 800 | 1.6 | 0.2em |
| Form label | Manrope | 11px | 11px | 11px | 500 | 1.6 | 0.2em |
| Caption (signature role, review source) | Inter | 10px | 10px | 10px | 800–900 | 1.6 | 0.19em |

Eyebrows are gold (`#b99a6b`) with a short horizontal line on each side, e.g.
`— AURELIA RESORT, IBIZA —`.

## Components

### Buttons
| Variant | Background | Text | Padding | Radius | Height | Used for |
|---|---|---|---|---|---|---|
| Primary sage | `#6f7f73` | cream | 12px 16px | 5px | 45px | About Us, Explore Room |
| Primary gold | `#b99a6b` | forest | 12px 16px | 5px | 45px | More Services, Get in Touch, Request Booking |
| Ghost | transparent gold | white | 12px 16px | 5px | 45px | Discover Rooms (on the hero) |
| Text link with arrow | none | gold `#b99a6b` | 0 | — | 24px | Book Now, All Rooms |

Each button label is rendered twice so the text can roll up on hover.

### Booking bar (hero)
- Dark forest panel `#1e2a24` with `12px` radius and `20px` inner padding; sits at the bottom of the hero
- One row on desktop (Name, Email, Room type, Check in, Check out, Adults, Children, button); stacked on phone
- Labels: gold, 11px, letter-spaced. Inputs: translucent dark fill, cream text, no border; an underline scales in on focus

### Room card
- `372 × 562px` on desktop (three per row), radius `8px`, cream background `#f8f5f0`
- Image on top, `372 × 248px`, with a price tag in the top-right corner ("From $239", dark pill)
- Body padding `16px`: title (Cormorant 28px), meta row with gold icons (m², bed, guests), description, full-width sage "Explore Room" button

### Services (dark section)
- Two columns: a sticky intro on the left (eyebrow, title, text, gold button) and a stack of tall cards on the right
- Each card: thin gold border frame, round icon badge on top, centered title, gold eyebrow, centered description

### Gallery
- Collage of 5–6 slightly rotated photos with radius over a light sketch background
- Photos assemble from a scattered, scaled-down state while scrolling (see Animations)

### Reviews
- Full-bleed photo background with a dark overlay, `630px` tall
- One centered italic quote at a time, stars and source below, dot navigation
- Inactive quotes stay blurred (`blur(5px)`) and fade out

### FAQ
- Two columns: intro and "Get in Touch" button on the left, accordion on the right
- Rows separated by hairlines, `+` icon that rotates 180° when the row opens

### Footer
- Forest background, four columns: brand (logo, address, tagline), Contact, Social, Pages
- Bottom row: credit on the left, copyright on the right

### Decorative backgrounds
The cream sections use faint line-art illustrations (palms, mountains, a Buddha statue) as
full-section backgrounds: `home/about-bg.jpg`, `home/rooms-section-bg.jpg`,
`home/gallery-section-bg.jpg`. A grain texture (`brand/noise-texture.png`) sits over hero photos.

## Page structure

| Page | Sections in order |
|---|---|
| Home | Hero (100vh + booking bar) → About (text + arched video) → CTA band → Featured Rooms (3 cards) → Services (dark) → Gallery → Reviews → FAQ → Footer |
| Rooms | Rooms grid (all 6) → Reviews → FAQ → Footer |
| Room detail | Hero (room photo + booking bar) → Room (price, meta, description, photo strip, amenities with icons) → CTA band → Other Rooms → Reviews → FAQ → Footer |
| Services | Hero → Intro → Services list → Reviews → FAQ → Footer |
| Gallery | Gallery collage → Footer |
| Contact | Form → Contact info → CTA band → FAQ → Footer |

## Animations

Initial states were read from the live page. Every reveal is triggered once, when the element
enters the viewport.

| Where | Effect | From → To |
|---|---|---|
| Hero photo | Slow zoom-out on load | `scale(1.2)` → `scale(1)` |
| Hero eyebrow | Fade up | `opacity 0, y 40px` → visible |
| Hero title | Fade up | `opacity 0, y 30px` → visible |
| Hero text, booking bar | Fade in | `opacity 0` → `1` |
| Nav links | Underline on hover | `scaleX(0)` → `scaleX(1)` |
| Form inputs | Underline on focus | `scale(0)` → `scale(1)` |
| Buttons (About Us, All Rooms, Book Now, Get in Touch) | Fade in | `opacity 0` → `1` |
| CTA band sentence | Word-by-word reveal, staggered | each word `opacity 0, y 10px, blur(10px)` → sharp |
| Room cards | Drop in **from above**, staggered | `opacity 0, y −40px` → visible |
| Service icons | 3D flip | `rotateY(90deg)` → `0` |
| Service card text | Fade in | `opacity 0` → `1` |
| Gallery photos | Scroll-linked assemble | `opacity 0.5`, scattered offsets, `scale(0.3–0.6)`, `rotate(±10–30deg)` → final collage |
| Reviews photo | Zoom | `scale(1.2)` → `scale(1)` |
| Review quote, stars, source | Fade up | `opacity 0, y 30–40px` → visible |
| Review slider | Inactive slides blurred | `blur(5px)` + fade |
| FAQ answer | Open with blur | `opacity 0, blur(10px)` → sharp; icon `rotate(180deg)` |

**TBD (Remix):** duration or spring stiffness/damping for each row, stagger delays, and the
scroll range of the gallery effect. Until then use a Motion spring of
`{ type: "spring", stiffness: 120, damping: 20 }` and `0.08s` stagger for words and cards.

## Implementation notes

- Framer renders with Motion, the same library we use in React, so each row above maps to an
  `initial` / `whileInView` pair (`viewport={{ once: true }}`), and the gallery to
  `useScroll` + `useTransform`.
- Load fonts from Google Fonts: Cormorant Garamond (500, 600, 700, 900, plus italic 700),
  Manrope (500, 600, 700, 800), Inter (800, 900).
- Each button label is duplicated for the hover roll; build it once as a `<Button>` component.
