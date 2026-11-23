# Campus Event Management

Campus Event Management is a real-world style application for running college events. Organizers can create events, maintain the student directory, accept registrations, manage capacity and waitlists, record attendance, and monitor participation through analytics.

The project is intentionally presented as a product application. MongoDB is the operational database behind the workflows; there is no separate lab or query runner.

## What the application does

- Dashboard with current student, event, registration, capacity, and recent-registration metrics.
- Event management with search, category/status filters, capacity, dates, tags, venue, and organizer information.
- Student management with department, year, contact information, and skills.
- Registration management with duplicate prevention, capacity-based waitlisting, attendance, status updates, and joined student/event details.
- Analytics with event utilization, department participation, event-category summaries, capacity statistics, registration status, and recent activity.
- Cluster health page showing the infrastructure serving the application: replica-set members, oplog windows, shard layout, chunks, and query routing evidence.

## Architecture

```text
Next.js frontend :3000
        │ HTTP JSON
Express API :5000
        │ official MongoDB Node.js driver
mongos router :27020
   ├── configRS: cfg1
   ├── shard1RS: s1a, s1b, s1c
   └── shard2RS: s2a, s2b, s2c
```

The browser never connects directly to MongoDB. All database access is performed by the Express backend through the `mongos` router.

## Data model

| Collection | Purpose | Important fields |
|---|---|---|
| `departments` | Academic department directory | `name`, `code`, `coordinator` |
| `students` | Student profiles | `studentId`, `email`, `departmentId`, `year`, `skills` |
| `events` | Campus event catalogue | `title`, `category`, `eventDate`, `capacity`, `status`, `tags` |
| `registrations` | Student participation records | `studentId`, `eventId`, `status`, `attendance`, `registeredAt` |
| `cluster_probes` | Short-lived operational health markers | `type`, `nonce`, `at` |

`registrations` stores ObjectId references to students and events. The API uses aggregation joins when it needs readable names for the UI. A unique compound index on `{ studentId: 1, eventId: 1 }` prevents the same student from registering for the same event twice.

## MongoDB deployment

The application uses one local sharded cluster:

- `registrations` uses the range shard key `{ studentId: 1, eventId: 1 }`.
- `events` uses the hashed shard key `{ _id: "hashed" }`.
- `students` and `departments` remain unsharded on the primary shard because their unique identity indexes are central to the domain model.
- Each data shard is a three-member replica set.
- The config server uses one member as a local, labeled resource-saving simplification.
- Application writes use majority write concern.
- Analytics use `secondaryPreferred`; analytics can therefore be slightly behind the latest write.
- CRUD pages use the normal primary read preference so a user sees changes immediately.

## Run locally

### 1. Start MongoDB

```bash
docker compose -f infrastructure/cluster/compose.yaml up -d
```

The initialization job creates the replica sets, adds the shards to `mongos`, enables sharding, creates shard-key indexes, and prints `CLUSTER READY` when the topology is ready.

### 2. Configure the backend

Copy the example variables into the local backend environment and keep the router URI:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27020
DB_NAME=campus_events
```

The existing `.env` file is local-only and is never overwritten automatically.

### 3. Install and start services

```bash
cd backend
npm install
npm run seed
npm run dev
```

In another terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
# Add larger realistic data volume
cd backend && npm run seed:volume

# Remove only documents created by the volume seed
cd backend && npm run seed:remove-volume

# Inspect the router directly
docker exec -it mongos mongosh
```

Do not run `down -v` unless deleting the local cluster data is intentional.

## Main API areas

- `/api/health`
- `/api/departments`
- `/api/students`
- `/api/events`
- `/api/registrations`
- `/api/analytics`
- `/api/cluster`

## Documentation

- [Detailed project report](docs/project-report.md)
- [Practical demo script](docs/practical-demo-script.md)
- [Presentation script](docs/project-presentation-script.md)
- [MongoDB architecture in this project](docs/mongodb-concepts.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Cluster infrastructure](infrastructure/cluster/README.md)

# newporject
