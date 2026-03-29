# Bihar Sahayata – User Flow Diagram

This document describes the full application flow: how a user generates an alert, how it is handled until resolution, disaster management, volunteer team allocation, and fundraising.

---

## 1. Alert / Issue Flow (User → Resolution)

### 1.1 Two Ways to Create an Alert

| Entry Point | Auth Required | API | Description |
|-------------|---------------|-----|-------------|
| **Panic (SOS)** | No | `POST /api/panic` | Emergency alert: user provides phone, location (lat/lng), optional name/description. Creates issue with type `panic`, severity `critical`. |
| **Report Issue** | Yes (for most types) | `POST /api/issues` | Logged-in user reports an issue: victim phone, location, issue type code, description, severity, optional disaster link. |

### 1.2 Panic Alert Flow (Full Path)

```
[User in distress]
       │
       ▼
Landing / Panic page (/panic)
       │
       ├── Get browser location (geolocation API)
       ├── Enter: phone (required), name, description
       └── Submit SOS
              │
              ▼
       POST /api/panic
              │
              ├── Validate: phone, latitude, longitude
              ├── Resolve issue type "panic" from DB
              ├── INSERT into `issue` (status: pending, severity: critical)
              ├── Find nearby volunteers (volunteer_profile: isAvailable, isVerified, within ~20 km)
              └── Return: alertId, nearbyVolunteersCount, status
              │
              ▼
       [Alert created – pending]
       (TODO: Notify nearby volunteers via push/SMS/websocket)
```

### 1.3 Report Issue Flow (Dashboard)

```
[Logged-in user]
       │
       ▼
User Dashboard (/dashboard)
       │
       ├── "Report Issue" dialog
       ├── Step 1: Issue type, location, victim/reporter details
       ├── Step 2: Description, severity, optional disaster link
       └── Submit
              │
              ▼
       POST /api/issues
              │
              ├── Session required (for non-panic types)
              ├── Resolve issue type by code, validate required fields
              ├── INSERT into `issue` (status: pending, optional disasterId)
              └── Return issue id
              │
              ▼
       [Issue created – pending]
       User can track at "My Issues" (/my-issues)
```

### 1.4 Issue Lifecycle (Until Resolved)

```
                    ISSUE STATUS FLOW
                    =================

  [pending]  ──►  [assigned]  ──►  [in_progress]  ──►  [resolved]
       │                │                  │
       │                │                  │
       │                │                  └── Volunteer marks "Resolved"
       │                │                       POST /api/issues/[id]/resolve
       │                │                       (notes, equipmentUsed)
       │                │
       │                └── Volunteer accepts issue
       │                    POST /api/issues/[id]/accept
       │                    → issue.status = "assigned"
       │                    → INSERT issue_assignment (volunteerId, status: accepted)
       │
       └── Issue exists; volunteers can discover it (e.g. disaster issues list, admin assignment)
```

### 1.5 Volunteer Side: Accept → En Route → On Site → Resolve

```
[Volunteer] (logged in, has volunteer_profile)
       │
       ▼
Sees issue (e.g. disaster detail page, alerts list, or admin-assigned)
       │
       ▼
POST /api/issues/[id]/accept
       │
       ├── Check volunteer_profile exists for session user
       ├── No existing assignment for this volunteer
       ├── INSERT issue_assignment (issueId, volunteerId, status: accepted)
       └── UPDATE issue SET status = 'assigned', acknowledgedAt = now
       │
       ▼
[Assigned]
       │
       ▼
PATCH /api/issues/[id]/status  { "status": "en_route" }
       │
       └── Assignment status = en_route (issue stays assigned)
       │
       ▼
PATCH /api/issues/[id]/status  { "status": "on_site" }
       │
       ├── Assignment: status = on_site, arrivedAt = now
       └── UPDATE issue SET status = 'in_progress'
       │
       ▼
[On site – working]
       │
       ▼
POST /api/issues/[id]/resolve  { "notes", "equipmentUsed" }
       │
       ├── Must be assigned to this volunteer
       ├── UPDATE issue_assignment SET status = completed, completedAt, notes, equipmentUsed
       ├── UPDATE issue SET status = 'resolved', resolvedAt, resolutionNotes
       └── Increment volunteer_profile.totalResolves
       │
       ▼
[Resolved]
```

**Summary – Alert to resolution:**  
User creates alert (panic or report issue) → Issue is **pending** → Volunteer **accepts** → **assigned** → Volunteer updates to **en_route** → **on_site** → **in_progress** → Volunteer **resolves** → **resolved**.

---

## 2. Disaster Management Flow

### 2.1 Admin Declares a Disaster

```
[Admin]
       │
       ▼
Admin → Disasters (/admin/disasters)
       │
       ├── Create disaster: title, type, description, affected districts, start date, etc.
       └── POST /api/disasters
              │
              ├── Session + admin role required
              ├── INSERT into `disaster` (status: active, etc.)
              └── Disaster appears in public list GET /api/disasters
              │
              ▼
       [Disaster active]
```

### 2.2 Admin Activates Teams for the Disaster

```
[Admin] → Disaster detail or team management
       │
       ▼
POST /api/disasters/[id]/teams
       │
       Body: { teamId, assignedArea, responsibilities }
       │
       ├── Admin only
       ├── Disaster and team must exist
       ├── No duplicate activation for same (disaster, team)
       └── INSERT into disaster_team_activation
              (disasterId, teamId, assignedArea, responsibilities, status: activated)
       │
       ▼
[Team activated for this disaster]
```

### 2.3 Volunteers See Activations

```
[Volunteer] (member of one or more teams)
       │
       ▼
Volunteer Dashboard (/volunteer/dashboard)
       │
       ▼
GET /api/volunteer/activations
       │
       ├── Get volunteer_profile for session user
       ├── Get team_membership where volunteerId = volunteer.id, isActive = true
       ├── Get disaster_team_activation for those teamIds
       └── Join disaster, team → return activations
       │
       ▼
UI: "Disaster Team Activations" – disaster name, team name, assigned area, responsibilities
       │
       ▼
PATCH /api/volunteer/activations  { activationId, status: "deployed" | "completed" }
       │
       ├── Volunteer must be in that team
       ├── deployed → set deployedAt
       └── completed → set completedAt
       │
       ▼
Activation status: activated → deployed → completed
```

### 2.4 Issues Linked to a Disaster

- When creating an issue (e.g. from user dashboard), user can optionally link it to a **disaster** (`disasterId`).
- Admin or system can also associate existing issues with a disaster.
- **GET /api/disasters/[id]/issues** returns all issues for that disaster (filterable by status).
- So: **Disaster** → has many **Issues** (reported during/for that disaster) and many **Activated teams** (volunteers assigned to respond).

### 2.5 End-to-End Disaster Flow (High Level)

```
Admin declares disaster
       │
       ▼
Admin activates one or more volunteer teams (with area & responsibilities)
       │
       ▼
Volunteers (team members) see activations on their dashboard
       │
       ├── They can update activation status: deployed → completed
       └── They can accept and resolve issues (including disaster-linked issues)
       │
       ▼
Public sees disaster on /disasters; can report issues linked to disaster; can donate to disaster-linked campaigns
       │
       ▼
Admin can contain/resolve disaster when situation is under control
```

---

## 3. Fundraising / Donation Flow

### 3.1 Campaign Creation

| Who | Where | API |
|-----|--------|-----|
| Admin | Admin → Campaigns | `POST /api/admin/campaigns` – create campaign (title, description, goal, category, optional disasterId, beneficiary, etc.). Status typically `active`, auto-verified. |
| (Other flows) | – | `POST /api/campaigns` – e.g. organisers create campaign (may go to pending_approval). |

Admin-created campaigns are created as **active** and **verified**. Campaign can optionally be linked to a **disaster** (`disasterId`).

### 3.2 Donation Flow

```
[User / Donor] (anonymous or logged in)
       │
       ▼
Public page: e.g. /disasters (lists active campaigns) or landing donation section
       │
       ├── Sees active campaigns (GET /api/campaigns?status=active)
       └── Chooses campaign (or uses default “first active” if none selected)
       │
       ▼
Donation dialog: amount, donor name/email/phone, optional message, isAnonymous
       │
       ▼
POST /api/donations
       │
       Body: { campaignId? (optional), amount (₹), donorName, donorEmail, donorPhone, isAnonymous, message }
       │
       ├── If no campaignId → use first active campaign
       ├── Validate campaign exists and status = active
       ├── amount in rupees → convert to paisa
       ├── INSERT into donation (campaignId, amount, donorUserId if logged in, donor details, paymentStatus: completed for demo)
       └── UPDATE campaign SET raisedAmount += amount, donorCount += 1
       │
       ▼
[Donation recorded] – success shown to user; campaign progress bars update (e.g. on /disasters)
```

### 3.3 Campaign ↔ Disaster Link

- Campaign can have **disasterId**.
- On **/disasters** page, active disasters show **relief campaigns** (including disaster-linked ones).
- Donations go to the campaign; campaign’s **raisedAmount** and **donorCount** drive the progress shown.

**Summary – Fundraising:**  
Admin (or organiser) creates campaign → Campaign is **active** (and optionally linked to disaster) → User donates via **POST /api/donations** → Donation recorded, campaign stats updated.

---

## 4. Combined End-to-End Flow (Disaster Alert → Teams → Fundraising)

Single narrative tying all flows together:

```
1. DISASTER DECLARED
   Admin creates disaster (e.g. "Bihar Flood 2026"). Disaster is active and visible on /disasters.

2. TEAMS ALLOCATED
   Admin activates volunteer teams for this disaster (assigned area, responsibilities).
   Volunteers who are members of these teams see "Disaster Team Activations" on their dashboard.

3. ALERTS / ISSUES
   • Citizens in distress use Panic (SOS) – no login – or logged-in users report an issue (optionally linked to disaster).
   • Issue is created with status "pending".
   • Nearby volunteers (panic) are computed; in future, notified. Volunteers can also see disaster-linked issues.
   • A volunteer accepts the issue → status "assigned".
   • Volunteer updates: en_route → on_site (issue "in_progress").
   • Volunteer resolves with notes → issue "resolved", volunteer’s totalResolves incremented.

4. FUNDRAISING
   Admin (or organiser) creates a campaign, optionally linked to the same disaster.
   Campaign is active and listed on /disasters (and elsewhere).
   Users donate via /api/donations; campaign raisedAmount and donorCount update.

5. ONGOING
   Volunteers update team activation status (deployed, completed). Admin can contain/resolve the disaster when appropriate.
```

---

## 5. Quick Reference – Main APIs by Flow

| Flow | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| Panic alert | POST | `/api/panic` | Create SOS alert (no auth) |
| Report issue | POST | `/api/issues` | Create issue (auth for non-panic) |
| Accept issue | POST | `/api/issues/[id]/accept` | Volunteer accepts issue |
| Issue status | PATCH | `/api/issues/[id]/status` | en_route / on_site |
| Resolve issue | POST | `/api/issues/[id]/resolve` | Mark resolved + notes |
| List disasters | GET | `/api/disasters` | Public list (e.g. active) |
| Create disaster | POST | `/api/disasters` | Admin declare disaster |
| Activate team | POST | `/api/disasters/[id]/teams` | Admin activate team for disaster |
| Volunteer activations | GET | `/api/volunteer/activations` | Teams’ disaster activations |
| Update activation | PATCH | `/api/volunteer/activations` | deployed / completed |
| Disaster issues | GET | `/api/disasters/[id]/issues` | Issues linked to disaster |
| List campaigns | GET | `/api/campaigns` | Active campaigns (e.g. for donations) |
| Create campaign (admin) | POST | `/api/admin/campaigns` | Admin create campaign |
| Donate | POST | `/api/donations` | Create donation (campaign optional) |

---

## 6. Status Enums (Reference)

- **Issue:** pending → assigned → in_progress → resolved (and optionally acknowledged, escalated, cancelled).
- **Issue assignment:** assigned → accepted → en_route → on_site → completed (or dropped).
- **Disaster:** active → contained → resolved.
- **Disaster team activation:** activated → deployed → completed.
- **Campaign:** draft | pending_approval | active | completed | cancelled.

This document reflects the current app behaviour and APIs; implementation details (e.g. auth checks, exact request bodies) are as in the codebase.
