# Bihar Sahayata

**A public welfare and disaster management platform** — connecting people in need with volunteers, relief teams, and donors. Built for Bihar, with a vision to strengthen community response and social culture through technology.

---

## About the Application

Bihar Sahayata (बिहार सहायता) is a comprehensive digital platform that brings together **citizens**, **volunteers**, **relief teams**, and **donors** on one system. Whether someone is in an emergency and needs immediate help, wants to report a local issue, or wishes to contribute time or money for disaster relief — the platform provides a single, transparent place to act and coordinate.

The application is designed to feel **inclusive** and **accessible**: the landing page and key flows support **English and Hindi**, and the interface is **mobile-first** so that people in low-connectivity or on-the-move situations can still use panic alerts, report issues, and donate.

---

## Features

### 🚨 Panic (SOS) Alert

- **One-tap emergency alert** from the landing page or dedicated SOS page — no login required.
- User shares **phone number** and **location** (with consent); the system creates a critical-priority alert.
- **Nearby volunteers** (verified, available, within radius) are computed so that in future they can be notified via push/SMS for faster response.
- Helps anyone in distress reach help quickly without barriers.

### 👤 Issue Reporting & Resolution

- **Logged-in users** can report issues from their dashboard: type, location, victim/reporter details, description, severity.
- Issues can be **linked to an active disaster** for better coordination.
- **Volunteers** can accept issues, update status (en route → on site), and mark them **resolved** with notes.
- End-to-end flow from “reported” to “resolved” is tracked so citizens and admins can see progress.

### 🙋 Volunteer & Team Management

- **Volunteer onboarding**: people can register as volunteers with profile, location, skills, and availability.
- **Teams** can be created; members see **disaster activations** when admin assigns their team to a disaster (with area and responsibilities).
- Volunteers can update activation status (e.g. deployed, completed) and respond to panic or disaster-linked issues.
- Encourages structured, accountable volunteering.

### 🌊 Disaster Management

- **Admins** can declare disasters (title, type, affected districts, dates, etc.) and keep status updated (active → contained → resolved).
- **Team activation**: admin assigns volunteer teams to a disaster with assigned area and responsibilities.
- **Disaster-linked issues** are listed per disaster so response can be coordinated.
- **Public disaster listing** shows active disasters, linked issues, and relief campaigns — improving transparency and trust.

### 💰 Fundraising & Donations

- **Campaigns** can be created (by admin or organisers) and optionally **linked to a disaster** (e.g. “Bihar Flood Relief 2026”).
- **Donation flow**: users choose a campaign, enter amount and optional donor details, and donate (demo mode supports instant completion).
- **Campaign progress** (raised vs goal, donor count) is visible on disaster and campaign pages.
- Enables quick, targeted fundraising for relief and community causes.

### 🔐 Roles & Access

- **Public**: panic alert, view disasters, donate, browse campaigns.
- **User**: report issues, view “my issues”, profile, dashboard.
- **Volunteer**: accept/resolve issues, view disaster activations, volunteer dashboard.
- **Admin**: disasters, campaigns, issues, volunteers, team activation, approvals.

---

## How It Helps People

- **Faster emergency response** — Panic alerts and issue reports create a clear record with location and contact; volunteers and teams can respond in a structured way instead of ad-hoc messages.
- **No barrier in crisis** — SOS does not require login, so even someone without an account or in a hurry can send an alert and get into the system.
- **Clear coordination** — Disasters, teams, and issues are linked: admins see what’s declared, which teams are activated, and which issues need attention.
- **Accountability** — Every issue has a lifecycle (pending → assigned → in progress → resolved); volunteers record notes and resolution, building trust.
- **Fundraising in context** — Donors see active disasters and linked campaigns, so they know where their money is going (e.g. “Bihar Flood Relief”).
- **Inclusive design** — Bilingual (English/Hindi) and mobile-friendly so more people can use it in the way that suits them.

---

## How It Improves Social Culture

- **Youth and service** — The platform is built so that young people and professionals (doctors, drivers, teachers, etc.) can register as volunteers and contribute in a visible, organised way. This normalises “giving time” as part of civic life.
- **Trust through transparency** — Disasters, campaigns, and issue status are visible. People can see that help is being organised and that their reports and donations are part of a larger response.
- **Community over isolation** — By connecting those in need with those who can help (volunteers, teams, donors), the app reinforces that problems are solved together, not alone.
- **Dignity and inclusion** — Anonymous panic and optional donor anonymity respect privacy while still allowing people to participate; bilingual and mobile-first design reduce exclusion.
- **Habit of contribution** — Easy donation flow and clear volunteer pathways make it simpler to turn intention into action, strengthening a culture of helping and giving.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: React, Tailwind CSS, Radix UI components
- **Language**: TypeScript

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm / yarn)
- PostgreSQL database

### Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env` and set your database URL and any auth/config variables.
4. Push the schema and (optional) seed data:

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

- `pnpm build` — Production build  
- `pnpm start` — Start production server  
- `pnpm db:studio` — Open Drizzle Studio for the database  
- `pnpm lint` — Run ESLint  

---

## Project Structure (High Level)

- `app/` — Next.js App Router: pages, API routes, layout
- `components/` — Reusable UI (auth, layout, shared components)
- `db/` — Drizzle schema, migrations, seed
- `lib/` — Auth, geo, email, utilities
- `docs/` — Implementation notes, user flows (e.g. `user-flow-diagram.md`)

For a detailed view of **user flows** (alert → resolution, disaster management, fundraising), see **[docs/user-flow-diagram.md](docs/user-flow-diagram.md)**.

---

## License

Private / All rights reserved (or add your preferred license).

---

**Bihar Sahayata** — *Connecting help with those who need it.*
