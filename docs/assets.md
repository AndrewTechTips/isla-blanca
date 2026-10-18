# Design assets

Original-resolution assets taken from two free Framer Marketplace templates, used as the visual
base for this project. Downloaded 2026-10-17. They live in `frontend/public/images/` and are
served from `/images/...`, the same paths the database seed uses.

Next to each photo, `npm run images` (in `frontend/`) writes WebP copies 800 and 1600 px wide
(`hero-800.webp`, `hero-1600.webp`), which the site serves through `srcset`. The tables below
list the originals only.

| Source | Author | Live preview | License |
|---|---|---|---|
| [Aurelia Hotel](https://www.framer.com/marketplace/templates/aurelia-hotel/) | Slashdown | https://aurelia-template.framer.website/ | Framer Limited Commercial License (Free Content) |
| [Sereno 360° Resort](https://www.framer.com/marketplace/templates/sereno-360-resort/) | on3step | https://sereno360.framer.website/ | Framer Limited Commercial License (Free Content) |

The license ([Framer Community Terms §7.3.1](https://www.framer.com/legal/community-terms))
allows using and modifying free content inside our own project. It does **not** allow
redistributing these files as a standalone pack, or presenting the design as our original work.
Keep the credit in the README and the site footer.

## Our brand: Isla Blanca

The resort in this project is called **Isla Blanca**, after Ibiza's nickname "la Isla Blanca"
(the White Isle). The template's name "Aurelia" must not appear in the UI:
`brand/logo-aurelia.svg` is the template's wordmark and is kept only as a reference.
Our logo is set as text in Cormorant Garamond (`ISLA BLANCA`, wide letter-spacing, gold
`#b99a6b`).

## Brand tokens (from Aurelia)

**Fonts** (all on Google Fonts)
- Headings: Cormorant Garamond
- Body: Manrope
- UI / small text: Inter

**Colors**
| Token | Hex | Used for |
|---|---|---|
| gold | `#b99a6b` | accent, icons, links |
| gold-light | `#dbae69` | hover accent |
| forest | `#1e2a24` | dark sections, footer |
| forest-2 | `#223029` | dark section variant |
| sage | `#6f7f73` | muted text on dark |
| green | `#79a383` | success / available |
| cream | `#f8f5f0` | page background |
| sand | `#eee7dd` | cards, alternate sections |
| ink | `#222222` | headings |
| ink-soft | `#5a5a5a` | body text |
| black | `#1c1d1c` | text on light |
| white | `#ffffff` | |

## Where each file is used in the original template

### `brand/`
| File | Original section |
|---|---|
| `logo-aurelia.svg` | Navbar logo (all pages) |
| `signature.svg` | Home › About: "Guest Experience Manager" signature |
| `noise-texture.png` | Grain overlay on top of hero photos (256×256 tile) |

### `home/`
| File | Size | Original section |
|---|---|---|
| `hero.jpg` | 2720×1760 | Home › Hero background ("Experience Timeless Luxury" + booking form) |
| `about-bg.jpg` | 1672×854 | Home › About background; also Services › Intro and Contact › Info backgrounds |
| `about-video.mp4` | vertical, 1.5 MB | Home › About: video in the arched frame |
| `about-video-poster.jpg` | 720×1280 | Poster frame for `about-video.mp4` |
| `rooms-section-bg.jpg` | 1755×896 | Background of the "Featured Rooms" / "Other Rooms" sections; Gallery page background |
| `gallery-section-bg.jpg` | 1536×1024 | Home › "A Glimpse of Aurelia" background |
| `reviews-bg.jpg` | 2720×1760 | Reviews section background (Home, Rooms, Services, room pages) |
| `mobile-menu-bg.jpg` | 1755×896 | Mobile navigation overlay |

### `rooms/`
| File | Original use |
|---|---|
| `tropical-garden-suite.jpg` | Room card + hero of `/rooms/tropical-garden-suite` (85 m², king bed, 6 guests, from $239) |
| `infinity-pool-villa.jpg` | Room card + hero of `/rooms/infinity-pool-villa` (77 m², double bed, 4 guests, from $209) |
| `sunset-premium-ocean-suite.jpg` | Room card + hero of `/rooms/sunset-premium-ocean-suite` (57 m², single bed, 2 guests, from $199) |
| `coastal-breeze-suite.jpg` | Room card on `/rooms` |
| `executive-ocean-residence.jpg` | Room card on `/rooms`; also in the gallery |
| `private-garden-villa.jpg` | Room card on `/rooms` |
| `detail-01.jpg`, `detail-02.jpg`, `detail-03.jpg` | Photo strip on every room detail page; also in the gallery |

All room photos are 1536×1024.

### `gallery/`
| File | Original use |
|---|---|
| `gallery-01.jpg` … `gallery-05.jpg` | Home › "A Glimpse of Aurelia" grid + Gallery page (`gallery-05` is also the Contact form background) |
| `gallery-06.jpg` | Gallery page only |

The Gallery page also reuses `services/hero.jpg`, `rooms/infinity-pool-villa.jpg`,
`rooms/executive-ocean-residence.jpg` and the three `rooms/detail-*` photos.

### `services/`
| File | Original use |
|---|---|
| `hero.jpg` | Services › Hero background ("Where Luxury Feels Natural"). Not used by us: the template's "AURELIA RESORT" sign is part of the photo |
| `service-01.jpg`, `service-02.jpg` | Services › service cards |

### `icons/`
Single-color line icons. The template paints them with CSS `mask` in the gold accent color,
so they can be recolored freely.

| File | Original use | Use in our app |
|---|---|---|
| `meta-size.svg` | Room card: surface (m²) | `Room.size_m2` |
| `meta-bed.svg` | Room card: bed type | `Room.bed_type` |
| `meta-guests.svg` | Room card: guests | `Room.max_guests` |
| `service-spa.svg` | Home › Wellness & Spa | `Service` icon |
| `service-dining.svg` | Home › Sunset Dining | `Service` icon |
| `service-yacht.svg` | Home › Private Experiences | `Service` icon |
| `amenity-air-conditioning.svg` | Room page amenities | `Amenity` icon |
| `amenity-restaurant.svg` | Room page amenities | `Amenity` icon |
| `amenity-minibar.svg` | Room page amenities | `Amenity` icon |
| `amenity-wifi.svg` | Room page amenities | `Amenity` icon |
| `amenity-towels.svg` | Room page amenities | `Amenity` icon |
| `amenity-tv.svg` | Room page amenities | `Amenity` icon |
| `amenity-keycard.svg` | Room page amenities | `Amenity` icon |
| `amenity-safe.svg` | Room page amenities | `Amenity` icon |

### `sereno/`
| File | Size | Use |
|---|---|---|
| `panorama-360.jpg` | 4096×2048, 1.9 MB | Equirectangular panorama for the 360° room tour (Photo Sphere Viewer) |
| `panorama-360-small.jpg` | 1774×887 | Low-res version to show while the full panorama loads |

## Optimisation done

- PNG photos converted to JPEG (quality 82): `rooms/detail-02`, `rooms/detail-03`,
  `services/hero`, both panoramas.
- The panorama was resized from 6000×3000 (5.8 MB PNG) to 4096×2048 (1.9 MB JPEG), the
  largest texture size every GPU supports.
