# Campus Event Management — Detailed Project Report

## 1. Project purpose

Campus Event Management is a real-world style application for running college events. Organizers can create events, maintain the student directory, accept registrations, manage capacity and waitlists, record attendance, and monitor participation through analytics.

The project is intentionally presented as a product application. MongoDB is the operational database behind the workflows; there is no separate lab or query runner.

## 2. Users and workflow

The main operator is an event coordinator or student activities administrator.

A normal workflow is:

1. Add or update departments and student profiles.
2. Create an event with its category, venue, dates, organizer, tags, and capacity.
3. Review the event in the Events page.
4. Register a student from the Registrations page.
5. Automatically confirm the registration while seats are available, or place it on the waitlist when capacity is full.
6. Update attendance after the event.
7. Use Analytics to understand demand, utilization, department participation, and registration status.
8. Use Analytics to review participation and capacity trends.

## 3. Application architecture

### Frontend

The frontend is a Next.js App Router application written in TypeScript and styled with Tailwind CSS. It contains these product pages:

- Dashboard
- Events
- Students
- Registrations
- Analytics

The frontend calls the Express API through frontend/lib/api.ts. It never connects to MongoDB directly and never sends arbitrary MongoDB filters or commands.

### Backend

The backend is an Express application using the official MongoDB Node.js driver. Its responsibilities are:

- Validate request data with Zod.
- Build safe server-side filters and pagination.
- Enforce domain rules before writing.
- Return consistent JSON responses.
- Join registration records with student and event data for readable screens.
- Send analytics aggregation pipelines to MongoDB.
- Run on a resilient MongoDB deployment without exposing database administration screens to end users.

### Database

The backend connects to the mongos router at 127.0.0.1:27020. The application therefore uses the same routed cluster that demonstrates availability and horizontal distribution.

## 4. Domain collections

### Departments

Stores department identity and coordination information. code and name are unique so the same department cannot be created twice.

### Students

Stores a student's campus identifier, name, email, department reference, denormalized department name, year, phone, skills, and timestamps.

Unique indexes on studentId and email protect the two business identifiers used by staff.

### Events

Stores the event title, description, category, venue, event date, registration deadline, capacity, status, tags, organizer, and timestamps.

Indexes support the common event-list operations: status/date sorting and category filtering.

### Registrations

Stores the relationship between one student and one event. It also stores registration status, attendance status, notes, and registration time.

The compound unique index on studentId plus eventId is both a business rule and the range shard-key index. It prevents duplicate student-event registrations.

## 5. Business rules

- A registration is rejected when the student or event does not exist.
- A duplicate student-event registration returns a conflict.
- Confirmed registrations are counted against event capacity.
- When confirmed capacity is full, a new registration is stored as waitlisted.
- Event deletion is protected when registrations exist unless an explicit force request is supplied.
- Student deletion removes that student's registration records.
- Registration and event screens use joined, human-readable names rather than exposing only ObjectIds.
- Pagination is bounded and sort fields are allowlisted.

The capacity decision is intentionally implemented as a count-then-insert flow. It is understandable for a local application and documented as non-atomic because transactions are outside this product's current scope.

## 6. MongoDB design

### References and joins

Students and events have their own documents. Registrations store their ObjectId references. When the UI needs a readable registration list, the backend uses lookup to join registrations to students and events, unwind to flatten lookup results, and project to select only fields required by the UI.

### Analytics

Analytics are computed in MongoDB rather than in the browser. Pipelines use match, group, sum, avg, min, max, lookup, unwind, project, and sort.

The API returns already calculated values. Recharts is responsible only for visual presentation.

Examples include registrations and utilization by event, registrations by department, event count and capacity by category, registration status totals, capacity statistics, and recent registrations with joined names.

### Indexing

Indexes are created when the backend connects:

- Students: unique studentId, unique email, department, and year.
- Departments: unique code and unique name.
- Events: status/date, category, and capacity.
- Registrations: unique student/event pair, event/status, and student/status.

The backend does not silently drop indexes. Index creation errors are surfaced during startup.

### Replication

Each data shard is a three-member replica set. A primary accepts writes; secondaries maintain copies through the oplog. If a primary fails, the remaining members can elect a new primary.

The backend uses majority write concern so a successful write is acknowledged after the replica-set majority has accepted it. Analytics use secondaryPreferred because reports can tolerate slight replication lag; normal CRUD reads use the default primary preference.

### Sharding

The application uses two data shards behind mongos:

- registrations: range key studentId plus eventId. Student-based queries can be targeted; event-only queries can involve more than one shard.
- events: hashed key _id. ID lookups can be targeted and event records are distributed more evenly.

students and departments remain unsharded on the primary shard because their unique identity indexes are important to the product and do not need horizontal partitioning at this scale.

## 7. Deployment layout

| Service | Port | Responsibility |
|---|---:|---|
| Next.js | 3000 | Product UI |
| Express | 5000 | API and domain rules |
| mongos | 27020 | Application database router |
| cfg1 | 27030 | Config server replica-set member |
| s1a/s1b/s1c | 27111–27113 | Three members of shard1RS |
| s2a/s2b/s2c | 27124, 27122, 27123 | Three members of shard2RS |

All published ports bind to 127.0.0.1. The Docker network uses container DNS names for replica-set membership.

## 8. Seed data

npm run seed idempotently creates the base departments, students, events, and registrations.

npm run seed:volume adds larger tagged data for realistic analytics and sharding demonstrations. npm run seed:remove-volume removes only those volume-seed records and requires the explicit --yes flag.

The seed does not reset the entire database and does not create unrelated scratch data.

## 9. Limitations and future production work

- The local config server has one member to reduce resource use; production should use three.
- Capacity assignment is count-then-insert and can race under heavy concurrent registration.
- Authentication, authorization, notifications, payments, and cloud deployment are not part of this version.
- The local cluster is intended for demonstration and development, not production operations.

## 10. Demo outcome

The strongest demonstration is a complete business flow: create an event, register students, show a waitlisted registration when capacity is reached, update attendance, and open Analytics to review the resulting participation data. The underlying resilient MongoDB deployment remains transparent to the end user.

