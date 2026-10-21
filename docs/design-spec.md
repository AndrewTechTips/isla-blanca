# Design spec

The visual design of Isla Blanca: layout, type, components and the exact animation values the
frontend implements. Colors, fonts and where each image is used are in [assets.md](assets.md).

## Breakpoints

The site has three layouts, set as Tailwind breakpoints.

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
`— ISLA BLANCA, IBIZA —`.

## Components

### Buttons
| Variant | Background | Text | Padding | Radius | Height | Used for |
|---|---|---|---|---|---|---|
| Primary sage | `#58675c` (sage-deep, for AA contrast) | cream | 12px 16px | 5px | 45px | About Us, Explore Room |
| Primary gold | `#b99a6b` | forest | 12px 16px | 5px | 45px | More Services, Get in Touch, Request Booking |
| Ghost | transparent gold | white | 12px 16px | 5px | 45px | Discover Rooms (on the hero) |
| Text link with arrow | none | gold `#b99a6b` | 0 | — | 24px | Book Now, All Rooms |

Each button label is rendered twice so the text can roll up on hover.

### About video
- `340 × 604px` frame (the video's 9:16 shape) with `200px` corners, so it reads as a tall pill
- A `1px` gold outline follows it `10px` away on every side, so the frame stays centered

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
- Bottom row: copyright on the left, location on the right

### Decorative backgrounds
The cream sections use faint line-art illustrations (palms, mountains, a Buddha statue) as
full-section backgrounds: `home/about-bg.jpg`, `home/rooms-section-bg.jpg`,
`home/gallery-section-bg.jpg`. A grain texture (`brand/noise-texture.png`) sits over hero photos.

## Page structure

| Page | Sections in order |
|---|---|
| Home | Hero (100vh + booking bar) → About (text + framed video) → CTA band → Featured Rooms (3 cards) → Services (dark) → Gallery → Reviews → FAQ → Footer |
| Rooms | Rooms grid (all 6) → Reviews → FAQ → Footer |
| Room detail | Hero (room photo + booking bar) → Room (price, meta, description, photo strip, amenities with icons) → CTA band → Other Rooms → Reviews → FAQ → Footer |
| Services | Hero → Intro → Services list → Reviews → FAQ → Footer |
| Gallery | Gallery collage → Footer |
| Club | Dark hero (text + fanned member cards) → Tiers (card, discount, perks) → How it works → Benefits (dark) → FAQ → CTA band → Footer |
| Contact | Form → Contact info → CTA band → FAQ → Footer |

## Animations

Every reveal runs once, when the element enters the viewport. "Spring 2s / 0.2" means a
time-based spring, which maps 1:1 to Motion: `{ type: "spring", duration: 2, bounce: 0.2 }`.
The standard ease `[0.44, 0, 0.56, 1]` is written as `ease`.

### On page load (hero)
| Element | From | Transition |
|---|---|---|
| Hero photo | `scale 1.2` | tween 4s, `ease` |
| Title | `opacity 0, y 30` | spring 2s / bounce 0.3, delay 0.5s |
| Eyebrow ("Welcome to …") | `opacity 0, y 40` | spring 2s / bounce 0.2, delay 0.7s |
| Paragraph | `opacity 0` | spring 2s / bounce 0.2, delay 1.0s |
| Button + booking bar | `opacity 0` | spring 1s / bounce 0.2, delay 1.3s |

### On scroll into view
| Element | From | Transition |
|---|---|---|
| About background / video frame | `opacity 0` | tween 1.3s, `ease` |
| Buttons (About Us, All Rooms, Book Now, Get in Touch) | `opacity 0` | spring 1s / bounce 0.2, delay 0.5–1.3s |
| CTA band sentence | each **word** `opacity 0, y 10, blur(10px)` | spring 1.5s / bounce 0, delay 0.05s per word |
| Room cards | `opacity 0, y −40` (drop from above) | spring 2s / bounce 0.2, delay `index × 0.4s` |
| Service icon | `rotateY 90°` (3D flip) | spring 2s / bounce 0.5, delay 0.5s |
| Service title, eyebrow, text | `opacity 0` | spring 2s / bounce 0, delays 0.5s, 0.8s, 1.1s |
| Reviews photo | `scale 1.2` | tween 4s, `ease` |
| Review quote | `opacity 0, y 30` | spring 2s / bounce 0.3, delay 0.5s |
| Review stars and source | `opacity 0, y 40` | spring 2s / bounce 0.2, delay 0.7s |

### Scroll-linked
| Element | Effect |
|---|---|
| Gallery photos | Each photo starts scattered and maps to its final place as the section scrolls through the viewport (`useScroll` on the section + `useTransform`). Start states: `opacity .5, rotate −10°, scale .5, x −30, y −121` · `rotate 10°, scale .5, x 20, y −122` · `rotate 30°, scale .6, x −10, y −121` · `rotate 10°, scale .3, x −40, y 69` · `rotate −10°, scale .4, y 79` → `opacity 1, rotate 0, scale 1, x 0, y 0` |
| Services card stack | Cards stack while scrolling, smoothed with a spring `{ stiffness: 500, damping: 60 }` |

### Interactions
| Element | Effect | Transition |
|---|---|---|
| Sage button hover | background `#58675c` → `#4a584e` | spring 0.4s / bounce 0.2 |
| Gold button hover | background `#b99a6b` → `#dbae69` | spring 0.4s / bounce 0.2 |
| Ghost button hover | background → `rgba(248,245,240,.3)` | spring 0.4s / bounce 0.2 |
| Button label | Label rolls up to a duplicate on hover | spring 0.4s / bounce 0.2 |
| Nav link hover | text `opacity .5` → `1`, underline `scaleX 0` → `1` | spring 0.4s / bounce 0.2 |
| Form input focus | underline `scale 0` → `1` | spring 0.4s / bounce 0.2 |
| FAQ row open | answer `opacity 0, blur(10px)` → sharp; plus icon lines rotate 90° / 180° into a minus | spring 0.4s / bounce 0.2 |
| Review slider | inactive quotes `blur(5px)`, active `blur(0)` | tween 0.7s, `ease` |
| Gallery photo click | lightbox over `rgba(0,0,0,.8)`, max width 960px, padding 20px | tween 0.7s, `ease` |

## Implementation notes

- Each row above maps to a Motion `initial` / `whileInView` pair
  (`viewport={{ once: true }}`), and the gallery to `useScroll` + `useTransform`.
- Load fonts from Google Fonts: Cormorant Garamond (500, 600, 700, 900, plus italic 700),
  Manrope (500, 600, 700, 800), Inter (800, 900).
- Each button label is duplicated for the hover roll; build it once as a `<Button>` component.
