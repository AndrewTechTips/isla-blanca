<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e2a24,100:b99a6b&height=220&section=header&text=Isla%20Blanca&fontSize=72&fontColor=f8f5f0&fontAlignY=36&desc=Suites%20and%20villas%20above%20the%20Mediterranean&descSize=18&descAlignY=58&animation=fadeIn" width="100%" alt="Isla Blanca" />

<img src="https://readme-typing-svg.demolab.com/?font=Cormorant+Garamond&weight=600&size=26&duration=3400&pause=1100&color=B99A6B&center=true&vCenter=true&width=760&lines=Pick+your+dates.+See+what%27s+free.+Book+it.;Live+prices%2C+down+to+the+last+extra.;Step+inside+the+villa+before+you+arrive.;Double+bookings+can%27t+happen.+The+database+won%27t+let+them." alt="Pick your dates. See what's free. Book it." />

**A booking platform for a small luxury resort in Ibiza, the island the locals call la Isla Blanca.**

Guests browse suites and villas, see which nights are still free, price their stay with extras
and book it. Staff run the resort from a dashboard: bookings, rooms, prices, services and guests.

<a href="https://andrewtechtips.github.io/isla-blanca/"><strong>Visit the live site</strong></a>
&nbsp;·&nbsp;
<a href="https://isla-blanca-api.onrender.com/docs">API docs</a>
&nbsp;·&nbsp;
<a href="#-run-it">Run it locally</a>

<br /><br />

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#%EF%B8%8F-built-with)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#%EF%B8%8F-built-with)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](#%EF%B8%8F-built-with)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#%EF%B8%8F-built-with)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](#%EF%B8%8F-the-data-model)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-run-it)

[![CI](https://github.com/AndrewTechTips/isla-blanca/actions/workflows/ci.yml/badge.svg)](https://github.com/AndrewTechTips/isla-blanca/actions/workflows/ci.yml)
[![Deploy](https://github.com/AndrewTechTips/isla-blanca/actions/workflows/pages.yml/badge.svg)](https://github.com/AndrewTechTips/isla-blanca/actions/workflows/pages.yml)
[![API on Render](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://isla-blanca-api.onrender.com/api/v1/health)
[![Database on Neon](https://img.shields.io/badge/database-Neon-00E599?style=flat-square&logo=postgresql&logoColor=white)](docs/deployment.md)
[![Lighthouse accessibility](https://img.shields.io/badge/Lighthouse_a11y-100-1e2a24?style=flat-square&logo=lighthouse&logoColor=b99a6b)](docs/frontend.md#accessibility)

</div>

<br />

<p align="center">
  <img src="docs/media/home-scroll.webp" width="860" alt="Scrolling the home page: the hero photo settles in, the title rises, then the About section and the featured rooms" />
</p>

---

## 🌴 What it does

**For guests**

- **See what's free before you fall for a room.** Every room page has a two-month calendar with
  booked nights struck through. Pick an arrival and a departure, and the stay carries straight
  into the booking page.
- **Know the price as you build the stay.** Add a spa day, sunset dinner or a yacht trip and the
  total updates live, priced by the API, never guessed by the browser.
- **Look around first.** The villa has a 360° tour you can drag, zoom and open full screen.
- **Keep it all in one place.** My bookings, cancellations up to the day before arrival, and a
  review once the stay is over.

**For staff**

- A dashboard with revenue by month, occupancy and the next arrivals.
- Bookings to confirm, complete or cancel, and rooms, prices, extras and amenities to edit,
  all reflected on the public site straight away.

## 📸 A look at it

<table>
<tr>
<td width="50%" valign="top"><img src="docs/media/calendar.jpg" alt="Availability calendar with a four-night stay selected" /><br /><sub>Booked nights are struck through. A stay can end the morning someone else arrives.</sub></td>
<td width="50%" valign="top"><img src="docs/media/booking.jpg" alt="Booking page with extras and a live price summary" /><br /><sub>Extras priced per guest, per night or per stay, totalled as you click.</sub></td>
</tr>
<tr>
<td valign="top"><img src="docs/media/tour.jpg" alt="The 360 degree tour of the Infinity Pool Villa" /><br /><sub>The 360° tour. The viewer (three.js) only downloads when you press start.</sub></td>
<td valign="top"><img src="docs/media/admin.jpg" alt="Staff dashboard with revenue, occupancy and bookings" /><br /><sub>The staff dashboard.</sub></td>
</tr>
<tr>
<td valign="top"><img src="docs/media/account.jpg" alt="A guest's bookings in their account" /><br /><sub>A guest's account: upcoming stays first, then the past ones.</sub></td>
<td align="center" valign="top"><img src="docs/media/mobile-home.jpg" width="190" alt="Home page on a phone" />&nbsp;&nbsp;<img src="docs/media/mobile-menu.jpg" width="190" alt="Menu on a phone" /><br /><sub>On a phone.</sub></td>
</tr>
</table>

## 🧠 Under the hood

- **Double bookings are impossible, not just unlikely.** Overlapping stays are blocked by a
  PostgreSQL exclusion constraint on the date range, so two guests pressing *Book* for the same
  night at the same moment can't both win. The loser gets a clear "already booked" message.
- **Prices are frozen at booking time.** Each extra on a booking keeps the price it had that day,
  so a new price list never rewrites an old invoice.
- **Typed from the database to the button.** The frontend's API types are generated from the
  OpenAPI schema, so a backend change that breaks the site fails the type check, not the guest.
- **The server looks after itself.** On every start the API container runs its migrations and,
  on an empty database, loads the demo resort.
- **Built to be used by everyone.** Keyboard-friendly calendar, focus that never gets lost in
  dialogs, AA contrast, "reduce motion" respected everywhere. Lighthouse accessibility is 100 on
  every page.
- **Light on the wire.** Pages load on demand, photos come as WebP sized to the screen, and the
  heavy 360° viewer waits until it's asked for.

## 🗂️ The data model

```mermaid
erDiagram
    users ||--|| profiles : "1-1"
    users ||--o{ bookings : "1-n"
    rooms ||--o{ bookings : "1-n"
    rooms ||--o{ room_images : "1-n"
    rooms }o--o{ amenities : "n-m"
    bookings }o--o{ services : "n-m"
    bookings ||--o| reviews : "1-1"
```

<sub>The full diagram, with every column and constraint, is in [docs/database.md](docs/database.md).</sub>

## 🛠️ Built with

| | |
|---|---|
| **Frontend** | React 19 · TypeScript · Vite · React Router · TanStack Query · Tailwind CSS 4 · Motion · Lenis · Photo Sphere Viewer |
| **Backend** | Python 3.13 · FastAPI · SQLAlchemy 2 · Alembic · Pydantic · JWT + Argon2 · uv |
| **Database** | PostgreSQL 18, with exclusion and check constraints doing the hard rules |
| **Quality** | 78 pytest tests against a real PostgreSQL · 31 Vitest tests · Ruff · oxlint · Prettier · CI on every push |
| **Shipped** | Docker · GitHub Actions · GitHub Pages (site) · Render (API) · Neon (database) |

## 🚀 Run it

Everything in containers, nothing to install but Docker:

```bash
cp .env.example .env
docker compose up --build
```

Then open <http://localhost:8080>. The API and its docs are on <http://localhost:8000/docs>.

<details>
<summary><strong>Developing with live reload</strong></summary>
<br />

Needs Docker, [uv](https://docs.astral.sh/uv/) and Node.js 22+.

```bash
cp .env.example .env
docker compose up -d db              # PostgreSQL on localhost:5433

cd backend
uv sync
uv run alembic upgrade head
uv run python -m app.db.seed         # the demo resort
uv run fastapi dev app/main.py       # http://localhost:8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Tests: `uv run pytest` in `backend/`, `npm test` in `frontend/`.

</details>

**Demo accounts**

| Who | Email |
|---|---|
| Staff | `admin@islablanca.test` |
| Guest with past and upcoming stays | `sofia.carter@islablanca.test` |
| Guest | `daniel.morgan@islablanca.test` |

<sub>Local passwords are in `.env.example`. The live site uses its own, set when it was deployed.
The free API server sleeps when idle, so the first request after a while can take about a minute.</sub>

## 📚 Docs

[Deployment](docs/deployment.md) · [API](docs/api.md) · [Database](docs/database.md) ·
[Frontend](docs/frontend.md) · [Design](docs/design-spec.md) · [Images and media](docs/assets.md)

---

## 📬 Let's connect

<div align="center">

**Andrei Condrea**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Andrei_Condrea-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andrei-condrea-b32148346)
[![Email](https://img.shields.io/badge/Email-condrea.andrey777%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:condrea.andrey777@gmail.com)

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:b99a6b,100:1e2a24&height=120&section=footer" width="100%" alt="" />
