# Convene

A lightweight gathering availability scheduler. The organizer creates an event with a date window and a list of attendees. Each attendee gets a link where they pick the weekends they're available. The admin sees all responses and finalizes dates.

**Live:** [convene.mooseflip.com](https://convene.mooseflip.com)

---

## How it works

0. **Landing page** at `/` tells the story in a six-chapter slideshow and links to the create form
1. **Organizer** creates an event at `/new`: a date window (the inclusive first and last days guests can pick), the days of the week guests can pick, and who's invited. With all 7 days on, guests tap single days on a calendar. With only some days on, back-to-back days bundle into one-tap blocks (e.g. each Fri–Sun). A live preview and a "How dates work" guide explain this on the form
2. **Participant link** is shared with families — each family clicks their name, picks available dates, and submits
3. **Admin link** (kept private) lets the organizer view all responses, see a heatmap of availability, and finalize dates
4. Families can return to the participant link at any time to update their availability

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Hosting | Self-hosted Docker, exposed via Cloudflare Tunnel |
| CI/CD | GitHub Actions (build check only; deploy is a local `docker compose` on the host) |

---

## Project structure

```
convene/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Landing, CreateEvent, ParticipantView, AdminDashboard
│       ├── landing/ # Landing story slides + styles
│       ├── components/storybook/  # EventHeader, Moment, PageFoot, moment art
│       ├── lib/     # date formatting
│       └── components/  # CalendarGrid, HeatmapCalendar, FamilyList
├── server/          # Express API
│   ├── models/      # Event, Response (Mongoose)
│   ├── routes/      # events.js, responses.js
│   └── middleware/  # adminAuth.js
└── Dockerfile       # Multi-stage build (client → server/public)
```

---

## Local development

**Prerequisites:** Node.js 20+, access to a MongoDB cluster

1. Clone the repo
2. Create `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.../convene-test?retryWrites=true&w=majority
   PORT=3000
   BASE_URL=http://localhost:5173
   ADMIN_SECRET=<secret>
   ```
3. Install dependencies and start both servers:
   ```bash
   cd server && npm install && npm run dev
   cd client && npm install && npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173)

---

## API

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/events` | Create event |
| `GET` | `/api/events/:token` | Get event (participant view) |
| `POST` | `/api/events/:token/respond` | Submit / update availability |
| `GET` | `/api/events/:adminToken/admin` | Admin dashboard data |
| `PATCH` | `/api/events/:adminToken/finalize` | Finalize dates |
| `DELETE` | `/api/events/:adminToken` | Delete event and all responses |

---

## Deployment

Convene is self-hosted on a local Docker lab and exposed publicly at
[convene.mooseflip.com](https://convene.mooseflip.com) via a Cloudflare Tunnel.
There is no registry push or remote deploy — GitHub Actions only verifies the
image still builds (`docker build`, no push) on each `main` push / PR.

Deploy from the host with a local build:

```bash
docker compose up -d --build
```

Configuration comes from a local `.env` (gitignored — see `.env.example`),
supplying `MONGODB_URI`, `PORT`, `BASE_URL`, and `ADMIN_SECRET`. The app's
container port `3000` is bound to `127.0.0.1:8300` on the host; the Cloudflare
Tunnel is the only public entry point (no raw port is exposed to the network).

---

## Testing

Client unit tests (Vitest + Testing Library, jsdom):

```bash
cd client && npm test   # client: pages, components, scheduling, design-system contract
cd server && npm test   # server: scheduling / suggested dates (node:test)
```

They cover the landing slideshow, every page's states (participant, admin, results, create, with the API mocked), the storybook components, date formatting, routing, and a design-system contract test.
