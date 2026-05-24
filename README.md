# Convene

A lightweight gathering availability scheduler. The organizer creates an event with a date window and a list of attendees. Each attendee gets a link where they pick the weekends they're available. The admin sees all responses and finalizes dates.

**Live:** [convene.mooseflip.com](https://convene.mooseflip.com)

---

## How it works

1. **Organizer** creates an event at `/` — sets a date window, families list, and allowed days of the week
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
| Hosting | Railway |
| CI/CD | GitHub Actions → Docker Hub |

---

## Project structure

```
convene/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # CreateEvent, ParticipantView, AdminDashboard
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

Push to `main` — GitHub Actions builds a Docker image tagged with the version from `server/package.json`, pushes to Docker Hub, and automatically deploys to Railway.

```
git push origin main  # triggers build + deploy
```

---

## Testing

A Playwright test suite lives at `/tmp/test_convene.py`. It creates a real event, runs multiple family submissions, verifies badges and pre-population, and cleans up after itself.

```bash
python3 /tmp/test_convene.py
```
