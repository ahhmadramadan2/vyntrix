# Vyntrix

A university job-matching platform that connects students with employers using a weighted skill-and-GPA matching algorithm. Built as a senior project at the Lebanese International University.

**Live demo:** [vyntrix-psi.vercel.app](https://vyntrix-psi.vercel.app)
**API:** [vyntrix-api.onrender.com](https://vyntrix-api.onrender.com)

---

## What It Does

Vyntrix gives university students a place to build a verified academic profile (university affiliation, GPA, skills, projects) and apply to jobs posted by registered companies. For every job, the platform computes a 0–100 match score per student based on skill overlap, GPA fit, and profile completeness, so HR sees the strongest fits first. Students and other students can also connect and chat in real time over a private messaging channel, and email notifications keep everyone informed when an application status changes.

---

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Zustand for state, React Router, Socket.io client.
**Backend** — Node.js, Express, TypeScript, Prisma ORM, Socket.io server, JSON Web Tokens for auth, Zod for environment validation.
**Database** — PostgreSQL hosted on Supabase (15 tables, fully relational, indexed for the queries the matching engine actually runs).
**Email** — Resend transactional API for password reset and application status updates.
**Image storage** — ImgBB for student and company avatars.
**Deployment** — Vercel for the frontend, Render for the backend, Supabase for the database.

---

## Architecture

```
+-------------------+        HTTPS         +----------------------+
|                   | <------------------> |                      |
|  React (Vercel)   |                      |  Express (Render)    |
|                   | <-- WebSocket  ----> |  + Socket.io         |
+-------------------+                      +----------------------+
                                                       |
                                                       | Prisma
                                                       v
                                            +----------------------+
                                            |  PostgreSQL          |
                                            |  (Supabase pooler)   |
                                            +----------------------+
                                                       |
        +----------------+                             |
        | Resend (email) | <---------------------------+
        +----------------+
        +----------------+
        | ImgBB (images) | <---------------------------+
        +----------------+
```

The backend follows a feature-module layout. Each domain (`auth`, `student`, `company`, `jobs`, `applications`, `matching`, `skills`, `notifications`, `chat`) owns its own `routes`, `controller`, and `service` files, with shared concerns in `middleware/` and `utils/`. Authentication is JWT-based with 7-day expiry; tokens are issued at login and verified by the `authenticate` middleware on every protected route. Role-based access (`STUDENT` vs `HR`) is enforced by a separate `role` middleware.

Real-time chat uses Socket.io with one room per user. When a student joins a connection, the server emits `receive_message` to both rooms, so both sides see new messages instantly without polling. Bell notifications use 30-second HTTP polling intentionally — chat needs millisecond latency, but a notification arriving 30 seconds later is acceptable, and polling is simpler to reason about and cheaper to host.

---

## The Matching Algorithm

For every (student, job) pair the engine computes a score out of 100 from three weighted components:

| Component        | Weight | What it measures                                       |
|------------------|--------|--------------------------------------------------------|
| Skill match      | 60     | Required skills the student has, weighted by level     |
| GPA fit          | 30     | How comfortably the student meets the job's min GPA    |
| Profile bonus    | 10     | Profile completeness — bio, links, projects, avatar    |

The score recalculates automatically whenever a student edits their profile or a company edits a job posting, so match results are never stale. The implementation lives in `server/src/modules/matching/matching.service.ts`.

---

## Database Schema (15 Tables)

```
universities ──< students ──< student_profiles
                     │
                     ├──< student_skills >── skills
                     ├──< projects
                     ├──< applications >── job_postings
                     ├──< matches      >── job_postings
                     ├──< notifications
                     ├──< sent_connections     ─┐
                     └──< received_connections ─┴── connections ──< messages

companies ──< hr_users ──< job_postings ──< job_required_skills >── skills

password_reset_tokens (standalone, references students or hr_users by email)
```

Notable design choices: every domain table has `createdAt` and `updatedAt` timestamps; `applications` enforces a unique `(studentId, jobId)` so a student physically cannot apply twice to the same job; `matches` are upserted with a unique `(studentId, jobId)` so the recalculation logic stays idempotent.

---

## Features

**Student**
- Register with university email, login, password reset by email
- Profile editor: avatar (ImgBB), GPA, skills with proficiency levels, projects, bio, social links
- Browse jobs with live filters and per-job match score
- Apply to jobs with cover letter and resume link, see persistent "Already Applied" state across sessions
- Track application status (pending / reviewed / accepted / rejected)
- In-app bell notifications and email when HR moves the application
- Real-time chat with other students — connection requests, accept/reject, threaded messages

**HR / Company**
- Register company, login
- Post and close jobs with required skills, minimum GPA, and deadline
- View ranked applicant list per job with match scores
- Inspect full applicant profile in a modal: skills, projects, bio, resume link, cover letter
- Accept / mark reviewed / reject applications — student is emailed automatically
- Candidate search with skill, GPA, and university filters
- Edit company profile and logo

---

## Local Setup

**Prerequisites:** Node.js 18+, npm, a PostgreSQL database (Supabase free tier works), and free accounts at [Resend](https://resend.com) and [ImgBB](https://imgbb.com) for the API keys.

**1. Clone and install**

```bash
git clone https://github.com/ahhmadramadan2/vyntrix.git
cd vyntrix

cd server && npm install
cd ../client && npm install
```

**2. Configure the backend**

Create `server/.env`:

```env
DATABASE_URL=postgresql://...your Supabase pooler URL...
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=re_...your Resend key...
FROM_EMAIL=onboarding@resend.dev
IMGBB_API_KEY=your-imgbb-key
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**Supabase Storage setup** (one-time, takes ~1 minute):

1. In your Supabase dashboard, go to **Storage** → **New bucket** → name it `resumes` → toggle **Public bucket** ON → **Create**.
2. Go to **Project Settings** → **API**. Copy the **Project URL** into `SUPABASE_URL` and the **service_role** key (under "Project API keys") into `SUPABASE_SERVICE_ROLE_KEY`. Keep the service_role key secret — it bypasses Row-Level Security.

**3. Configure the frontend**

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_IMGBB_API_KEY=your-imgbb-key
```

**4. Initialize the database**

```bash
cd server
npx prisma db push      # creates all 15 tables
npx prisma db seed      # inserts universities, demo company, demo student
```

**5. Run**

In two terminals:

```bash
cd server && npm run dev    # http://localhost:5000
cd client && npm run dev    # http://localhost:5173
```

---

## Demo Credentials

| Role     | Email                       | Password    |
|----------|-----------------------------|-------------|
| Student  | ahmad.ramadan@lau.edu.lb    | Student@123 |
| Company  | recruiter@techcorp.com      | Hr@123456   |

Seeded universities: **LAU**, **AUB**, **USJ**, **LIU**.

---

## Deployment

The repo is deployed across three free-tier platforms.

**Frontend → Vercel.** The `client/` folder is the Vercel project root. Build command: `npm run build`. Output directory: `dist`. Set `VITE_API_URL`, `VITE_SOCKET_URL`, and `VITE_IMGBB_API_KEY` in Project Settings → Environment Variables. Auto-deploys on push to `main`.

**Backend → Render.** Create a Web Service pointing at the `server/` directory. Build: `npm install && npx prisma generate && npm run build`. Start: `npm start`. Add every variable from `server/.env` to the Render Environment tab. Set `CLIENT_URL` to the Vercel production URL so CORS allows it.

**Database → Supabase.** Use the **pooler** connection string (`?pgbouncer=true`) for `DATABASE_URL` so Render's serverless cold starts don't exhaust connections.

After a schema change, run `npx prisma db push` once locally against the production `DATABASE_URL` to apply it.

---

## Project Structure

```
vyntrix/
├── client/                          React + Vite frontend
│   └── src/
│       ├── components/              Reusable UI (Avatar, Modal, Card, etc.)
│       ├── pages/
│       │   ├── auth/                Login, Register, password reset
│       │   ├── student/             Dashboard, job browse/detail, applications, profile, chat
│       │   └── company/             Dashboard, post job, manage jobs, applicants, candidate search
│       ├── hooks/                   useAuth, useDebounce
│       ├── lib/                     axios client, socket.io client, utils
│       ├── store/                   Zustand auth & UI stores
│       └── types/                   Shared TypeScript types
│
└── server/                          Node + Express backend
    ├── src/
    │   ├── config/                  Prisma client, Zod-validated env
    │   ├── middleware/              auth, role, error handler
    │   ├── modules/                 Feature folders (one per domain)
    │   │   └── <feature>/
    │   │       ├── <feature>.routes.ts
    │   │       ├── <feature>.controller.ts
    │   │       └── <feature>.service.ts
    │   └── utils/                   email (Resend), unified response helpers
    ├── prisma/
    │   ├── schema.prisma            15 models
    │   └── seed.ts                  Universities + demo accounts
    └── server.ts                    Entry point — HTTP server + Socket.io
```

---

## Author

**Ahmad Ramadan** — senior project, Lebanese International University.

GitHub: [@ahhmadramadan2](https://github.com/ahhmadramadan2)
