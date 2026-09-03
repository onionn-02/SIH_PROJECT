# SIH --- Farmers Procurement Tracking System (Firebase Edition)

## Master Project Specification & Claude Code Playbook

> **Project goal:** Build a simple, reliable, mobile-first web
> application that reduces farmer waiting time and uncertainty by making
> procurement schedules, queue/token information, and procurement status
> easy to understand and manage.

------------------------------------------------------------------------

# 1. Product Vision

Farmers often face: - Long waiting times at procurement centers. - Lack
of clear information about procurement schedules. - Uncertainty about
whether their procurement is scheduled, waiting, in progress, or
completed. - Difficulty knowing their expected turn/queue position. -
Poor communication between farmers and procurement-center staff.

The application should provide one trusted place where: 1. Farmers can
see when and where procurement is scheduled. 2. Farmers can receive or
view a token/queue position. 3. Farmers can track live procurement
status. 4. Procurement officers can manage the daily queue and update
statuses. 5. Administrators can manage centers, schedules, users, and
monitor activity. 6. The interface remains simple enough for users with
limited technical familiarity.

This is an SIH prototype, so prioritize: **clarity + believable
real-world workflow + strong demo + reliability + polished UI** over
unnecessary complexity.

------------------------------------------------------------------------

# 2. Target Users

## 2.1 Farmer

Needs to: - Log in. - View upcoming procurement appointment. - See
procurement center. - See token/queue number. - See estimated/current
queue position. - See status timeline. - Receive important
notifications. - View past procurement records. - Update basic profile
information. - Understand the application in simple language.

## 2.2 Procurement Officer

Needs to: - Log in to an assigned center. - See today's schedule. - See
waiting farmers. - Search/filter farmers. - Call the next farmer. -
Change procurement status. - Mark procurement completed. - Handle
no-show/cancelled cases. - View daily statistics.

## 2.3 Administrator

Needs to: - Manage users. - Manage procurement centers. - Create/update
procurement schedules. - Monitor procurement activity. - View
analytics. - Manage system configuration. - Audit important status
changes.

------------------------------------------------------------------------

# 3. Recommended Technology Stack

Use a modern, maintainable stack.

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Lucide icons

## Backend / Database

-   Firebase Firestore
-   Firebase Authentication
-   Firebase Storage only if required
-   Firebase Cloud Messaging (FCM) for push alerts when configured

## Validation / Data

-   Zod
-   React Hook Form where useful

## Charts

-   Recharts or another lightweight chart library only when analytics
    require it.

## Deployment

-   Vercel

## Version control

-   Git
-   GitHub

## General principle

Do not add a library just because it is popular. Every dependency must
solve a real problem.

------------------------------------------------------------------------

# 4. Product Architecture

### Firebase responsibilities

  -----------------------------------------------------------------------
  Area                    Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + React +       Farmer, officer and
                          TypeScript              admin UI

  Styling                 Tailwind CSS +          Responsive, consistent
                          shadcn/ui               UI

  Backend database        Firebase Firestore      Users' application
                                                  data, schedules,
                                                  appointments, queue and
                                                  history

  Authentication          Firebase Authentication Login, sessions and
                                                  identity

  Server privileges       Firebase Admin SDK      Trusted server-side
                                                  operations and admin
                                                  workflows

  Notifications           Firebase Cloud          Alerts when configured
                          Messaging + in-app      
                          notifications           

  Storage                 Firebase Storage        Only for required
                                                  documents/assets

  Intelligent scheduling  TypeScript              Demand score and slot
                          recommendation service  suggestion from
                                                  Firestore data

  Deployment              Vercel                  Next.js production
                                                  deployment

  Version control         Git + GitHub            Source control and
                                                  checkpoints
  -----------------------------------------------------------------------

High-level architecture:

Browser ↓ Next.js application ↓ Application services / server actions /
API layer ├── Firebase Authentication ├── Firestore ├── Firebase Storage
(if needed) └── Firebase Cloud Messaging (if configured) ↓ Firebase
Admin SDK (server-only privileged operations)

AI recommendation service ↓ Firestore historical demand + schedules +
center capacity

Keep business logic separated from presentation.

Keep Firebase client code separate from server-only Firebase Admin SDK
code. Never expose Admin SDK credentials to the browser.

Do not put all application logic into one giant component.

------------------------------------------------------------------------

# 5. Core Procurement Workflow

The central workflow is:

Farmer ↓ Registration & Basic Details Input ↓ AI Demand Prediction &
Slot Suggestion ↓ Select / receive procurement schedule ↓
Appointment/token generated ↓ Farmer sees date, time and center ↓ Farmer
reaches procurement center ↓ Officer calls farmer according to queue ↓
Status = WAITING ↓ Status = CALLED / IN_PROGRESS ↓ Procurement happens ↓
Digital Payment / Payment Status (when applicable) ↓ Status = COMPLETED
↓ Farmer sees completion + updated status ↓ Record stored in history

Possible alternate states:

SCHEDULED WAITING CALLED IN_PROGRESS COMPLETED CANCELLED NO_SHOW

Never allow arbitrary status changes without respecting the valid
workflow.

# 6. Status Timeline

The farmer should see a clear timeline:

1.  Scheduled
2.  Waiting
3.  Called / In Progress
4.  Completed

If cancelled: - Show the cancellation reason where appropriate. -
Clearly explain what the farmer should do next.

If no-show: - Show a clear message and follow the configured center
policy.

Use plain language instead of technical terminology.

------------------------------------------------------------------------

# 7. Main Screens

## Farmer

### Authentication

-   Login
-   Sign up if required
-   Forgot password
-   Logout

### Farmer Dashboard

Show: - Greeting - Current procurement status - Appointment date/time -
Procurement center - Token number - Current queue position - Estimated
waiting information if reliable - Quick actions - Recent notifications

### Schedule

-   Upcoming procurement schedules
-   Date
-   Time slot
-   Center
-   Crop/commodity if relevant
-   Appointment/token

### Procurement Details

-   Full status timeline
-   Token
-   Queue information
-   Center details
-   Appointment information
-   Important instructions

### History

-   Previous procurement records
-   Date
-   Center
-   Commodity
-   Status
-   Quantity/value fields only if actually available

### Notifications

-   Schedule updates
-   Queue/status changes
-   Cancellation
-   Important center announcements

### Profile

-   Name
-   Contact information
-   Preferred language
-   Assigned/selected center where applicable

------------------------------------------------------------------------

# 8. Officer Screens

## Officer Dashboard

Top summary cards: - Today's total appointments - Waiting - In
progress - Completed

Main area: - Current queue - Next farmer - Search - Filters - Status
controls

Queue table/card should contain: - Token - Farmer name - Appointment
time - Status - Action

Actions: - Call next - Start procurement - Complete - Mark no-show -
Cancel where authorized

Do not create actions that can accidentally destroy records.

------------------------------------------------------------------------

# 9. Admin Screens

## Admin Dashboard

Show: - Total farmers - Active centers - Today's appointments -
Completed procurements - Waiting count - Cancellation/no-show count

## User Management

-   Search
-   Filter by role
-   View details
-   Activate/deactivate where appropriate

## Center Management

-   Add center
-   Edit center
-   Center status
-   Capacity/working hours if required

## Schedule Management

-   Create schedule
-   Edit schedule
-   Publish/update schedule
-   Cancel schedule
-   View affected appointments

## Analytics

Useful SIH demo metrics: - Average waiting time - Completion rate -
Daily procurement count - Center-wise activity - Status distribution -
No-show/cancellation rate

Do not display fake analytics as if they are real production data. For
the prototype, clearly label seeded/demo data where necessary.

------------------------------------------------------------------------

# 10. Database Design

Use Firebase Firestore (NoSQL document database).

Suggested tables:

## profiles collection

Each document is keyed by the Firebase Authentication user UID. -
full_name - phone - role - preferred_language - created_at - updated_at

Roles: - farmer - officer - admin

## procurement_centers collection

-   name
-   code
-   address
-   district
-   state
-   latitude
-   longitude
-   contact_phone
-   operating_start
-   operating_end
-   active
-   created_at
-   updated_at

## procurement_schedules collection

-   center_id
-   date
-   start_time
-   end_time
-   commodity
-   capacity
-   status
-   notes
-   created_at
-   updated_at

## appointments collection

-   farmer_id
-   schedule_id
-   token_number
-   appointment_time
-   status
-   queue_position
-   notes
-   payment_status (when payment is part of the workflow)
-   created_at
-   updated_at

## procurement_records collection

-   appointment_id
-   farmer_id
-   center_id
-   commodity
-   quantity
-   completed_at
-   officer_id
-   remarks
-   created_at

Only include quantity/value fields if they are actually part of the
chosen SIH workflow.

## notifications collection

-   user_id
-   title
-   message
-   type
-   read_at
-   created_at
-   push_sent (when FCM is enabled)

## status_history collection

-   appointment_id
-   old_status
-   new_status
-   changed_by
-   note
-   created_at

This is important for transparency and auditing.

## payments collection (only when payment is included)

-   appointment_id
-   farmer_id
-   amount
-   status
-   reference
-   paid_at
-   created_at

For the SIH prototype, payment may be represented as a clearly labelled
demo/mock payment state unless a real payment gateway is explicitly
required and configured.

------------------------------------------------------------------------

# 11. Database Rules

-   Use stable document IDs and references for related entities.
-   Use timestamps consistently.
-   Configure Firestore indexes for frequently queried fields.
-   Prevent duplicate appointments where business rules require it.
-   Validate status transitions in server-side business logic.
-   Use Firestore Security Rules for client-access control.
-   Farmers must only access their own personal/appointment information.
-   Officers should only manage appointments belonging to their
    permitted center(s).
-   Admins have broader access according to defined policies.
-   Use Firebase Admin SDK only on the server for privileged operations.
-   Never expose Admin SDK credentials/service-account secrets in
    browser/client code.

------------------------------------------------------------------------

# 12. Authentication

Use Firebase Authentication.

After authentication: - Load the user's profile/role. - Redirect
according to role.

Example:

farmer → /farmer/dashboard officer → /officer/dashboard admin →
/admin/dashboard

Protect routes.

Never rely only on hiding navigation buttons for authorization.
Authorization must also be enforced server-side/database-side.

------------------------------------------------------------------------

### Firebase environment configuration

For the web client, use the Firebase Web configuration through
environment variables such as: - `NEXT_PUBLIC_FIREBASE_API_KEY` -
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` -
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` -
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` -
`NEXT_PUBLIC_FIREBASE_APP_ID`

For the Firebase Admin SDK, use secure server-only environment
configuration. The exact credential format may follow the deployment
setup, but **never commit service-account JSON or private keys**.

The Firebase Web API key is not treated as a secret by Firebase, but
Security Rules and server authorization must still protect the data.

# 13. Localization

Design the app so it can support: - English - Marathi - Hindi

For the prototype, start with English UI architecture and make strings
easy to translate.

Do not hard-code important user-facing text across dozens of components.

Use a central translation structure.

Keep language simple.

Example: Instead of: "Procurement Transaction State"

use: "Procurement Status"

Instead of: "Estimated Queue Advancement"

use: "Your Queue Position"

------------------------------------------------------------------------

# 14. Mobile-First Design

Farmers are the highest-priority mobile users.

Requirements: - Responsive layout. - Large touch targets. - Clear
buttons. - High readability. - Minimal unnecessary text. - Important
status visible without scrolling excessively. - Avoid dense
desktop-style tables on small screens. - Use cards on mobile. - Maintain
desktop layouts for officers/admins.

Test at: - Small phone width - Typical Android phone - Tablet - Laptop -
Desktop

------------------------------------------------------------------------

# 15. UI/UX Direction

Visual style: - Modern - Trustworthy - Clean - Agriculture-oriented
without becoming cartoonish - Professional enough for government/SIH
presentation

Use: - Consistent spacing. - Rounded cards where appropriate. - Clear
hierarchy. - Subtle shadows. - Accessible contrast. - Consistent
icons. - Status badges. - Skeleton/loading states. - Empty states. -
Error states. - Success feedback.

Avoid: - Excessive gradients. - Too many animations. - Huge text
everywhere. - Unnecessary 3D effects. - Fake complexity. - Cluttered
dashboards.

------------------------------------------------------------------------

# 16. Accessibility

Follow good accessibility practices: - Semantic HTML. - Keyboard
navigation. - Labels for inputs. - Meaningful button names. - Sufficient
contrast. - Focus states. - Do not rely only on color to communicate
status. - Use icons + text for important statuses.

------------------------------------------------------------------------

# 17. Notifications

Prototype notification types: - Appointment confirmed. - Appointment
changed. - Queue/status update. - Procurement completed. - Schedule
cancelled. - Center announcement.

Start with in-app notifications.

Do not add SMS/WhatsApp integrations unless they are genuinely required
and configured.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 17A. Digital Payment & Status Update

The system workflow includes a **Digital Payment & Status Update** step.

For the 7-day SIH prototype: - Keep payment status attached to the
relevant appointment/procurement record. - Support clear states such as
`PENDING`, `PAID`, and `FAILED` only if needed. - Show the
payment/status result clearly to the farmer. - Persist payment status in
Firestore. - Trigger an in-app notification when payment/status changes
where applicable. - A mock/demo payment flow is acceptable for the
prototype if no real payment gateway has been provided.

Do not integrate a real payment gateway, store card/UPI credentials, or
handle real money unless the team explicitly provides the required
gateway, credentials, and implementation requirements.

The demo should make it obvious whether the payment step is
**Demo/Mock** or a real configured integration.

------------------------------------------------------------------------

# 18. Queue Logic

The queue should be understandable and deterministic.

Example:

Token 101 → Completed Token 102 → In Progress Token 103 → Waiting Token
104 → Waiting

Farmer 103 sees: - Token: 103 - Current position: 1 - Status: Waiting

When token 102 is completed: - Token 103 can become the next farmer.

Do not claim an exact waiting time unless the system has enough reliable
data to calculate it.

If showing an estimate, label it: "Estimated waiting time"

------------------------------------------------------------------------

# 19. Error Handling

Every important operation needs: - Loading state - Success state - Error
state - Empty state

Examples: - Database unavailable. - Invalid form. - Unauthorized user. -
Appointment not found. - Schedule full. - Appointment already
completed. - Network timeout.

Errors shown to users must be understandable.

Do not expose raw database errors to farmers.

------------------------------------------------------------------------

# 20. Security

Minimum requirements: - Environment variables for secrets. - Never
commit `.env.local`. - Use Firebase RLS. - Validate inputs. - Validate
server-side operations. - Role-based authorization. - Do not trust
client-provided role. - Sanitize/validate user input. - Avoid exposing
private data. - Do not put API keys in frontend code.

Before deployment: - Run a security review. - Check exposed environment
variables. - Check database policies. - Check unauthorized route access.

------------------------------------------------------------------------

# 21. Seed / Demo Data

The SIH presentation needs a believable demonstration.

Create clearly marked demo/seed data.

Example: - 20--50 farmers - 2--5 procurement centers - Multiple
schedules - Today's appointments - Different statuses - Notifications -
Historical records

Use realistic but fictional data.

Do not use real people's personal information.

Create a predictable demo scenario so the team can demonstrate the
workflow reliably.

------------------------------------------------------------------------

# 22. Demo Scenario

Recommended live demo:

### Step 1

Log in as a farmer.

Show: "Your procurement is scheduled for 10:30 AM."

### Step 2

Show: Token #A104 Queue position: 3

### Step 3

Open officer dashboard.

Officer sees the same farmer in the queue.

### Step 4

Officer calls the farmer.

Status changes: WAITING → CALLED

### Step 5

Start procurement.

Status: CALLED → IN_PROGRESS

### Step 6

Complete procurement.

Status: IN_PROGRESS → COMPLETED

### Step 7

Return to farmer dashboard.

Farmer sees: "Procurement Completed"

This should be the core SIH demonstration.

------------------------------------------------------------------------

# 23. 7-Day SIH Development Sprint

This project has a strict delivery target. Treat **7 days as the maximum
build window**.

The original specification contains many useful capabilities, but do not
treat every capability as equally important. The goal is a stable,
believable SIH prototype with a strong end-to-end demonstration.

## 23.1 Priority Order

### P0 --- Must work

These are the core SIH features. Never sacrifice them for optional
features.

-   Farmer login/demo access.
-   Farmer dashboard.
-   Procurement schedule/appointment.
-   Token number.
-   Current queue position.
-   Clear procurement status timeline.
-   Officer dashboard.
-   Officer queue.
-   Call next / start / complete workflow.
-   Valid status transitions.
-   Real Firebase persistence.
-   Role-based access.
-   Farmer ↔ officer workflow using the same data.
-   Completion/history record.
-   Mobile-first farmer experience.
-   Seed/demo data.
-   Deployed working demo.

### P1 --- Should work

Build these after P0 is working.

-   In-app notifications.
-   Admin dashboard.
-   User management.
-   Center management.
-   Schedule management.
-   Basic analytics.
-   Lightweight AI demand prediction + slot suggestion.
-   Digital payment status flow (demo/mock unless a real gateway is
    configured).
-   Status history/audit trail.
-   Loading/error/empty states.
-   Strong responsive polish.
-   English UI with translation-ready structure.

### P2 --- Optional

Only build these if P0 and P1 are already stable.

-   Marathi translation.
-   Hindi translation.
-   Advanced analytics.
-   Advanced settings.
-   Real payment gateway integration unless explicitly
    required/configured.
-   Extra landing-page sections.
-   Additional animations.
-   AI assistance.
-   SMS/WhatsApp integration.
-   Non-essential CRUD features.

**Hard rule:** If any P0 feature is incomplete or unreliable, do not
work on P2.

------------------------------------------------------------------------

## 23.2 Seven-Day Schedule

### DAY 1 --- Foundation + Architecture

Goal: Create a clean project foundation and establish the architecture
without wasting time on unnecessary abstraction.

Tasks: - Inspect the existing repository before changing anything. -
Read this CLAUDE.md completely. - Confirm the existing/selected
Next.js + React + TypeScript setup. - Configure Tailwind CSS. -
Configure shadcn/ui only if useful. - Configure linting/formatting where
appropriate. - Create the basic folder structure. - Create the global
layout and navigation foundation. - Create the main routes. - Create a
small shared design system. - Configure Firebase client environment
variables and server-only Admin SDK credentials. - Define the Firestore
collection/document model, indexes, and Security Rules for the core
data. - Establish Firebase client/server boundaries and a server-only
Firebase Admin SDK layer. - Add `.env.example`. - Add/update README. -
Initialize or verify Git. - Create the first working checkpoint.

Do not: - Build every screen in detail. - Add AI. - Add unnecessary
libraries. - Build advanced analytics. - Spend the day perfecting
animations.

Acceptance: - App starts. - App builds. - Main routes exist. - No major
console errors. - Firebase configuration is ready. - Core database
structure is defined. - Basic UI shell is usable on mobile and desktop.

Checkpoint: `day-1-foundation`

------------------------------------------------------------------------

### DAY 2 --- Farmer Experience

Goal: Build the most important user-facing experience: a farmer can
understand exactly what is happening with their procurement.

Implement: - Login UI/demo login path. - Farmer dashboard. - Upcoming
appointment/schedule. - Procurement center information. - Token
number. - Queue position. - Procurement status. - Status timeline. -
Procurement details. - History. - Notifications page/UI if time
permits. - Profile basics if time permits.

The farmer dashboard must answer quickly: 1. When is my procurement? 2.
Where do I go? 3. What is my token? 4. What is my queue position? 5.
What is my current status? 6. What happens next?

Start with realistic data only when necessary, but do not leave dead
buttons.

Acceptance: - Farmer flow is understandable without explanation. -
Mobile layout is strong. - Status information is prominent. - Core
screens have loading, empty, and error states where relevant. - No major
dead ends.

Checkpoint: `day-2-farmer`

------------------------------------------------------------------------

### DAY 3 --- Officer + Queue Workflow

Goal: Make the procurement center workflow believable and interactive.

Implement: - Officer dashboard. - Today's appointments. - Waiting
queue. - Search/filter where useful. - Next farmer display. - Farmer
details. - Call next. - Start procurement. - Complete procurement. -
No-show. - Cancellation only where authorized. - Daily summary cards.

Core transitions: - SCHEDULED → WAITING - WAITING → CALLED - CALLED →
IN_PROGRESS - IN_PROGRESS → COMPLETED - WAITING → NO_SHOW where
applicable - Valid cancellation paths where applicable

Do not allow arbitrary status changes.

The queue must be deterministic. If token 101 is completed and token 102
is in progress, the next waiting farmer should have an understandable
position.

Acceptance: - Officer can progress a farmer through the queue. - Status
changes are reflected consistently. - Invalid transitions are blocked. -
Farmer and officer views use the same underlying appointment data once
the database is connected.

Checkpoint: `day-3-officer-queue`

------------------------------------------------------------------------

### DAY 4 --- Real Firebase Database + Authentication + Roles

Goal: Connect the core workflow to real Firebase data and secure it with
Firebase Authentication, Firestore Security Rules, and server-side Admin
SDK boundaries.

Implement: - Firebase Authentication. - Login/logout/session handling. -
Profiles. - Farmer/officer/admin roles. - Role-based routing. -
Protected pages. - Database relationships. - Required indexes. -
Firestore Security Rules. - Server-side/database-side authorization. -
Core seed/demo data. - Real reads/writes for: - profiles -
procurement_centers - procurement_schedules - appointments -
procurement_records - notifications if implemented - status_history

Security requirements: - Never expose Firebase Admin/service-account
secrets in client code. - Never trust a client-provided role. - Farmers
only access their own data. - Officers only manage permitted center
data. - Admins have broader access according to defined policies.

Acceptance: - Real database persistence works. - Farmer → officer →
completion flow works with real data. - Role restrictions work. -
Firestore Security Rules are tested. - Demo data is predictable and
fictional.

Checkpoint: `day-4-backend-auth`

------------------------------------------------------------------------

### DAY 5 --- Admin + Notifications + Analytics

Goal: Add the supporting features that make the prototype look like a
complete operational system.

Implement in this order:

1.  Admin dashboard
    -   Total farmers.
    -   Active centers.
    -   Today's appointments.
    -   Completed procurements.
    -   Waiting count.
    -   Cancellation/no-show count.
2.  Schedule/center management
    -   Create/edit schedules.
    -   Publish/update schedules.
    -   Cancel schedules where required.
    -   Center information.
3.  In-app notifications
    -   Appointment confirmed.
    -   Appointment changed.
    -   Queue/status update.
    -   Procurement completed.
    -   Schedule cancelled.
    -   Center announcement.
4.  Basic analytics
    -   Daily procurement count.
    -   Waiting count.
    -   Completed count.
    -   Status distribution.
    -   Center-wise activity.
    -   Average waiting time only when reliable data supports it.

Use actual database/demo data for charts.

Do not build a complicated analytics engine. Simple, clear charts are
enough.

Acceptance: - Admin has useful operational visibility. - Important
events can appear as in-app notifications. - Analytics are
understandable and not presented as fake real-world statistics. - Core
farmer/officer flow still works.

Checkpoint: `day-5-admin-features`

------------------------------------------------------------------------

### DAY 6 --- Integration + Polish + Testing

Goal: Turn the working prototype into a stable, presentation-ready
product.

Integration: - Verify the farmer and officer use the same live data. -
Verify status changes update the correct records. - Verify completion
creates the procurement record. - Verify history reflects completed
procurement. - Verify notifications match important events. - Verify
queue positions remain deterministic.

UI/UX: - Improve spacing and hierarchy. - Improve status badges. -
Improve buttons and touch targets. - Add loading states. - Add empty
states. - Add useful error states. - Improve responsive layouts. - Test
small phone width. - Test typical Android phone width. - Test tablet. -
Test laptop/desktop. - Keep farmer UI simple and readable. - Keep
officer/admin dashboards efficient.

Accessibility: - Semantic HTML. - Input labels. - Meaningful button
names. - Keyboard navigation where relevant. - Sufficient contrast. -
Visible focus states. - Do not rely only on color for status.

Testing: - Login. - Role routing. - Farmer flow. - Officer flow. - Admin
flow. - Appointment data. - Queue updates. - Status transitions. -
Notifications. - Database failures. - Unauthorized access. - Mobile
responsiveness.

Run: - lint - typecheck - build - tests if configured

Fix errors introduced by the changes.

Only if the core system is already stable: - Add Marathi/Hindi
translation support. - Add minor visual polish. - Add a simple "How it
works" section.

Checkpoint: `day-6-polish-tested`

------------------------------------------------------------------------

### DAY 7 --- Security + Deployment + Demo Freeze

Goal: Deploy a stable prototype and prepare the exact SIH demonstration.

Security review: - Firestore Security Rules. - Authentication. -
Authorization. - Protected routes. - Environment variables. -
Client/server boundaries. - Secrets. - Exposed API keys. - Unauthorized
data access. - Obvious database/query problems.

Deployment: - Push to GitHub. - Configure Vercel. - Configure
environment variables. - Connect production Firebase project. - Run
production build. - Test deployed URL. - Verify authentication. - Verify
database reads/writes. - Verify mobile UI. - Verify the complete demo
workflow.

Demo preparation: - Prepare demo accounts. - Prepare predictable
fictional data. - Prepare the core demo scenario. - Prepare a 3--5
minute walkthrough. - Prepare backup screenshots/video if internet
access fails. - Verify every demo button before presentation.

### Feature Freeze

After the deployed demo works:

**DO NOT start new major features.**

Only fix: - Broken functionality. - Deployment issues. - Security
problems. - Demo-blocking UI issues. - Critical responsiveness issues.

Do not risk the stable build for an optional feature.

Checkpoint: `day-7-demo-ready`

------------------------------------------------------------------------

# 

### Optional intelligent scheduling moment

Before the appointment is selected, show: - Current/expected demand
level for available slots. - One recommended slot. - A short
explanation: "Suggested based on recent booking patterns."

### Optional payment moment

After procurement processing, show the payment/status step if enabled: -
Payment status. - Confirmation/reference for demo data. - Updated
notification/status.

Keep these additions secondary to the core queue demonstration.

# 23.3 If the Team Falls Behind

Use this fallback order.

### Keep

1.  Farmer dashboard.
2.  Appointment/schedule.
3.  Token/queue.
4.  Status timeline.
5.  Officer queue.
6.  Call/start/complete.
7.  Firebase database.
8.  Auth/roles.
9.  Completion/history.
10. Seed data.
11. Deployment.

### Simplify or postpone

-   Admin CRUD.
-   Advanced analytics.
-   Notifications beyond basic in-app messages.
-   Marathi/Hindi.
-   Advanced profile/settings.
-   Extra landing pages.
-   Advanced animations.
-   AI features.
-   External integrations.

A smaller stable prototype is better than a larger broken one.

------------------------------------------------------------------------

# 24. Route Map

Use the following route structure unless the existing Next.js
architecture provides a clearly better equivalent.

/ /login /about

/farmer /dashboard /schedule /procurement/\[id\] /history /notifications
/profile

/officer /dashboard /queue /appointments /history

/admin /dashboard /users /centers /schedules /analytics /settings

P0 routes: - `/login` - `/farmer/dashboard` - `/farmer/schedule` -
`/farmer/procurement/[id]` - `/farmer/history` - `/officer/dashboard` -
`/officer/queue`

P1 routes: - `/farmer/notifications` - `/farmer/profile` -
`/officer/appointments` - `/officer/history` - `/admin/dashboard` -
`/admin/centers` - `/admin/schedules` - `/admin/analytics`

Do not create a route just because it appears in this list if the
functionality is not needed for the working demo.

------------------------------------------------------------------------

# 25. Suggested Project Structure

Use a structure appropriate for the chosen Next.js version.

Example:

src/ app/ components/ ui/ farmer/ officer/ admin/ shared/ lib/ firebase/
auth/ validation/ utils/ services/ hooks/ types/ config/ i18n/

Prefer understandable code.

Do not create unnecessary abstraction layers, generic frameworks, or
files that only wrap one trivial function.

------------------------------------------------------------------------

# 26. Coding Rules for Claude

You are the coding agent for this repository.

ALWAYS:

1.  Read relevant existing files before changing them.
2.  Read this CLAUDE.md and follow the current 7-day priority system.
3.  Inspect the current repository state before making assumptions.
4.  Reuse existing components.
5.  Keep changes focused.
6.  Preserve working functionality.
7.  Use TypeScript properly.
8.  Keep components maintainable.
9.  Validate user input.
10. Handle loading/error/empty states for important operations.
11. Test after meaningful changes.
12. Fix errors you introduce.
13. Keep mobile responsiveness.
14. Follow the established design system.
15. Prefer the simplest reliable implementation.
16. Use real Firebase data once the database is connected.
17. Keep security rules enforced server-side/database-side.
18. Update documentation when architecture changes.

NEVER:

1.  Delete the project and rebuild it unnecessarily.
2.  Replace the whole codebase for a small feature.
3.  Create duplicate components without a reason.
4.  Hard-code secrets.
5.  Commit `.env.local`.
6.  Use fake APIs when the real database is already connected.
7.  Remove working functionality just to make an error disappear.
8.  Hide errors instead of fixing them.
9.  Add unnecessary dependencies.
10. Add microservices or complex architecture.
11. Start optional features while P0 work is broken.
12. Automatically move to the next day.
13. Rewrite unrelated code.
14. Introduce a new library when the current stack can solve the
    problem.
15. Claim a feature is complete without verifying it.

------------------------------------------------------------------------

# 27. How Claude Should Work

For every requested day/phase:

### Step A --- Inspect

Read: - This CLAUDE.md. - Relevant existing files. - Existing
components. - Existing routes. - Existing database code. - Relevant
configuration.

Do not assume the repository matches the specification.

### Step B --- Plan

Before significant implementation, briefly state: - What will change. -
Which files will change. - Which P0/P1 requirement is being addressed. -
Important assumptions. - Any risk that could affect the 7-day schedule.

Keep the plan short.

### Step C --- Implement

Modify the actual repository files.

Do not merely paste code into chat.

Implement only the requested day/feature scope.

### Step D --- Verify

Run appropriate checks: - lint - typecheck - tests - build - development
checks - relevant manual flow

Use the smallest useful verification set during iteration, then run
broader checks at the end of the day.

### Step E --- Fix

If errors appear: 1. Diagnose the actual cause. 2. Fix it. 3. Re-run the
relevant check. 4. Do not hide or bypass the error.

### Step F --- Report

Tell me: - What changed. - Files changed. - P0/P1 requirements
completed. - Verification performed. - Remaining issues. - Whether the
next day's work is safe to begin.

Then STOP.

**Do not begin the next day automatically.**

------------------------------------------------------------------------

# 28. Claude Code Usage Strategy

Because this project has a strict 7-day deadline, use Claude
efficiently.

## Prefer coherent task blocks

Give Claude a complete feature/task rather than many tiny prompts.

Good: "Implement the farmer dashboard including appointment, token,
queue position, status timeline, loading state and mobile layout.
Inspect existing components first, then implement and verify."

Avoid: "Make button." "Now change color." "Now change padding." "Now
change icon."

## Plan before large changes

For a large feature, ask Claude to inspect and make a short plan first.
Then implement after approval when the change is risky.

## Keep context manageable

Use: - `/compact` when the conversation becomes unnecessarily large. -
`/clear` when starting an unrelated task and the repository/CLAUDE.md is
enough context.

Do not repeatedly paste the entire specification into prompts.

## Model/effort guidance

Use the strongest practical coding model available for important work.

Recommended approach: - **Sonnet + High effort:** default for SIH
implementation and meaningful debugging. - **Medium effort:** routine UI
work, repetitive changes, simple CRUD. - **Low effort:** tiny text/CSS
adjustments. - **Opus/highest effort:** reserve for genuinely difficult
architecture or debugging problems when needed.

Do not use maximum effort for every tiny change.

## Protect the 7-day budget

Before starting a task, Claude should ask internally: 1. Is this P0? 2.
If not, is P1 already stable? 3. Can this be implemented simply? 4. Is
this feature worth the time it will consume? 5. Could this introduce a
new dependency or failure point?

If the answer suggests unnecessary risk, prefer the simpler
implementation.

------------------------------------------------------------------------

# 29. Git Workflow

Create checkpoints at meaningful milestones.

Recommended checkpoints:

-   `day-1-foundation`
-   `day-2-farmer`
-   `day-3-officer-queue`
-   `day-4-backend-auth`
-   `day-5-admin-features`
-   `day-6-polish-tested`
-   `day-7-demo-ready`

Before risky changes: - Commit the current working state.

After a successful meaningful day: - Commit the working state.

Do not rewrite Git history unless explicitly instructed.

Do not delete a known-good checkpoint to save time.

------------------------------------------------------------------------

# 30. Definition of Done

A feature/day is complete only when:

-   Required functionality exists.
-   Existing functionality still works.
-   UI is responsive.
-   No obvious console errors remain.
-   TypeScript/lint/build checks pass where applicable.
-   Loading/error/empty states are handled for important flows.
-   Code is reasonably organized.
-   No secrets are exposed.
-   Relevant security rules are enforced.
-   Relevant documentation is updated.
-   The feature has been manually verified when practical.

For the **final SIH demo**, the most important Definition of Done is:

**A farmer can see a procurement appointment and queue status, an
officer can progress that same appointment through the procurement
workflow, and the farmer can see the completed result.**

------------------------------------------------------------------------

# 31. Important SIH Principle

The application should not merely look like a dashboard.

It must clearly demonstrate that it solves the actual problem.

### BEFORE

Farmer: - "What's my procurement date?" - "Where do I go?" - "How long
will I wait?" - "Has my procurement started?" - "Is my turn coming?"

### AFTER

Farmer: - "My appointment is tomorrow at 10:30." - "My token is A104." -
"I'm currently #3 in the queue." - "My procurement is in progress." -
"My procurement is completed."

This before/after story must be visible in the final demo.

The demo should focus on:

**Problem** → Schedule transparency → Queue visibility → Live status →
Officer management → Completion confirmation

------------------------------------------------------------------------

# 32. Avoid Overengineering

This is an SIH prototype.

Do NOT add unless clearly justified:

-   Microservices.
-   Complex AI.
-   Blockchain.
-   Unnecessary 3D.
-   Complicated event streaming.
-   Multiple backend frameworks.
-   Huge state-management systems.
-   Unnecessary third-party APIs.
-   Complex real-time infrastructure when simple refresh/revalidation is
    sufficient.
-   Large design systems beyond the actual product needs.

A reliable, polished product is better than a huge unstable product.

AI can be added later only if it provides a meaningful feature such
as: - Multilingual farmer assistance. - Simple FAQ/query support. -
Schedule explanation. - Notification summarization.

The core procurement tracking workflow comes first.

------------------------------------------------------------------------

# 33. Demo Data

Use clearly marked fictional seed data.

Suggested: - 20--50 farmers. - 2--5 procurement centers. - Multiple
schedules. - Today's appointments. - Different statuses. -
Notifications. - Historical records.

Create one predictable hero demo farmer and appointment.

Example: - Farmer: fictional farmer. - Center: fictional procurement
center. - Token: A104. - Queue position: 3. - Status: WAITING.

The exact names/data can be chosen during implementation.

Never use real people's personal information.

The hero demo must be easy to reset or reproduce.

------------------------------------------------------------------------

# 34. Final Demo Scenario

Recommended live demo:

### Step 1 --- Farmer

Log in as a farmer.

Show: - Today's/upcoming procurement appointment. - Center. - Token
A104. - Queue position 3. - Current status.

### Step 2 --- Procurement Details

Open the procurement details.

Show the timeline: - Scheduled. - Waiting. - Called / In Progress. -
Completed.

### Step 3 --- Officer

Open the officer dashboard.

Show the same farmer in the queue.

### Step 4 --- Call

Officer calls the farmer.

Status: `WAITING → CALLED`

### Step 5 --- Start

Officer starts procurement.

Status: `CALLED → IN_PROGRESS`

### Step 6 --- Complete

Officer completes procurement.

Status: `IN_PROGRESS → COMPLETED`

### Step 7 --- Farmer

Return to the farmer dashboard.

Show: "Procurement Completed"

Then show the completed record in history.

This is the core SIH demonstration. Do not let optional features
distract from it.

------------------------------------------------------------------------

# 35. Master Instruction

Treat this document as the source of truth for the project.

If a future request conflicts with this document:

1.  Identify the conflict.
2.  Explain it briefly.
3.  Follow the latest explicit user instruction if it is safe and
    technically reasonable.
4.  Preserve the overall architecture unless a change is necessary.
5.  Preserve the 7-day priority system unless the user explicitly
    changes the delivery target.

Do not make major architectural changes silently.

When schedule pressure exists, prioritize: **P0 → stability → P1 →
polish → P2**

------------------------------------------------------------------------

# 36. First Command

When this repository is opened for the first time, start with:

"Read CLAUDE.md completely. Inspect the repository and determine its
current state. We are starting DAY 1 --- Foundation + Architecture.
Firebase is the selected backend; do not replace it with Supabase or
another backend unless the user explicitly instructs you to. Do not
implement optional features. First produce a concise current-state
assessment, architecture/implementation plan, route map, database plan,
and assumptions. Then implement only the Day 1 foundation tasks, verify
the result, report changed files and remaining issues, and stop."

If the repository is already partially built, do NOT recreate it.

Instead: - Inspect what already exists. - Preserve working code. -
Identify which day/P0 requirements are already complete. - Continue from
the correct point.

------------------------------------------------------------------------

# 37. Daily Command Template

Use this pattern:

"Start DAY \[NUMBER\] --- \[NAME\].

Read CLAUDE.md and inspect the current repository before making changes.

Implement only the tasks for this day that are not already complete.

Priority: P0 first, then P1. Do not start P2 unless P0 and P1 are
stable.

Reuse existing architecture and components. Do not rewrite unrelated
code. Do not add unnecessary dependencies. Modify the actual repository
files directly.

After implementation: 1. Run appropriate checks. 2. Fix errors
introduced by your changes. 3. Verify the relevant user flow. 4. Verify
responsive behavior where relevant. 5. Summarize changed files. 6.
Summarize completed P0/P1 items. 7. List remaining issues or risks. 8.
Create/prepare the day's Git checkpoint if appropriate. 9. Stop and wait
for the next day."

------------------------------------------------------------------------

# 38. Final Pre-Presentation Checklist

Before presenting, verify:

## Core workflow

-   [ ] Farmer login works.
-   [ ] Farmer dashboard works.
-   [ ] Appointment/schedule is visible.
-   [ ] Token is visible.
-   [ ] Queue position is visible.
-   [ ] Status timeline works.
-   [ ] Officer queue works.
-   [ ] Call next works.
-   [ ] Start procurement works.
-   [ ] Complete procurement works.
-   [ ] History shows completed procurement.

## Data

-   [ ] Firebase is connected.
-   [ ] Demo data is seeded.
-   [ ] Farmer and officer see the same appointment.
-   [ ] Status changes persist.
-   [ ] No real personal data is used.

## Security

-   [ ] RLS is enabled and tested.
-   [ ] Roles are enforced.
-   [ ] Protected routes work.
-   [ ] Secrets are not exposed.
-   [ ] `.env.local` is not committed.

## UI

-   [ ] Farmer mobile view is polished.
-   [ ] Officer desktop view is usable.
-   [ ] Loading states exist.
-   [ ] Empty states exist.
-   [ ] Error states exist.
-   [ ] Important statuses use text + icons/badges.
-   [ ] No obvious console errors.

## Deployment

-   [ ] Production build passes.
-   [ ] Deployed URL works.
-   [ ] Production environment variables are configured.
-   [ ] Production Firebase works.
-   [ ] Authentication works after deployment.
-   [ ] Database reads/writes work after deployment.

## Presentation

-   [ ] Demo accounts are ready.
-   [ ] Hero demo farmer is ready.
-   [ ] Demo scenario has been rehearsed.
-   [ ] 3--5 minute walkthrough is ready.
-   [ ] Backup screenshots/video are ready.
-   [ ] PPT matches the actual implemented features.

------------------------------------------------------------------------

# END OF MASTER SPECIFICATION
