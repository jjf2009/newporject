# AGENT.md --- Campus Event Management System

> **Purpose:** This file is the implementation contract for Codex and
> any developer working on this repository. Read it completely before
> making changes. Build a small, reliable, demonstrable MongoDB teaching
> application---not a production-scale event platform.

------------------------------------------------------------------------

## 1. Project mission

Build a complete **Campus Event Management System** that demonstrates
every MongoDB topic in the supplied syllabus:

1.  MongoDB installation and configuration
2.  Introduction to MongoDB: NoSQL, architecture, databases,
    collections, documents, BSON and data types
3.  CRUD --- Create and Read
4.  CRUD --- Update and Delete
5.  Advanced queries: comparison operators, logical operators, sorting,
    limiting and skipping
6.  Aggregation basics: `$match`, `$group`, `$sum`, `$avg`, `$min`,
    `$max`
7.  Advanced aggregation: `$project`, `$sort`, `$unwind`, `$lookup`,
    real-world applications
8.  Replication: replica-set architecture, primary, secondary, oplog,
    election and automatic failover
9.  Sharding: sharded-cluster architecture, shard key, range-based and
    hashed sharding
10. Replication vs. sharding: comparison, scalability, high availability
    and use cases
11. A complete application using the above features

The application must be genuinely connected to MongoDB. A UI that merely
displays hard-coded examples does **not** satisfy the requirements. Each
demonstrated database operation must either execute against the local
MongoDB instance or clearly be identified as an explanatory
architecture/demo page.

### Product objective

A student should be able to: - use the application as a simple campus
event portal; - perform CRUD actions through the UI; - inspect the
corresponding MongoDB operation and its real result; - understand how
query and aggregation stages work; - demonstrate replication and
sharding using separate local infrastructure scripts; - explain what
each feature does during a college practical/viva.

### Scope discipline

Keep the app small and easy to run. Do not add authentication, payments,
email, cloud hosting, complex role systems, or unrelated features unless
explicitly requested. Do not over-engineer the code.

------------------------------------------------------------------------

## 2. Fixed technology decisions

Use the following stack unless the repository already has a compatible
implementation:

  -----------------------------------------------------------------------
  Layer                               Required choice
  ----------------------------------- -----------------------------------
  Frontend                            Next.js App Router + TypeScript

  Styling                             Tailwind CSS

  Backend                             Node.js + Express.js

  Database                            MongoDB Community Server

  MongoDB access                      Official `mongodb` Node.js driver

  Charts                              Recharts

  Validation                          Zod (or a small consistent
                                      validation utility)

  HTTP client                         Native `fetch` from the frontend

  Local container runtime             Docker Engine with Docker Compose V2

  Package managers                    pnpm for frontend; npm for backend
  -----------------------------------------------------------------------

### Non-negotiable decisions

-   Use the **official MongoDB Node.js driver**.
-   Do **not** use Mongoose or another ODM.
-   Use MongoDB operators and aggregation pipelines directly.
-   Do not connect the browser directly to MongoDB. Only the Express
    backend may access the database.
-   Do not commit `.env`, secrets, local database files, or generated
    data dumps.
-   Do not expose MongoDB on a public network. Bind local development to
    `127.0.0.1`.
-   Use a standalone MongoDB server for normal app development.
-   Replication and sharding must use separate, explicitly started lab
    configurations. Do not silently turn the normal development database
    into a cluster.
-   Do not fake successful replication or sharding. If a lab cluster is
    not running, show clear setup instructions and its current
    unavailable status.

------------------------------------------------------------------------

## 3. Expected repository layout

Create or adapt the repository to this structure. Keep names consistent
and avoid unnecessary abstraction.

``` text
campus-event-management/
├── AGENT.md
├── README.md
├── .gitignore
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── registrations/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── database-lab/page.tsx
│   │   ├── components/
│   │   │   ├── app-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── loading-state.tsx
│   │   │   └── code-example.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       ├── types.ts
│   │       └── format.ts
│   ├── .env.local.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/error-handler.js
│   │   ├── middleware/not-found.js
│   │   ├── routes/
│   │   │   ├── health.js
│   │   │   ├── events.js
│   │   │   ├── students.js
│   │   │   ├── registrations.js
│   │   │   ├── analytics.js
│   │   │   └── database-lab.js
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── seed/seed.js
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── infrastructure/
│   ├── standalone/
│   │   └── README.md
│   ├── replication/
│   │   ├── compose.yaml
│   │   ├── initiate-replica-set.js
│   │   └── README.md
│   └── sharding/
│       ├── compose.yaml
│       ├── enable-sharding.js
│       └── README.md
└── docs/
    ├── syllabus-mapping.md
    ├── practical-demo-script.md
    ├── mongodb-concepts.md
    └── troubleshooting.md
```

The exact layout can be adjusted if the existing project has a sound
structure. Do not create empty files just to match this tree.

------------------------------------------------------------------------

## 4. Domain model and collections

Use database name:

``` text
campus_events
```

Create four collections:

-   `students`
-   `events`
-   `registrations`
-   `departments`

Use MongoDB `ObjectId` values for `_id`. References should be stored as
`ObjectId`, not arbitrary strings, so `$lookup` can demonstrate proper
joins.

### 4.1 Students

Example document:

``` javascript
{
  _id: ObjectId("..."),
  studentId: "GEC2026-001",
  name: "Aarav Naik",
  email: "aarav@example.com",
  departmentId: ObjectId("..."),
  departmentName: "Computer Engineering",
  year: 3,
  phone: "9000000001",
  skills: ["JavaScript", "Python"],
  createdAt: new Date(),
  updatedAt: new Date()
}
```

Rules: - `studentId` must be unique. - `email` must be unique. - `year`
must be an integer from 1 to 4. - `skills` must be an array of
strings. - `departmentId` references a document in `departments`.

### 4.2 Departments

``` javascript
{
  _id: ObjectId("..."),
  name: "Computer Engineering",
  code: "CE",
  coordinator: "Prof. Example",
  createdAt: new Date()
}
```

Rules: - `code` must be unique. - `name` must be unique.

### 4.3 Events

``` javascript
{
  _id: ObjectId("..."),
  title: "Campus Hackathon 2026",
  description: "A 24-hour student hackathon.",
  category: "Technical",
  venue: "Main Auditorium",
  eventDate: new Date("2026-12-10T09:00:00.000Z"),
  registrationDeadline: new Date("2026-12-05T18:30:00.000Z"),
  capacity: 100,
  status: "upcoming",
  tags: ["coding", "innovation"],
  organizer: "GEC Coders Club",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

Allowed categories: `Technical`, `Cultural`, `Sports`, `Workshop`,
`Seminar`, `Other`.

Allowed statuses: `upcoming`, `ongoing`, `completed`, `cancelled`.

Rules: - `capacity` must be a positive integer. - `eventDate` must be a
valid date. - `registrationDeadline` must be a valid date. - `title` is
required. - Do not allow an event to be deleted if registrations exist
unless the user confirms a cascade-delete action. Prefer blocking
deletion and explaining why.

### 4.4 Registrations

``` javascript
{
  _id: ObjectId("..."),
  studentId: ObjectId("..."),
  eventId: ObjectId("..."),
  registeredAt: new Date(),
  status: "confirmed",
  attendance: "pending",
  notes: ""
}
```

Allowed registration statuses: `confirmed`, `waitlisted`, `cancelled`.

Allowed attendance values: `pending`, `present`, `absent`.

Rules: - A student may register only once for a given event. - Enforce
uniqueness with a compound unique index on
`{ studentId: 1, eventId: 1 }`. - Check event capacity before confirming
a registration. - When capacity is reached, either reject the
registration with a clear message or create a `waitlisted` registration.
Implement one consistent policy and document it. - Validate that the
referenced student and event exist.

------------------------------------------------------------------------

## 5. MongoDB connection and indexes

### 5.1 Environment variables

Backend `.env.example`:

``` dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=campus_events
FRONTEND_ORIGIN=http://localhost:3000
```

Frontend `.env.local.example`:

``` dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Never put the MongoDB URI in a `NEXT_PUBLIC_` variable.

### 5.2 Connection module

Use one shared `MongoClient`, connect once at server startup, and reuse
the same database handle.

``` javascript
// backend/src/config/db.js
const { MongoClient } = require("mongodb");

let client;
let database;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "campus_events";

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment");
  }

  client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  database = client.db(dbName);

  await createIndexes();

  console.log(`Connected to MongoDB database: ${dbName}`);
  return database;
}

function getDB() {
  if (!database) {
    throw new Error("MongoDB has not been connected");
  }
  return database;
}

async function createIndexes() {
  const db = database;

  await db.collection("students").createIndex(
    { studentId: 1 },
    { unique: true }
  );
  await db.collection("students").createIndex(
    { email: 1 },
    { unique: true }
  );
  await db.collection("departments").createIndex(
    { code: 1 },
    { unique: true }
  );
  await db.collection("events").createIndex({ status: 1, eventDate: 1 });
  await db.collection("events").createIndex({ category: 1 });
  await db.collection("registrations").createIndex(
    { studentId: 1, eventId: 1 },
    { unique: true }
  );
  await db.collection("registrations").createIndex({ eventId: 1, status: 1 });
}

async function closeDB() {
  if (client) await client.close();
}

module.exports = { connectDB, getDB, closeDB };
```

If index creation fails because seed data contains duplicates, report
the actual cause. Do not silently drop collections or indexes.

------------------------------------------------------------------------

## 6. Backend implementation requirements

Use Express JSON middleware, CORS restricted to the configured frontend
origin, request validation, centralized error handling and a health
route.

Suggested package dependencies:

``` bash
npm install express mongodb cors dotenv zod
npm install -D nodemon
```

Suggested backend scripts:

``` json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seed.js"
  }
}
```

### 6.1 Server bootstrap

``` javascript
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./config/db");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, service: "campus-event-api" });
});

// Mount routers here:
// app.use("/api/events", eventRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/registrations", registrationRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/database-lab", databaseLabRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

async function start() {
  await connectDB();

  const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`API listening on port ${process.env.PORT || 5000}`);
  });

  async function shutdown() {
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
```

Codex must complete the route imports and mounts; this snippet is a
bootstrap pattern, not a complete server by itself.

### 6.2 API response convention

Use a consistent JSON response:

``` javascript
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

For errors:

``` javascript
{
  "success": false,
  "message": "Event not found",
  "details": null
}
```

Do not leak stack traces or secrets to the browser.

### 6.3 Required REST endpoints

#### Health

-   `GET /api/health`

#### Events

-   `GET /api/events`
-   `GET /api/events/:id`
-   `POST /api/events`
-   `PATCH /api/events/:id`
-   `DELETE /api/events/:id`

Query parameters for `GET /api/events`: - `search` - `category` -
`status` - `sortBy` - `order` - `page` - `limit` - `minCapacity` -
`maxCapacity`

Use a safe allowlist for sortable fields. Never pass an arbitrary
client-provided object directly into a MongoDB query.

#### Students

-   `GET /api/students`
-   `GET /api/students/:id`
-   `POST /api/students`
-   `PATCH /api/students/:id`
-   `DELETE /api/students/:id`

Query parameters: - `search` - `departmentId` - `year` - `sortBy` -
`order` - `page` - `limit`

#### Registrations

-   `GET /api/registrations`
-   `GET /api/registrations/:id`
-   `POST /api/registrations`
-   `PATCH /api/registrations/:id`
-   `DELETE /api/registrations/:id`

Query parameters: - `eventId` - `studentId` - `status` - `attendance` -
`page` - `limit`

#### Analytics

-   `GET /api/analytics/overview`
-   `GET /api/analytics/registrations-by-event`
-   `GET /api/analytics/registrations-by-department`
-   `GET /api/analytics/event-category-summary`
-   `GET /api/analytics/recent-registrations`

#### Database lab

-   `GET /api/database-lab/overview`
-   `GET /api/database-lab/query-examples`
-   `GET /api/database-lab/replication-status`
-   `GET /api/database-lab/sharding-status`

Do not build a general endpoint that accepts arbitrary MongoDB commands
from the browser. Provide named, allowlisted examples only.

------------------------------------------------------------------------

## 7. Required MongoDB practical demonstrations

The Database Lab must include a concept, the MongoDB command, a short
explanation, and a real result where execution is supported.

### Topic 1 --- Installation and configuration

Documentation must explain: - MongoDB Community Server is the database
server. - `mongosh` is the interactive shell. - MongoDB Compass is the
graphical client. - The application connects to
`mongodb://127.0.0.1:27017`. - The database used is `campus_events`.

Useful commands:

``` bash
mongosh "mongodb://127.0.0.1:27017"
```

``` javascript
db.runCommand({ ping: 1 });
show dbs;
use campus_events;
show collections;
```

For Docker Engine setup, document Docker commands and reuse the existing
`mongodb` container when it is already running. Do not create another
container on host port `27017`:

``` bash
docker --version
docker compose version
docker ps
docker exec mongodb mongosh --quiet --eval 'printjson(db.runCommand({ping:1}))'
```

Do not assume `mongosh` is installed on the host when it is only
available inside the container. The `docker exec` command above opens
the shell inside the container.

### Topic 2 --- Introduction to MongoDB

Provide concise explanations and examples for: - NoSQL document
database - MongoDB database - Collection - Document - BSON - `_id` -
embedded documents and arrays - flexible document schema - common BSON
types: string, int, long, double, decimal, boolean, date, ObjectId,
array, object, null

Example:

``` javascript
db.students.insertOne({
  studentId: "GEC2026-001",
  name: "Aarav Naik",
  year: NumberInt(3),
  active: true,
  fees: NumberDecimal("1250.50"),
  joinedAt: new Date(),
  skills: ["Go", "JavaScript"],
  address: {
    city: "Ponda",
    state: "Goa"
  },
  middleName: null
});
```

Explain that JSON is a text representation and BSON is MongoDB's
binary-encoded document format. Do not claim BSON and JSON are
identical.

### Topic 3 --- CRUD: Create and Read

Include actual operations:

``` javascript
db.events.insertOne({
  title: "Go Workshop",
  category: "Workshop",
  venue: "Seminar Hall",
  capacity: 60,
  status: "upcoming",
  eventDate: new Date("2026-12-10")
});
```

``` javascript
db.events.insertMany([
  {
    title: "Coding Contest",
    category: "Technical",
    capacity: 100,
    status: "upcoming"
  },
  {
    title: "Cultural Night",
    category: "Cultural",
    capacity: 300,
    status: "upcoming"
  }
]);
```

``` javascript
db.events.find();
db.events.find({ category: "Technical" });
db.events.findOne({ title: "Go Workshop" });
```

Also demonstrate projection:

``` javascript
db.events.find(
  { status: "upcoming" },
  { title: 1, category: 1, capacity: 1, _id: 0 }
);
```

The application must support creating events and reading event
lists/details. The Database Lab should show the exact native operation.

### Topic 4 --- CRUD: Update and Delete

``` javascript
db.events.updateOne(
  { title: "Go Workshop" },
  { $set: { venue: "Computer Lab 1" } }
);
```

``` javascript
db.events.updateMany(
  { category: "Technical" },
  { $inc: { capacity: 10 } }
);
```

``` javascript
db.events.updateOne(
  { title: "Go Workshop" },
  { $set: { status: "completed" }, $currentDate: { updatedAt: true } }
);
```

``` javascript
db.events.deleteOne({ title: "Go Workshop" });
db.events.deleteMany({ status: "cancelled" });
```

Explain: - `$set` changes specified fields. - `$inc` increments a
numeric field. - `$currentDate` writes the current date. - `updateOne`
affects one matching document. - `updateMany` affects all matching
documents. - `deleteOne` removes one match. - `deleteMany` removes all
matches.

Use a confirmation dialog before destructive UI actions. Do not expose a
bulk-delete action without a clear confirmation.

### Topic 5 --- Advanced queries

Demonstrate comparison operators:

``` javascript
db.events.find({ capacity: { $gt: 100 } });
db.events.find({ capacity: { $gte: 50, $lte: 200 } });
db.events.find({ category: { $in: ["Technical", "Workshop"] } });
db.events.find({ status: { $ne: "cancelled" } });
```

Demonstrate logical operators:

``` javascript
db.events.find({
  $and: [
    { capacity: { $gte: 50 } },
    { status: "upcoming" }
  ]
});
```

``` javascript
db.events.find({
  $or: [
    { category: "Technical" },
    { category: "Workshop" }
  ]
});
```

Demonstrate sorting, limiting and skipping:

``` javascript
db.events.find().sort({ eventDate: 1 });
db.events.find().limit(5);
db.events.find().skip(5).limit(5);
```

Explain: - `$gt`: greater than - `$gte`: greater than or equal - `$lt`:
less than - `$lte`: less than or equal - `$in`: matches any value in an
array - `$ne`: not equal - `$and`: all conditions must match - `$or`: at
least one condition must match - `sort`: orders results - `limit`: caps
result count - `skip`: skips a number of results

The events/students list pages must implement useful search, filtering,
sorting and pagination. The Database Lab must show the native query used
for each example.

### Topic 6 --- Aggregation basics

Build real analytics from the collections.

Total registrations per event:

``` javascript
db.registrations.aggregate([
  { $match: { status: "confirmed" } },
  {
    $group: {
      _id: "$eventId",
      totalRegistrations: { $sum: 1 }
    }
  }
]);
```

Average event capacity:

``` javascript
db.events.aggregate([
  {
    $group: {
      _id: null,
      averageCapacity: { $avg: "$capacity" },
      minimumCapacity: { $min: "$capacity" },
      maximumCapacity: { $max: "$capacity" },
      totalCapacity: { $sum: "$capacity" }
    }
  }
]);
```

Registrations by status:

``` javascript
db.registrations.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]);
```

Explain: - `aggregate()` processes documents through ordered stages. -
`$match` filters documents. - `$group` groups documents by a key. -
`$sum` adds values or counts records. - `$avg` calculates average. -
`$min` finds minimum. - `$max` finds maximum.

Display at least two of these analytics as charts and show the pipeline
in the lab.

### Topic 7 --- Advanced aggregation

Use `$lookup` to join registrations with students and events:

``` javascript
db.registrations.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "_id",
      as: "event"
    }
  },
  { $unwind: "$event" },
  {
    $project: {
      _id: 1,
      registeredAt: 1,
      status: 1,
      studentName: "$student.name",
      studentDepartment: "$student.departmentName",
      eventTitle: "$event.title",
      eventCategory: "$event.category"
    }
  },
  { $sort: { registeredAt: -1 } }
]);
```

Demonstrate `$project` independently:

``` javascript
db.events.aggregate([
  {
    $project: {
      title: 1,
      category: 1,
      capacity: 1,
      _id: 0
    }
  }
]);
```

Demonstrate `$unwind` with an array:

``` javascript
db.events.aggregate([
  { $unwind: "$tags" },
  {
    $project: {
      title: 1,
      tag: "$tags"
    }
  }
]);
```

Explain: - `$project`: selects, excludes, renames or computes output
fields. - `$sort`: orders pipeline results. - `$unwind`: emits a
document for each array element. - `$lookup`: performs a left outer join
with another collection. - Stage order matters.

The joined registration report in the application should use a real
`$lookup` pipeline.

### Topic 8 --- Replication

Replication must be a real three-member replica set, not a visual
simulation.

Explain: - replica set - primary - secondary - replication - oplog -
heartbeat - election - automatic failover - read/write behavior

Provide a separate lab configuration using three MongoDB instances on
separate local ports. Use a replica set name such as `campusRS`.

Example Compose concept (Codex must produce a complete working file and
test it):

``` yaml
services:
  mongo1:
    image: mongodb/mongodb-community-server:8.0
    container_name: campus-mongo1
    command: ["mongod", "--replSet", "campusRS", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27017:27017"
    volumes:
      - mongo1_data:/data/db

  mongo2:
    image: mongodb/mongodb-community-server:8.0
    container_name: campus-mongo2
    command: ["mongod", "--replSet", "campusRS", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27018:27017"
    volumes:
      - mongo2_data:/data/db

  mongo3:
    image: mongodb/mongodb-community-server:8.0
    container_name: campus-mongo3
    command: ["mongod", "--replSet", "campusRS", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27019:27017"
    volumes:
      - mongo3_data:/data/db

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
```

Important: this is an initial configuration sketch. Codex must verify
member hostnames are resolvable from inside the container network, add a
named network, and initialize the replica set with container DNS names
such as `mongo1:27017`, `mongo2:27017`, and `mongo3:27017`. Do not
initialize a replica set with `localhost` addresses that other members
cannot reach.

Initiation example, executed from a shell connected to the first member:

``` javascript
rs.initiate({
  _id: "campusRS",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
```

Verification:

``` javascript
rs.status();
rs.conf();
db.getSiblingDB("local").oplog.rs.find().limit(5);
```

Demonstration procedure: 1. Start the replica-set containers. 2.
Initialize the replica set once. 3. Wait until one node is PRIMARY and
two are SECONDARY. 4. Insert a test document through the primary. 5.
Read it from a secondary using an explicitly configured secondary read
preference, explaining that secondary reads may lag. 6. Stop the primary
container. 7. Wait for a new primary election. 8. Show `rs.status()` and
explain automatic failover. 9. Restart the stopped node and show it
rejoins as a secondary.

Do not promise zero downtime or instantaneous failover. Explain that
elections take time and writes can briefly be unavailable.

**Port conflict warning:** The normal standalone development database
may already use port 27017. Do not run the standalone server and
replica-set lab on the same host port simultaneously. Use a configurable
separate port mapping for the replica-set primary (for example host
ports 27117, 27118 and 27119), or stop the standalone service before
starting the replica-set lab. Document the chosen mapping.

### Topic 9 --- Sharding

Sharding must be a genuine local sharded cluster. A diagram alone is
educational but does not prove sharding is working.

Explain: - shard - config server replica set - `mongos` query router -
shard key - chunk - balancing - range-based sharding - hashed sharding -
horizontal scaling

Provide a separate Compose file with: - a config-server replica set
(production guidance normally recommends three config servers); - at
least two shards, each configured as a replica set where practical; - a
`mongos` router; - a private container network; - persistent volumes; -
non-conflicting host ports.

The lab may use a compact local educational configuration, but clearly
label any simplification. Codex must create a tested startup and
initialization procedure. Do not provide a Compose file that starts
`mongod` instances without the required config-server/shard roles and
then call it sharding.

Typical shell commands after the cluster is correctly initialized:

``` javascript
sh.status();

sh.addShard("shard1RS/shard1a:27017,shard1b:27017,shard1c:27017");
sh.addShard("shard2RS/shard2a:27017,shard2b:27017,shard2c:27017");

sh.enableSharding("campus_events");

sh.shardCollection(
  "campus_events.registrations",
  { studentId: "hashed" }
);

sh.status();
```

The actual hostnames and replica-set topology must match the Compose
configuration Codex builds. Do not copy these placeholder hostnames
blindly.

Demonstrate a range-based shard key in a separate collection or isolated
resettable lab:

``` javascript
sh.shardCollection(
  "campus_events.events_by_date",
  { eventDate: 1 }
);
```

Demonstrate a hashed shard key:

``` javascript
sh.shardCollection(
  "campus_events.registrations_by_student",
  { studentId: "hashed" }
);
```

Do not attempt to shard an existing collection with incompatible indexes
or data assumptions without checking MongoDB's constraints. Use
dedicated lab collections and document reset requirements.

Show: - `sh.status()` - `sh.listShards()` -
`db.collection.getShardVersion()` only if appropriate for the chosen
server version and supported workflow - explain how shard-key selection
affects distribution and query targeting.

Important: the sample sharding commands are teaching examples. Codex
must validate the chosen MongoDB version and cluster topology, and must
not claim that sharding is enabled unless the command succeeds and
`sh.status()` confirms it.

### Topic 10 --- Replication vs sharding

Create a comparison page/table:

  -----------------------------------------------------------------------
  Aspect                  Replication             Sharding
  ----------------------- ----------------------- -----------------------
  Main purpose            High availability and   Horizontal data
                          redundancy              distribution and
                                                  scaling

  Data                    Copies of the same      Different portions of
                          dataset across members  data across shards

  Main components         Primary and secondary   Shards, config servers
                          members                 and mongos

  Availability            Supports failover       Depends on
                                                  shard/replica-set
                                                  topology

  Scaling benefit         Read scaling in         Storage and write/read
                          suitable                distribution when well
                          configurations;         designed
                          redundancy              

  Complexity              Lower                   Higher

  Typical use             Service continuity      Large datasets and high
                                                  throughput
  -----------------------------------------------------------------------

Clarify that sharded clusters commonly use replica sets for each shard
and for config servers. Replication and sharding are complementary, not
mutually exclusive alternatives.

### Topic 11 --- Complete application

Demonstrate this end-to-end flow: 1. Admin creates a department. 2.
Admin creates students. 3. Admin creates an event. 4. Student is
registered for the event. 5. Admin updates the registration status. 6.
Admin marks attendance. 7. Dashboard metrics update. 8. Analytics show
registrations by event and department. 9. Joined registration report
shows student and event details. 10. Database Lab displays the native
MongoDB commands and results.

------------------------------------------------------------------------

## 8. Frontend UX requirements

Build a clean, modern, responsive admin interface. It should look like a
polished college project, not a raw default Next.js template.

### Visual direction

-   Light neutral background.
-   White cards and subtle borders.
-   Dark, readable text.
-   One restrained accent color (blue or indigo).
-   Consistent spacing and typography.
-   Sidebar navigation on desktop.
-   Collapsible/mobile navigation on small screens.
-   Clear active navigation state.
-   Tables with readable columns and responsive overflow.
-   Accessible form labels and keyboard focus states.
-   Loading, error, empty and success states.
-   Confirmation dialogs for destructive operations.
-   Toast or inline feedback after mutations.

Avoid excessive gradients, oversized decorative graphics, unnecessary
animations, and fake metrics.

### Required pages

#### A. Dashboard `/`

Display live values from backend: - number of students; - number of
events; - number of confirmed registrations; - number of upcoming
events; - recent registrations; - registrations by event chart; - event
categories chart or summary.

Every value must come from an API request. Do not hard-code sample KPIs.

#### B. Events `/events`

Features: - event table; - search; - category filter; - status filter; -
sort; - pagination; - create event modal/page; - edit event; - delete
event with confirmation; - capacity and date display.

#### C. Students `/students`

Features: - student table; - search by name, email or student ID; -
filter by department; - filter by year; - create/edit/delete; - display
department and year.

#### D. Registrations `/registrations`

Features: - list registrations; - filter by event, student, status and
attendance; - register a student for an event; - update registration
status; - mark attendance; - show student and event names; - prevent
duplicate registrations.

The joined list should be backed by a `$lookup` aggregation pipeline.

#### E. Analytics `/analytics`

Show real data for: - registration count per event; - registrations by
department; - registrations by event category; - status distribution; -
average/minimum/maximum event capacity; - recent registration trend if
the seed data supports it.

Show the aggregation pipeline in an expandable "View MongoDB pipeline"
area.

#### F. Database Lab `/database-lab`

Use tabs or sections: 1. MongoDB introduction 2. Create and Read 3.
Update and Delete 4. Advanced queries 5. Aggregation basics 6. Advanced
aggregation 7. Replication 8. Sharding 9. Replication vs sharding

For each example: - topic title; - what it demonstrates; - MongoDB shell
code; - expected interpretation; - actual output from the database if
executable; - "Run example" action only for safe, allowlisted examples.

Do not implement an arbitrary command runner. Do not accept raw
user-supplied JavaScript or MongoDB shell text and execute it on the
server. Use predefined server-side operations identified by a fixed
example ID.

For destructive examples, use a dedicated lab collection such as
`lab_examples` and resettable seed records. Never let a demo delete real
student or event data.

Replication/sharding sections must show actual cluster status when
reachable. Otherwise show a clear "Lab cluster not running" state and
exact setup instructions.

------------------------------------------------------------------------

## 9. Seed data requirements

Create an idempotent seed script.

It should: - create departments, students, events and registrations; -
insert enough realistic data to make filters and charts meaningful; -
use deterministic relationships; - use a fixed set of known seed
identifiers or upsert logic; - avoid creating duplicates each time it
runs; - create indexes; - print a summary of inserted/updated counts.

Suggested data volume: - 4 departments; - 20 students; - 10 events; -
30--50 registrations.

Include varied: - departments; - years; - event categories; - event
statuses; - capacities; - registration statuses; - attendance values; -
dates.

Do not make every record identical. Include a mix of upcoming, ongoing,
completed and cancelled events.

Suggested departments: - Computer Engineering - Information Technology -
Electronics and Telecommunication - Mechanical Engineering

Suggested event categories: - Technical - Cultural - Sports - Workshop -
Seminar

A seed script should not delete a user's existing data by default. If a
destructive reset option is provided, require an explicit CLI flag such
as `--reset` and print exactly what will be deleted.

------------------------------------------------------------------------

## 10. Frontend API client

Use one API helper instead of repeating URL construction and error
handling in every component.

``` typescript
// frontend/src/lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    cache: "no-store"
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return body as T;
}
```

Create TypeScript interfaces for Student, Department, Event,
Registration, pagination and API responses. Avoid `any` unless there is
a documented reason.

Use client components only where interaction/state is needed. Prefer
server components for static page structure. Ensure the browser only
calls the Express API and never imports the MongoDB driver.

------------------------------------------------------------------------

## 11. Validation and reliability

Implement: - required-field validation; - email format validation; -
integer range validation for year and capacity; - valid MongoDB ObjectId
validation; - valid enum values; - date validation; - duplicate key
error handling (`E11000`); - not-found handling; - consistent HTTP
status codes; - pagination limits; - safe sort-field allowlists; - clear
frontend error feedback.

Suggested status codes: - `200` successful read/update; - `201`
created; - `204` deleted if no response body is returned; - `400`
invalid request; - `404` missing resource; - `409` duplicate or
conflicting registration; - `500` unexpected server error.

Do not trust client-side validation alone.

Never accept a raw MongoDB filter from the frontend. Construct query
objects on the backend from validated, allowlisted parameters.

For pagination, default to 10 records and cap the limit (for example,
100). Calculate:

``` javascript
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
const skip = (page - 1) * limit;
```

Validate numeric values carefully; `Number("abc")` becomes `NaN`.

------------------------------------------------------------------------

## 12. Documentation deliverables

Create a complete `README.md` containing: - project overview; - feature
list; - architecture; - technology stack; - prerequisites; - Fedora
setup; - Docker Engine and Docker Compose setup; - MongoDB connection; - frontend setup; - backend
setup; - environment variables; - seed instructions; - startup
commands; - replication lab instructions; - sharding lab instructions; -
troubleshooting; - API endpoint list; - screenshots section (use real
screenshots only; do not invent them).

Create `docs/syllabus-mapping.md` mapping each of the 11 syllabus items
to: - application page; - MongoDB command; - demonstration procedure; -
expected observation.

Create `docs/practical-demo-script.md` with a 10--15 minute
demonstration flow and short viva explanations.

Create `docs/mongodb-concepts.md` with clear definitions of NoSQL, BSON,
document, collection, CRUD, operators, aggregation, replication,
sharding and shard key.

Create `docs/troubleshooting.md` for: - MongoDB connection refused; -
port 27017 already in use; - Docker container stopped; - Compass cannot
connect; - duplicate key errors; - invalid ObjectId; - replica-set
member host resolution; - no primary elected; - sharding initialization
failure; - frontend CORS errors.

------------------------------------------------------------------------

## 13. Testing and acceptance criteria

Do not declare the project complete merely because it compiles.

### Backend tests

At minimum, verify: - health endpoint; - create/read/update/delete
event; - create/read/update/delete student; - create registration; -
duplicate registration rejected; - invalid ObjectId rejected; - event
filters; - student filters; - pagination; - aggregation overview; -
`$lookup` joined registration results; - seed script can be run twice
without duplicates.

Use integration tests against a local test database where feasible. Do
not run tests against a user's actual database without explicit
permission.

### Frontend verification

Verify: - every navigation link works; - all lists load from the
backend; - forms validate; - create/edit/delete work; - filters and
pagination work; - analytics render from real API responses; - Database
Lab examples show correct commands; - loading, error and empty states
are present; - layout works on desktop and mobile.

### Infrastructure verification

For replication: - three members visible in `rs.status()`; - one PRIMARY
and two SECONDARY under normal conditions; - data replication
verified; - failover demonstrated after primary shutdown; - restarted
member rejoins.

For sharding: - `sh.status()` reports the intended shards; - shard
collection command succeeds; - shard key is visible; - data distribution
can be inspected using supported commands for the MongoDB version; -
documentation distinguishes actual cluster evidence from conceptual
explanation.

### Final acceptance checklist

-   [ ] Frontend starts.
-   [ ] Backend starts.
-   [ ] Backend connects to local MongoDB.
-   [ ] Seed script is idempotent.
-   [ ] All four collections contain useful data.
-   [ ] Events CRUD works.
-   [ ] Students CRUD works.
-   [ ] Registrations CRUD works.
-   [ ] Advanced query examples work.
-   [ ] Aggregation basics work.
-   [ ] `$lookup` and `$unwind` work.
-   [ ] Dashboard uses live data.
-   [ ] Analytics use live aggregation results.
-   [ ] Database Lab displays commands and results.
-   [ ] Replication lab has tested setup instructions.
-   [ ] Sharding lab has tested setup instructions.
-   [ ] Replication vs sharding comparison is accurate.
-   [ ] README and practical guide are complete.
-   [ ] No fake database results.
-   [ ] No secrets committed.
-   [ ] No unexplained runtime errors.

------------------------------------------------------------------------

## 14. Implementation sequence for Codex

Work in small, verifiable phases. Do not generate the entire codebase in
one untested pass.

### Phase 0 --- Inspect the workspace

1.  Inspect the current repository and installed versions.
2.  Read this `AGENT.md`.
3.  Preserve existing useful files.
4.  Identify whether MongoDB is reachable at `127.0.0.1:27017`.
5.  Do not start or replace the user's database container automatically.
6.  Report missing prerequisites before proceeding.

### Phase 1 --- Project foundation

1.  Set up frontend and backend.
2.  Add environment examples and `.gitignore`.
3.  Implement MongoDB connection and server bootstrap.
4.  Add health endpoint.
5.  Verify database connectivity.
6.  Run frontend and backend.

### Phase 2 --- Database and seed data

1.  Implement collections and indexes.
2.  Implement validation utilities.
3.  Write idempotent seed script.
4.  Seed sample data.
5.  Verify records in mongosh/Compass.

### Phase 3 --- CRUD APIs

1.  Events routes/controllers.
2.  Students routes/controllers.
3.  Registrations routes/controllers.
4.  Validate all endpoints.
5.  Test duplicate and invalid input behavior.

### Phase 4 --- Queries and aggregation

1.  Advanced filters and pagination.
2.  Aggregation basics.
3.  `$lookup`, `$unwind`, `$project`, `$sort`.
4.  Analytics endpoints.
5.  Verify pipelines in mongosh.

### Phase 5 --- Frontend

1.  Shared app shell and navigation.
2.  Dashboard.
3.  Events page.
4.  Students page.
5.  Registrations page.
6.  Analytics page.
7.  Database Lab page.
8.  Verify all interactions against real APIs.

### Phase 6 --- Replication lab

1.  Write separate Compose configuration.
2.  Use separate ports and volumes.
3.  Initialize replica set.
4.  Verify primary/secondary.
5.  Test replication and failover.
6.  Document cleanup and restart.

### Phase 7 --- Sharding lab

1.  Build a valid local sharded cluster configuration.
2.  Initialize config server replica set.
3.  Initialize shard replica sets.
4.  Start mongos.
5.  Add shards.
6.  Enable sharding and shard a dedicated collection.
7.  Verify with `sh.status()`.
8.  Document cleanup and restart.

### Phase 8 --- Final quality gate

1.  Run backend tests.
2.  Run frontend lint/build.
3.  Verify all syllabus topics.
4.  Fix errors.
5.  Finish README and practical guide.
6.  Provide a concise completion report with commands to run the project
    and a list of verified versus unverified demonstrations.

At the end of each phase, summarize: - files created/changed; - commands
executed; - tests performed; - results; - known issues; - next phase.

Do not claim a test or infrastructure feature was verified unless it was
actually executed successfully.

------------------------------------------------------------------------

## 15. Important safety and operational rules

1.  Never delete the user's existing MongoDB database or Docker volumes
    without explicit approval.
2.  Never run `docker volume rm`,
    `db.dropDatabase()` or collection drops as part of ordinary setup.
3.  Do not overwrite existing `.env` files. Create `.env.example` and
    ask before modifying existing secrets/configuration.
4.  Do not change the user's system-wide MongoDB or Docker configuration
    unnecessarily.
5.  Bind local database ports to localhost.
6.  Keep replica-set and sharding labs isolated from the normal
    development database.
7.  Do not run expensive cluster configurations automatically.
8.  Do not fabricate screenshots, terminal output, metrics, or cluster
    status.
9.  Do not expose arbitrary database command execution through HTTP.
10. Explain any command that may destroy data before asking the user to
    run it.

------------------------------------------------------------------------

## 16. Definition of done

The project is complete when a student can launch the frontend and
backend, connect to the local MongoDB server, seed the database, manage
campus events/students/registrations, view real aggregation analytics,
and use the Database Lab to explain and execute the syllabus operations.

Replication and sharding must have separate reproducible local lab
setups with genuine MongoDB cluster verification. The practical guide
must explain how to demonstrate all 11 syllabus topics.

**The main success criterion is educational demonstrability: every
syllabus item must have a clear explanation, a concrete MongoDB command
or real infrastructure procedure, and observable evidence.**
