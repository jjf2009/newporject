# AGENT.md — Campus Event Management System (MongoDB DBMS Lab)

> **Purpose:** Implementation contract for Codex and any developer on this repository. Read it completely before changing anything.
> **Goal:** One small, honest, demonstrable application that implements **exactly the 11 syllabus topics below, and nothing else**, plus a ready-to-run demo script.

---

## 0. Scope rule (read first)

The syllabus is the whole scope:

| # | Topic | Syllabus detail |
|---|-------|-----------------|
| 1 | MongoDB Installation and configuration | Install MongoDB Community Server, mongosh and Compass; configure and verify installation |
| 2 | Introduction to MongoDB | NoSQL concepts, MongoDB architecture, databases, collections, documents, BSON and data types |
| 3 | CRUD – Create and Read | `insertOne()`, `insertMany()`, `find()`, query filters and projection |
| 4 | CRUD – Update and Delete | `updateOne()`, `updateMany()`, `$set`, `$inc`, `deleteOne()`, `deleteMany()` |
| 5 | Advanced Queries | Comparison operators, logical operators, sorting, limiting and skipping |
| 6 | Aggregation – Basics | Aggregation pipeline, `$match`, `$group`, `$sum`, `$avg`, `$min`, `$max` |
| 7 | Aggregation – Advanced | `$project`, `$sort`, `$unwind`, `$lookup` and real-world applications |
| 8 | Replication | Replica set architecture, primary, secondary, oplog, election and automatic failover |
| 9 | Sharding | Sharded cluster architecture, shard key, range-based and hashed sharding |
| 10 | Replication vs Sharding | Comparison, need for scalability, high availability and practical use cases |
| 11 | MongoDB Application | Entire application which uses the above features |

**If a feature is not needed to demonstrate one of these 11 topics, do not build it.**

Explicitly out of scope (do not add, even if "easy"): authentication/login, roles/RBAC, payments, email/WhatsApp/notifications, QR codes, certificates, GridFS, TTL indexes, text or geospatial indexes, time-series or capped collections, views, transactions, change streams, `$facet`/`$bucket`/`$merge`, backup tooling, CI/CD, cloud deployment, PWA.
Do not remove existing working features (CRUD, waitlist, attendance, analytics); just do not extend them.

---

## 1. Core design decision: ONE real stack, not separate labs

The application itself runs on a **sharded cluster in which every shard and the config server is a replica set**. The backend talks only to `mongos`.

```
Next.js (frontend)
      │  fetch
Express API (backend, official mongodb driver)
      │  mongodb://127.0.0.1:27020
   mongos (router)
      ├── config server replica set  configRS  (1 member, simplification — see 3.3)
      ├── shard1RS  (3-member replica set: s1a, s1b, s1c)
      └── shard2RS  (3-member replica set: s2a, s2b, s2c)
```

Consequences:
- Topics 8, 9, 10 are demonstrated on the **same database the app uses**, not on toy copies.
- The old separate artifacts must be **removed/migrated**: the standalone-only assumption, the replication lab on ports 27117–27119, the `/sharded-data` page, and the collections `events_by_date` and `registrations_by_student`. Do not delete the user's existing standalone container or volumes (see §15); just stop depending on them.
- Replication and sharding evidence must come from the real cluster. If the cluster is down, show a clear "Cluster not running" state with startup instructions. Never fake status.

### 1.1 Collection layout and shard keys

| Collection | Sharded? | Shard key | Why |
|---|---|---|---|
| `registrations` | Yes — **range-based** | `{ studentId: 1, eventId: 1 }` | The existing unique index `{studentId:1, eventId:1}` *is* the shard key index, so duplicate-registration prevention still works. Queries by `studentId` are **targeted**; queries by `eventId` alone are **scatter-gather**. |
| `events` | Yes — **hashed** | `{ _id: "hashed" }` | Even distribution. Demonstrates hashed sharding: `_id` lookups targeted, `category` queries scatter-gather. |
| `students`, `departments`, `lab_examples` | No | — | Live on the primary shard (`shard1RS`). `students` has two unique indexes (`studentId`, `email`); a sharded collection can only enforce unique indexes that are prefixed by the shard key, so sharding it would break uniqueness. This is a deliberate viva talking point. |

**Do not** shard `registrations` with `{ studentId: "hashed" }`: a hashed shard key cannot back the compound unique index and the shard command would fail or silently lose uniqueness.

### 1.2 Concerns used by the app (Topic 8 in real code)
- All application writes: `writeConcern: { w: "majority" }`.
- Analytics aggregations: `readPreference: "secondaryPreferred"` (document the trade-off: results can lag slightly).
- List/detail pages (CRUD): default primary reads, so users see their own writes immediately.
- Registration capacity policy (fixed): if confirmed count `>= capacity`, create the registration with status `waitlisted`. Counting by `eventId` is a scatter-gather query by design. Known limitation, documented in README: count-then-insert is not atomic (no transactions — out of scope).

---

## 2. Fixed technology decisions

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router + TypeScript, Tailwind CSS, Recharts (charts only for display) |
| Backend | Node.js + Express, **official `mongodb` driver only** (no Mongoose) |
| Validation | Zod |
| Database | MongoDB Community Server via Docker image `mongodb/mongodb-community-server` (verify the tag with `docker pull`; default `8.0`, reuse the major version already in the repo if different) |
| Runtime | Fedora Linux, Docker Engine, Docker Compose V2 |
| Package managers | pnpm (frontend), npm (backend) |

Rules: the browser never talks to MongoDB; no raw filters from the client; no arbitrary command execution over HTTP; bind all published ports to `127.0.0.1`; never commit `.env`; never put the URI in a `NEXT_PUBLIC_` variable. Existing compatible code takes priority over rewrites.

---

## 3. Infrastructure: `infrastructure/cluster/`

```
infrastructure/cluster/
├── compose.yaml
├── init-cluster.sh        # idempotent one-shot initialization
└── README.md              # start, verify, failover, reset (explain before destroying data)
```

### 3.1 Containers and ports (all `127.0.0.1`)

| Container | Role | Host port |
|---|---|---|
| `cfg1` | config server, replica set `configRS` | 27030 |
| `s1a`, `s1b`, `s1c` | shard 1, replica set `shard1RS` | 27111, 27112, 27113 |
| `s2a`, `s2b`, `s2c` | shard 2, replica set `shard2RS` | 27121, 27122, 27123 |
| `mongos` | router (what the app uses) | **27020** |
| `cluster-init` | one-shot init job | — |

Port 27017 stays free so the user's existing standalone container is not disturbed. Total: 8 long-running containers (~2–3 GB RAM). Use a named network, named volumes, and healthchecks.

### 3.2 Requirements
- Start commands: `mongod --configsvr --replSet configRS`, `mongod --shardsvr --replSet shard1RS` (and `shard2RS`), `mongos --configdb configRS/cfg1:27017 --bind_ip_all`. Use `--bind_ip_all` inside the container network; publish to host on `127.0.0.1` only.
- Replica sets initialized with **container DNS names** (`s1a:27017`), never `localhost`. Equal priorities (the initial primary is arbitrary; the Cluster page shows which one it is).
- **Fedora/SELinux:** any bind-mounted script needs the `:z` suffix (for example `./init-cluster.sh:/init.sh:z`).
- `init-cluster.sh` must be idempotent (safe to re-run) and, in order:
  1. wait until all members respond;
  2. `rs.initiate` configRS, shard1RS, shard2RS; wait for a PRIMARY in each;
  3. wait for `mongos`; `sh.addShard("shard1RS/s1a:27017,s1b:27017,s1c:27017")` and the same for shard2RS;
  4. enable sharding on `campus_events` with primary shard `shard1RS` (verify the exact `sh.enableSharding` signature for the installed version);
  5. create the shard-key indexes (`registrations: {studentId:1,eventId:1}` unique; `events: {_id:"hashed"}`);
  6. `sh.shardCollection("campus_events.registrations", { studentId: 1, eventId: 1 })` and `sh.shardCollection("campus_events.events", { _id: "hashed" })`;
  7. set chunk size to 1 MB for demo purposes (`config.settings`, `_id: "chunksize"`) and print the choice;
  8. print `CLUSTER READY` only if `sh.status()` confirms both shards and both sharded collections.
- Never drop volumes or databases automatically. A documented `down -v` reset is allowed only as a manual command with a warning.

### 3.3 Labeled simplification
The config server replica set has one member to save RAM (production uses three). State this in the README and on the Cluster page footnote.

### 3.4 Host access for demos
- App/Compass: `mongodb://127.0.0.1:27020`
- A specific member from Compass or the backend status service: `mongodb://127.0.0.1:27111/?directConnection=true` (needed because members advertise container hostnames the host cannot resolve).
- Shell: `docker exec -it mongos mongosh` (mongosh is inside the container; do not assume it exists on the host).

---

## 4. Repository layout

Adapt to the existing structure; do not create empty files.

```
campus-event-management/
├── AGENT.md  README.md  .gitignore
├── frontend/src/app/{page.tsx, events, students, registrations, analytics, database-lab, cluster}/page.tsx
├── frontend/src/components/   (app-shell, sidebar, page-header, stat-card, data-table, empty/loading states, code-example)
├── frontend/src/lib/{api.ts, types.ts, format.ts}
├── backend/src/
│   ├── config/db.js            # one MongoClient → mongos; indexes
│   ├── routes/ controllers/ services/
│   ├── lab/examples.js         # single source of truth for Database Lab examples
│   ├── services/cluster.service.js
│   ├── seed/seed.js
│   └── server.js
├── infrastructure/cluster/
└── docs/{syllabus-mapping.md, practical-demo-script.md}
```

---

## 5. Domain model (database `campus_events`)

Use `ObjectId` for `_id` and for all references so `$lookup` is a real join.

- **departments**: `name` (unique), `code` (unique), `coordinator`, `createdAt`.
- **students**: `studentId` (unique string, e.g. `GEC2026-001`), `name`, `email` (unique), `departmentId` (ObjectId), `departmentName` (denormalized on purpose: embedding vs referencing talking point), `year` (int 1–4), `phone`, `skills` (array of strings), `createdAt`, `updatedAt`.
- **events**: `title` (required), `description`, `category` (`Technical|Cultural|Sports|Workshop|Seminar|Other`), `venue`, `eventDate`, `registrationDeadline`, `capacity` (positive int), `status` (`upcoming|ongoing|completed|cancelled`), `tags` (array), `organizer`, `createdAt`, `updatedAt`.
- **registrations**: `studentId` (ObjectId), `eventId` (ObjectId), `registeredAt`, `status` (`confirmed|waitlisted|cancelled`), `attendance` (`pending|present|absent`), `notes`.
- **lab_examples**: scratch collection for Database Lab writes/deletes and the replication probe. Real students/events/registrations must never be touched by lab examples.

Block deleting an event that has registrations; explain why in the error. Reject registrations for non-existent students/events.

### Indexes (created at backend startup, report real causes on failure, never drop silently)
- `students`: `{studentId:1}` unique, `{email:1}` unique
- `departments`: `{code:1}` unique, `{name:1}` unique
- `events`: `{status:1, eventDate:1}`, `{category:1}` (plus the hashed `_id` index from init)
- `registrations`: `{studentId:1, eventId:1}` unique (also the shard key), `{eventId:1, status:1}`

---

## 6. Backend requirements

Env (`backend/.env.example`):
```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27020
DB_NAME=campus_events
FRONTEND_ORIGIN=http://localhost:3000
SHARD1_NODES=127.0.0.1:27111,127.0.0.1:27112,127.0.0.1:27113
SHARD2_NODES=127.0.0.1:27121,127.0.0.1:27122,127.0.0.1:27123
CONFIG_NODES=127.0.0.1:27030
```

- One shared `MongoClient` (maxPoolSize 10, `serverSelectionTimeoutMS` 5000), default `writeConcern: { w: "majority" }`, connected once at startup.
- Express JSON, CORS restricted to `FRONTEND_ORIGIN`, central error handler, no stack traces to the browser.
- Response shape: `{ success, data, message }` / `{ success:false, message, details }`.
- Status codes: 200, 201, 204, 400 (invalid input/ObjectId), 404, 409 (`E11000` duplicates), 500.
- Pagination default 10, max 100, NaN-safe parsing. Sort fields from an allowlist. Query objects are built on the server from validated parameters only.

### 6.1 Endpoints
- `GET /api/health`
- Departments: `GET, POST /api/departments`, `PATCH, DELETE /api/departments/:id`
- Students: `GET, POST /api/students`, `GET, PATCH, DELETE /api/students/:id` (filters: `search`, `departmentId`, `year`, `sortBy`, `order`, `page`, `limit`)
- Events: `GET, POST /api/events`, `GET, PATCH, DELETE /api/events/:id` (filters: `search`, `category`, `status`, `minCapacity`, `maxCapacity`, `sortBy`, `order`, `page`, `limit`)
- Registrations: `GET, POST /api/registrations`, `GET, PATCH, DELETE /api/registrations/:id` (filters: `eventId`, `studentId`, `status`, `attendance`, `page`, `limit`); the list is a `$lookup` pipeline
- Analytics: `/api/analytics/{overview, registrations-by-event, registrations-by-department, event-category-summary, status-distribution, capacity-stats, recent-registrations}`
- Database Lab: `GET /api/database-lab/examples`, `POST /api/database-lab/examples/:id/run`, `POST /api/database-lab/reset`
- Cluster (read-only except the lab probe): `GET /api/cluster/overview`, `GET /api/cluster/replication`, `POST /api/cluster/replication/probe`, `GET /api/cluster/sharding`, `GET /api/cluster/sharding/explain/:id`

### 6.2 Database Lab rules
- Examples are defined once in `backend/src/lab/examples.js` as objects `{ id, topic, title, explains, collection, operation, args }`. The same definition is **executed** and **rendered as shell text**, so the displayed command always matches what ran.
- `run` accepts only a known example `id`. No raw shell/JS/filters from the client.
- Write/delete examples operate only on `lab_examples`; read examples may read real collections (limit results to 20 docs). Return `{ shell, result, executionMs, explanation }`.
- Destructive examples: confirmation dialog in the UI, plus `reset` restores known lab seed data.

### 6.3 Cluster service (`cluster.service.js`)
All reads use fixed, allowlisted commands:
- **Replication status:** for each node in `SHARD1_NODES`, `SHARD2_NODES`, `CONFIG_NODES`, open a short-lived `directConnection=true` client (`serverSelectionTimeoutMS` ≈ 1500 ms) and run `replSetGetStatus`. An unreachable node is reported as `DOWN` (this is how failover becomes visible). Return per member: name, state (`PRIMARY/SECONDARY/...`), health, uptime, optime date, and for the set: `term`, election time if available.
- **Oplog evidence:** read the first and last entry of `local.oplog.rs` (`$natural` sort, limit 1) on one reachable member to show the oplog window.
- **Replication probe:** insert one marker doc `{ _labType: "replication-probe", nonce, at }` into `lab_examples` via mongos with `w: "majority"`; then read it from **each member** of the owning shard via direct connections; report found/not-found and elapsed ms per member. The owning shard is `shard1RS` (primary shard); verify by reading `config.databases`. Clean up older probe markers (filter on `_labType` only).
- **Sharding overview (via mongos):** `listShards`; for each sharded collection read `config.collections` (key, unique) and count chunks per shard from `config.chunks` (join on `uuid`); document counts per shard via `$collStats: { count: {} }` (confirm output shape on the installed version).
- **Explain:** `find().explain("queryPlanner")` for the fixed examples `registrations-by-studentId`, `registrations-by-eventId`, `events-by-id`, `events-by-category`; return the winning plan stage (`SINGLE_SHARD` vs `SHARD_MERGE`) and the shard names touched.

Never expose container control (no docker socket). Failover is triggered by the presenter with `docker stop`.

---

## 7. Frontend requirements

Clean admin UI: light neutral background, white cards, one blue/indigo accent, sidebar nav (collapsible on mobile), loading/error/empty states, confirmation dialogs for destructive actions, toast or inline feedback after mutations. No fake KPIs: every number comes from an API call. TypeScript interfaces for all entities; avoid `any`.

| Page | Content |
|---|---|
| `/` Dashboard | Students, events, confirmed registrations, upcoming events (live); recent registrations; registrations-by-event chart |
| `/events` | Table, search, category/status/capacity filters, sort, pagination, create/edit/delete |
| `/students` | Table, search, department/year filters, create/edit/delete; small section to create/edit departments |
| `/registrations` | Joined list (`$lookup`), filters, register student, change status, mark attendance, duplicate prevention message |
| `/analytics` | Charts + "View MongoDB pipeline" expander on every chart (Topics 6 and 7) |
| `/database-lab` | Tabs: **Installation (1)**, **Introduction (2)**, **Create & Read (3)**, **Update & Delete (4)**, **Advanced Queries (5)**, **Aggregation Basics (6)**, **Aggregation Advanced (7)**, **Replication vs Sharding (10)**. Each example shows: what it demonstrates, shell command, "Run example", real output, interpretation. |
| `/cluster` | Tabs: **Replication (8)** and **Sharding (9)**, live data, plus the footnote about the 1-member config server |

The Cluster page must show: a topology diagram (mongos → configRS → shard1RS/shard2RS with member states colored PRIMARY/SECONDARY/DOWN), auto-refresh every 2–3 s, the replication probe button, oplog window, shard distribution bars, chunk counts per shard, the shard keys of sharded collections, and the four explain buttons.

---

## 8. Database Lab example catalog (executable, allowlisted)

| ID | Topic | Operation | Target |
|---|---|---|---|
| `t1-ping` | 1 | `db.runCommand({ ping: 1 })` | admin |
| `t1-build-info` | 1 | `buildInfo` → version | admin |
| `t1-topology` | 1 | `hello` → `msg: "isdbgrid"` proves we are on `mongos` | admin |
| `t1-databases` | 1 | `listDatabases` + `listCollections` of `campus_events` | admin |
| `t2-bson-types` | 2 | Insert one doc with String, `NumberInt`, `NumberLong`, Double, `Decimal128`, Boolean, Date, ObjectId, Array, embedded doc, null; then `$type` of every field (via `$objectToArray`) | `lab_examples` |
| `t2-document-shape` | 2 | Show one real student (embedded array `skills`, ObjectId reference) | `students` |
| `t2-collection-overview` | 2 | Collections and document counts | all |
| `t3-insert-one` / `t3-insert-many` | 3 | `insertOne()`, `insertMany()` | `lab_examples` |
| `t3-find-filter` / `t3-find-one` / `t3-projection` | 3 | `find({category:"Technical"})`, `findOne`, projection `{title:1,category:1,capacity:1,_id:0}` | `events` |
| `t4-update-one` / `t4-update-many` | 4 | `$set` and `$inc` | `lab_examples` |
| `t4-delete-one` / `t4-delete-many` | 4 | `deleteOne()`, `deleteMany()` | `lab_examples` |
| `t5-comparison` | 5 | `$gt`, `$gte`, `$lte`, `$in`, `$ne` | `events` |
| `t5-logical` | 5 | `$and`, `$or` | `events` |
| `t5-sort-limit-skip` | 5 | `sort`, `limit`, `skip` (page 2) | `events` |
| `t6-registrations-per-event` | 6 | `$match` + `$group` + `$sum` | `registrations` |
| `t6-capacity-stats` | 6 | `$group` with `$avg`, `$min`, `$max`, `$sum` | `events` |
| `t6-status-distribution` | 6 | `$group` by status | `registrations` |
| `t7-project` | 7 | `$project` | `events` |
| `t7-unwind-tags` | 7 | `$unwind` on `tags` | `events` |
| `t7-lookup-report` | 7 | `$lookup` → `$unwind` → `$lookup` → `$unwind` → `$project` → `$sort` | `registrations` |
| `t7-department-participation` | 7 | Real-world: registrations → students → group by department → sort | `registrations` |

Topics 8 and 9 are demonstrated on `/cluster` (not as shell-text-only examples). Topic 10 is a comparison table plus live evidence from the cluster. Topic 11 is the whole app.

### Topic 10 comparison table (render in the app)

| Aspect | Replication | Sharding |
|---|---|---|
| Purpose | High availability and redundancy | Horizontal scaling of data and throughput |
| Data | Full copy on every member | Different subsets on different shards |
| Components | Primary, secondaries, oplog | Shards, config servers, `mongos` |
| On failure | Election, automatic failover | Depends on each shard's replica set |
| Scalability | Read scaling in suitable setups | Storage and write scaling when the shard key is good |
| Complexity | Lower | Higher |
| Typical use | Service continuity | Very large datasets/high throughput |

State clearly: they are complementary. **This app uses both** (each shard is a replica set).

---

## 9. Seed script (`npm run seed`)

- Idempotent (upsert on natural keys); prints inserted/updated counts; never deletes existing data by default.
- Base data: 4 departments, 20 students, 10 events (mix of upcoming/ongoing/completed/cancelled, varied categories, capacities and dates, tags arrays), 30–50 registrations with mixed status and attendance.
- `--volume`: adds ~2,000 students, ~200 events and ~20,000 unique registrations, all tagged `seedBatch: "volume"`. Use bulk inserts in batches (`insertMany` with `ordered:false`). Purpose: make shard distribution and chunk splitting visible.
- `--remove-volume`: deletes only documents tagged `seedBatch: "volume"` after printing counts and requiring `--yes`.
- `--reset` is not provided by default.
- Seed must work against the sharded collections (shard-key fields always present).

---

## 10. Validation and reliability
Required fields, email format, int ranges (year 1–4, capacity ≥ 1), valid ObjectIds, enums, valid dates, `E11000` → 409, not-found handling, never trust client validation alone. No raw MongoDB filter from the browser.

---

## 11. DEMO SCRIPT (15–18 minutes)

Also write this (expanded if useful) to `docs/practical-demo-script.md`. Do not claim any step verified unless it was actually executed.

### 11.0 Pre-flight (before the viva)
1. `docker compose -f infrastructure/cluster/compose.yaml up -d` → wait for `CLUSTER READY` in the `cluster-init` logs.
2. `cd backend && npm run seed` (base data only).
3. Start backend and frontend. Open: the app (`localhost:3000`), Compass connected to `mongodb://127.0.0.1:27020`, and a terminal.
4. Confirm `/cluster` shows 2 shards, each with 1 PRIMARY + 2 SECONDARY.

### 11.1 Topic 1 — Installation and configuration (1.5 min)
- **Do:** terminal `docker ps` (8 containers), then `docker exec -it mongos mongosh --quiet --eval "printjson(db.runCommand({ping:1}))"`. Show Compass connected. In the app: Database Lab → Installation → run `t1-ping`, `t1-build-info`, `t1-topology`.
- **Observe:** `ok: 1`; server version; `msg: "isdbgrid"` means we are connected to a `mongos` router, so the app runs on the cluster.
- **Say:** Community Server is the database engine (`mongod`), mongosh is the command-line shell, Compass is the GUI client; the app uses the official driver.
- **Viva:** *mongod vs mongos?* `mongod` stores data; `mongos` routes requests to shards.

### 11.2 Topic 2 — Introduction (1.5 min)
- **Do:** Database Lab → Introduction → `t2-bson-types`, `t2-document-shape`, `t2-collection-overview`.
- **Observe:** each field's BSON type (`string`, `int`, `long`, `double`, `decimal`, `bool`, `date`, `objectId`, `array`, `object`, `null`); a student document with an embedded array and an ObjectId reference.
- **Say:** NoSQL document model, database → collection → document, flexible schema; BSON is MongoDB's binary-encoded format with more types than JSON.
- **Viva:** *BSON vs JSON?* JSON is text; BSON is binary with extra types (Date, ObjectId, Decimal128, Int64).

### 11.3 Topic 3 — CRUD: Create and Read (1.5 min)
- **Do:** Events page → create an event. Lab → Create & Read → `t3-insert-one`, `t3-insert-many`, `t3-find-filter`, `t3-projection`.
- **Observe:** the shell command matches the executed operation; inserted ids; projection hides `_id` and unselected fields.
- **Viva:** *insertOne vs insertMany?* One document vs an array in one call.

### 11.4 Topic 4 — CRUD: Update and Delete (1.5 min)
- **Do:** Edit an event's capacity in the UI. Lab → Update & Delete → `t4-update-one` (`$set`), `t4-update-many` (`$inc`), `t4-delete-one`, `t4-delete-many` (each with a confirmation dialog), then Reset.
- **Observe:** `matchedCount`/`modifiedCount`/`deletedCount`; only `lab_examples` changes.
- **Viva:** *`$set` vs `$inc`?* `$set` assigns a value; `$inc` adds to a number atomically.

### 11.5 Topic 5 — Advanced queries (1.5 min)
- **Do:** Events page: capacity between 50 and 200, category Technical or Workshop, sort by date, go to page 2. Then Lab → `t5-comparison`, `t5-logical`, `t5-sort-limit-skip`.
- **Observe:** UI filters correspond to `$gte/$lte`, `$or`/`$and`, `sort/limit/skip` shown in the shell text.
- **Viva:** *Why not skip large offsets?* `skip` still walks past the skipped documents.

### 11.6 Topic 6 — Aggregation basics (1.5 min)
- **Do:** Analytics → registrations per event chart → "View MongoDB pipeline" (`$match`, `$group`, `$sum`); capacity stats card (`$avg`, `$min`, `$max`); Lab → `t6-*`.
- **Observe:** chart values equal the Lab output.
- **Viva:** *What is a pipeline?* Ordered stages; each stage's output feeds the next.

### 11.7 Topic 7 — Aggregation advanced (1.5 min)
- **Do:** Registrations page (joined list) → Lab → `t7-lookup-report`, `t7-unwind-tags`, `t7-project`, `t7-department-participation`.
- **Observe:** each registration shows student and event names via `$lookup`; `$unwind` produces one row per tag.
- **Viva:** *`$lookup` equals which SQL concept?* A left outer join.

### 11.8 Topic 8 — Replication (3.5 min)
1. **Cluster → Replication.** Show shard1RS: 1 PRIMARY, 2 SECONDARY (note which container is primary, e.g. `s1a`).
2. **Probe:** click "Replication probe". The marker is written via mongos with majority and then read from all 3 members; show all found plus the per-member delay. Show the oplog window entries (the write appears in the oplog).
3. **Failover:** `docker stop <primary container>`. Watch the page: that member turns DOWN, there is a short period with no primary, then a SECONDARY becomes PRIMARY and `term` increases. While this happens, create a registration in the app; it may pause or fail briefly and then succeed on retry (do not promise zero downtime).
4. **Recovery:** `docker start <container>`; it rejoins as SECONDARY and catches up.
- **Say:** replica set = copies of the same data; the primary takes writes; secondaries replicate via the oplog; heartbeats detect failure; a majority (2 of 3) elects a new primary.
- **Viva:** *Why 3 members?* A majority is needed to elect a primary, and 3 tolerate one failure. *What is the oplog?* A capped collection of write operations that secondaries replay.

### 11.9 Topic 9 — Sharding (3.5 min)
1. **Cluster → Sharding.** Show 2 shards and the sharded collections: `registrations` range `{studentId, eventId}` and `events` hashed `{_id}`. Mention `students` is unsharded and why (unique indexes).
2. **Load volume:** `cd backend && npm run seed -- --volume`. Refresh: document counts per shard and chunk counts per shard appear/spread (the balancer may need a short time; show progress rather than promising an exact split).
3. **Targeted vs scatter-gather:** click the four explain buttons. Expect `registrations` by `studentId` → single shard; by `eventId` → merge across shards; `events` by `_id` → single shard; by `category` → merge across shards.
4. **Terminal:** `docker exec -it mongos mongosh --quiet --eval "sh.status()"`.
5. **Optional:** show a manual split and chunk move on `registrations` (split point = a real seeded student `_id`); verify syntax for the installed version first.
- **Say:** shard key decides which shard stores a document; hashed spreads evenly but scatters range queries; range keeps ranges together but a monotonically increasing key can create a hot shard.
- **Viva:** *Why is `students` not sharded?* Its unique indexes on `studentId` and `email` cannot both be enforced across shards. *What do config servers hold?* Cluster metadata: shard key and chunk ranges.

### 11.10 Topic 10 — Replication vs Sharding (1 min)
- **Do:** Lab → Replication vs Sharding table; point to `/cluster`: each shard is itself a replica set.
- **Say:** replication = availability/redundancy; sharding = horizontal scale; production systems use both. Use replication first; add sharding when one machine cannot hold the data or handle the write load.

### 11.11 Topic 11 — The application end to end (2 min)
Create a department → create a student → create an event → register the student → change the registration status → mark attendance → show the dashboard numbers changing → Analytics charts → joined registration report → mention that all of this is served through `mongos` by a sharded, replicated cluster.

### 11.12 Clean-up
`npm run seed -- --remove-volume --yes` (only deletes volume-tagged data). `docker compose ... stop` keeps data; `down -v` deletes it and must only be run deliberately.

---

## 12. Documentation deliverables
- `README.md`: overview, architecture diagram, stack, prerequisites, Fedora + Docker setup (SELinux note), start/stop commands, env vars, seed (including `--volume`), failover instructions, endpoint list, troubleshooting (connection refused, port conflicts, no primary elected, member host resolution, sharding init failure, duplicate key, invalid ObjectId, CORS), known limitations (non-atomic capacity check, 1-member config server, scatter-gather by `eventId`).
- `docs/syllabus-mapping.md`: for each of the 11 topics list page, command, demo procedure, expected observation.
- `docs/practical-demo-script.md`: §11 above.
- Screenshots only if real.

---

## 13. Testing and acceptance

Backend integration tests run against a separate database `campus_events_test` on the same cluster (unsharded), never against `campus_events`:
health; CRUD for events and students; registration create + duplicate rejected (409); invalid ObjectId rejected; filters and pagination; overview aggregation; `$lookup` report; seed run twice produces no duplicates.

Infrastructure verification (record the real command output):
- Each of the three replica sets reports the expected members (`rs.status()`), exactly one PRIMARY per set.
- `sh.status()` shows both shards and both sharded collections with the correct keys.
- After `--volume` seed, document counts exist on both shards.
- Failover demonstrated; stopped member rejoins.
- Unique index on `{studentId, eventId}` still rejects a duplicate registration on the sharded collection.

Final checklist: [ ] Cluster starts and prints `CLUSTER READY` [ ] backend connects through mongos [ ] seed idempotent [ ] Events/Students/Registrations CRUD [ ] every lab example runs and shows real output [ ] analytics from live aggregations [ ] Cluster page shows live replication and sharding [ ] explain shows targeted vs scatter-gather [ ] README + syllabus mapping + demo script complete [ ] no fake results [ ] no secrets committed [ ] nothing out of scope added.

---

## 14. Implementation phases (small and verified; summarize files, commands, results, known issues after each)

0. **Inspect:** read the repo, find the current standalone container, existing labs, `/sharded-data` page, `events_by_date`, `registrations_by_student`, and installed versions. Report what will be migrated or removed. Do not start or replace the user's database automatically.
1. **Cluster:** compose, init script, verification (`rs.status()`, `sh.status()`).
2. **Connect + seed:** point the backend to mongos, indexes, base seed, volume seed.
3. **CRUD APIs** (events, students, departments, registrations) with tests.
4. **Queries and aggregation:** filters, pagination, analytics, `$lookup` report.
5. **Database Lab + Cluster service/endpoints.**
6. **Frontend pages** (including Cluster page); remove the old separate lab pages.
7. **Docs and demo script;** rehearse §11 end to end including failover.
8. **Final quality gate:** tests, lint/build, checklist, and a completion report listing **verified vs unverified** items.

---

## 15. Safety rules
1. Never delete the user's existing MongoDB containers, databases or Docker volumes without explicit approval; explain any destructive command first.
2. Do not overwrite existing `.env` files; only create `.env.example`.
3. All published ports bind to `127.0.0.1`.
4. No arbitrary command execution over HTTP; no Docker control from the app.
5. Never fabricate screenshots, terminal output, metrics, or cluster status. If something was not run, say so.
6. Do not add anything outside the 11 syllabus topics (see §0).
