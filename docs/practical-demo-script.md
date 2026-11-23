# Practical Product Demo Script

Use this script for a 12–15 minute hackathon or project demonstration. Keep the application open at http://localhost:3000 and keep a terminal available for startup commands.

## Before the demo

Start the database cluster:

    docker compose -f infrastructure/cluster/compose.yaml up -d

Wait for the cluster-init container to report CLUSTER READY. Then start the backend and frontend. If the database is empty, run the idempotent base seed.

The demo should use live values shown on screen. Do not memorize counts.

## 1. Introduce the problem — 45 seconds

Say:

“Campus events are often managed with separate spreadsheets for students, events, registrations, and attendance. That makes capacity tracking, duplicate registrations, and participation reporting difficult. This application provides one operational workflow for the event team.”

“The main user can create events, manage students, register students, handle capacity and waitlists, record attendance, and view analytics.”

## 2. Show the dashboard — 1 minute

Open the Dashboard.

Point out:

- Total students.
- Active and upcoming events.
- Confirmed registrations.
- Average event capacity.
- Event utilization bars.
- Recent registrations.

Say:

“These cards and lists are live data from the application database. The frontend is only presenting API results; the backend calculates the metrics.”

## 3. Create or inspect an event — 2 minutes

Open Events.

Show the event filters and the event table. Create a small event for the demonstration, for example:

- Title: Campus Product Demo
- Category: Workshop
- Venue: Innovation Hall
- Capacity: 1
- Status: Upcoming
- Event date and registration deadline: future values
- Organizer: Events Committee
- Tags: demo, campus

Say:

“An event has business fields that the coordinator actually needs. Validation happens in the API before MongoDB receives the write. The event list is paginated and can be filtered by status, category, and search text.”

Edit the event if useful, then return to the list.

## 4. Show student management — 1 minute

Open Students.

Search for a student and show department and year filters. Explain:

“Students have a stable campus student ID and unique email. Department information is stored as a reference and also kept as a readable denormalized name for list screens. The backend protects the unique identifiers with indexes.”

If appropriate, create a new student for the event demo.

## 5. Demonstrate registration and capacity — 3 minutes

Open Registrations and register one student for the event.

Say:

“The backend first validates that both referenced documents exist. It checks whether the student-event pair already exists, then counts confirmed registrations for the event.”

Register a second student for the capacity-one event.

Say:

“The first registration is confirmed. Because the event is full, the second registration is waitlisted. This is a real product rule, not a database exercise.”

Attempt the same student-event registration again.

Say:

“The compound unique index on studentId and eventId prevents duplicate registration. The API returns a conflict instead of creating a second record.”

Update attendance for a confirmed registration to Present. Optionally update a waitlisted record to Cancelled.

## 6. Explain the registration list — 1 minute

Point out that the table displays student names, emails, event titles, categories, and venues.

Say:

“Registrations store ObjectId references, but users need readable names. The backend uses MongoDB aggregation joins with lookup, unwind, and project before returning the table data. This keeps the data model clean while keeping the UI useful.”

## 7. Show analytics — 2 minutes

Open Analytics.

Point out:

- Overview cards.
- Registrations by event.
- Registrations by department.
- Event category summary.
- Registration status distribution.
- Capacity statistics.
- Recent registration activity.

Say:

“These charts are generated from MongoDB aggregation pipelines. MongoDB performs the matching, grouping, counting, averaging, joining, and sorting. Recharts only draws the returned values.”

Mention:

“Analytics are allowed to read from secondaries with secondaryPreferred, so a report may lag by a small amount. Normal event and registration screens use primary reads so recent changes are immediately visible.”

## 8. Show the operational cluster — 3 minutes

Open Cluster.

Point out:

- configRS, shard1RS, and shard2RS.
- Primary and secondary states.
- Oplog window.
- Replication probe.
- Shard names.
- Shard keys.
- Chunk counts and distribution.
- Explain-query buttons.

Say:

“The application connects to mongos, not directly to a database member. Every data shard is a replica set. Replication protects availability by keeping copies and enabling elections. Sharding distributes data and workload across shards.”

Run the replication probe.

Say:

“The backend writes a temporary operational marker with majority write concern through mongos, then reads it directly from each shard member. The page reports whether every member can see the replicated marker and the read latency.”

Show the shard keys:

- registrations uses the compound range key studentId plus eventId.
- events uses a hashed _id key.

Say:

“The registration key supports student-oriented access and is also the unique registration index. Events use hashing to spread event documents more evenly.”

## 9. Optional failover demonstration — 2 minutes

Only do this if time and resources allow.

From a separate terminal, stop the current primary container shown on the Cluster page:

    docker stop <primary-container>

Refresh Cluster and wait for a new primary election.

Say:

“The failed primary is reported as down. The remaining replica-set members elect a new primary. The application continues to use mongos, so the frontend does not need a new database URL.”

Restart the stopped container:

    docker start <stopped-container>

Wait for it to rejoin as a secondary.

Never run docker compose down -v during a live presentation.

## 10. Close — 45 seconds

Say:

“This project is a complete event operations application backed by MongoDB. The domain workflows are real: event capacity, duplicate prevention, waitlists, attendance, joined registration views, and analytics. Replication and sharding are part of the same database stack that serves the application, so the infrastructure demonstration is connected to the product rather than being a separate lab.”

