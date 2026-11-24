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

## 8. Explain the production database layer — 1 minute

Say:

“The product API connects to mongos, which routes requests to the sharded MongoDB cluster. Each data shard is a replica set, so data remains available if one member fails. The application uses majority writes, while analytics use secondaryPreferred to spread reporting reads. Users do not need to see database administration screens; these details support the product behind the scenes.”

If you want to demonstrate failover, do it from a separate terminal by stopping a known primary container and restarting it afterward. Never run docker compose down -v during a live presentation.

## 9. Close — 45 seconds

Say:

“This project is a complete event operations application backed by MongoDB. The domain workflows are real: event capacity, duplicate prevention, waitlists, attendance, joined registration views, and analytics. Replication and sharding support the same product database behind the scenes.”

