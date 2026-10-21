# Images and media

All images, icons and video live in `frontend/public/images/` and are served from
`/images/...`, the same paths the database seed uses.

Next to each photo, `npm run images` (in `frontend/`) writes WebP copies 400, 800, 1200 and
1600 px wide (`hero-400.webp` … `hero-1600.webp`), which the site serves through `srcset`. The
tables below list the originals only.

## Brand

The resort is called **Isla Blanca**, after Ibiza's nickname "la Isla Blanca" (the White Isle).
The logo is set as text in Cormorant Garamond (`ISLA BLANCA`, wide letter-spacing, gold
`#b99a6b`) next to a small sun mark.

**Fonts** (SIL Open Font License), served from `frontend/public/fonts/` as variable woff2 files,
Latin only, taken from the `@fontsource-variable` packages; `fonts.css` declares them.
- Headings: Cormorant Garamond (upright and italic)
- Body: Manrope
- UI / small text: Inter

**Colors**
| Token | Hex | Used for |
|---|---|---|
| gold | `#b99a6b` | accent, icons, links on dark surfaces |
| gold-light | `#dbae69` | hover accent |
| gold-deep | `#7d6337` | gold text on light surfaces (WCAG AA) |
| forest | `#1e2a24` | dark sections, footer |
| forest-2 | `#223029` | dark section variant |
| sage | `#6f7f73` | muted accents |
| sage-deep | `#58675c` | sage text and buttons on light surfaces (WCAG AA) |
| green | `#79a383` | success / available |
| cream | `#f8f5f0` | page background |
| sand | `#eee7dd` | cards, alternate sections |
| ink | `#222222` | headings |
| ink-soft | `#5a5a5a` | body text |

## Where each file is used

### `brand/`
| File | Use |
|---|---|
| `signature.svg` | Home › About: "Guest Experience Manager" signature |
| `noise-texture.webp` | Grain overlay on top of hero photos (256×256 tile, lossless) |

### `home/`
| File | Size | Use |
|---|---|---|
| `hero.jpg` | 2720×1760 | Home hero background |
| `about-bg.jpg` | 1672×854 | Line-art background of Home › About, Services › Intro, Contact › Info and the 404 page |
| `about-video.mp4` | 720×1280, 0.7 MB | Home › About: video in the rounded frame (H.264, re-encoded at CRF 26, SSIM 0.986 to the source) |
| `about-video-poster.webp` | 640×1138 | Poster frame for `about-video.mp4` |
| `rooms-section-bg.jpg` | 1755×896 | Line-art background of the rooms sections and the Rooms page |
| `gallery-section-bg.jpg` | 1536×1024 | Line-art background of the gallery collage |
| `reviews-bg.jpg` | 2720×1760 | Guest reviews section background |
| `mobile-menu-bg.jpg` | 1755×896 | Mobile navigation overlay |

### `rooms/`
| File | Use |
|---|---|
| `<room-slug>.jpg` | Cover photo of each room: room cards and the room page hero |
| `detail-01.jpg`, `detail-02.jpg`, `detail-03.jpg` | Photo strip on room pages; also in the gallery |

All room photos are 1536×1024.

### `gallery/`
| File | Use |
|---|---|
| `gallery-01.jpg` … `gallery-05.jpg` | Home gallery collage and Gallery page (`gallery-01` is behind the sign-in pages, `gallery-02` behind the Services hero, `gallery-05` behind the contact form) |
| `gallery-06.jpg` | Gallery page and the spa experience |

### `services/`
| File | Use |
|---|---|
| `service-01.jpg`, `service-02.jpg` | Dining and private experiences on Home and Services |

### `icons/`
Single-color line icons, painted with CSS `mask` so they take the current text color.

| File | Use |
|---|---|
| `meta-size.svg`, `meta-bed.svg`, `meta-guests.svg` | Room size, bed type and guests on cards and room pages |
| `service-*.svg` | `Service` icons |
| `amenity-*.svg` | `Amenity` icons on room pages |

### `tour/`
| File | Size | Use |
|---|---|---|
| `panorama-360.jpg` | 4096×2048, 1.9 MB | Equirectangular panorama for the 360° room tour (Photo Sphere Viewer) |
| `panorama-360-small.jpg` | 1774×887 | Preview shown until the visitor starts the tour |

## Optimisation

- Photos are JPEG (quality 82) with WebP copies at 400, 800, 1200 and 1600 px for `srcset`.
- The panorama is 4096×2048, the largest texture size every GPU supports.
- Media files carry no editing metadata.
