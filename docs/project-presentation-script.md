# Project Presentation Script

## Opening

“Good morning. Our project is Campus Event Management, a web application for college event coordinators. It brings event creation, student management, registration, capacity handling, attendance, and participation analytics into one system.”

“The important design decision is that this is a real application. MongoDB is used as the operational database for the product, while replication and sharding support availability and scale for the same application.”

## Problem and solution

“Without a central system, event teams have to maintain separate student lists, event spreadsheets, registration forms, and attendance records. That creates duplicate entries, makes capacity difficult to control, and makes reporting slow.”

“Our application gives the coordinator one workflow: create an event, register students, automatically handle confirmed and waitlisted seats, record attendance, and view live participation reports.”

## Technology stack

“The frontend uses Next.js App Router, TypeScript, Tailwind CSS, and Recharts. The backend uses Node.js and Express. MongoDB is accessed with the official MongoDB Node.js driver; the project does not use Mongoose.”

“The browser communicates only with the Express API. The API validates input and connects to MongoDB through mongos at port 27020.”

## Data model

“The main collections are departments, students, events, and registrations.”

“Students and events are independent documents. A registration stores ObjectId references to one student and one event. When the screen needs readable names, the backend uses MongoDB lookup, unwind, and project stages to create a joined response.”

“Registration records have a compound unique index on studentId and eventId. This enforces the business rule that the same student cannot register for the same event twice.”

## Business workflow demo

“On the Events page, an organizer can create an event with a category, venue, date, deadline, capacity, status, organizer, and tags.”

“On the Registrations page, the backend confirms that the student and event exist. It checks for an existing registration and counts confirmed registrations. If capacity remains, the registration is confirmed. If capacity is full, the status becomes waitlisted.”

“This is useful in a real campus application because the coordinator does not need to manually maintain a separate waiting list.”

“Attendance is updated after the event. Event deletion is protected when registrations exist, because deleting the event would remove an important relationship.”

## Analytics

“The Analytics page shows overview totals, registrations by event, participation by department, category summaries, status distribution, capacity statistics, and recent registrations.”

“These values are calculated by MongoDB aggregation pipelines. MongoDB performs filtering, grouping, counting, averaging, joining, and sorting. The frontend receives the calculated data and uses Recharts to display it.”

“Analytics use secondaryPreferred because a small amount of replication lag is acceptable for reports. CRUD screens use the primary read preference so recent changes appear immediately.”

## Cluster architecture

“The application connects to one local sharded cluster through mongos. The cluster has a config server replica set, shard1RS with three members, and shard2RS with three members.”

“Each data shard is a replica set. The primary receives writes and secondaries maintain copies using the oplog. Majority write concern makes successful writes durable across a replica-set majority. If a primary fails, the remaining members can elect a new primary.”

“Sharding distributes the data across multiple shards. Registrations use the range key studentId plus eventId. Events use a hashed _id key for even distribution. Students and departments stay on the primary shard because their unique identity indexes are more important than distributing these smaller collections.”

## Cluster page

“The Cluster page is an operational health view. It shows member states, primaries, oplog windows, shard names, shard keys, chunk counts, distribution, and query planner summaries.”

“The replication probe writes a short-lived operational marker through mongos with majority write concern, then reads it directly from each shard member. This gives visible evidence that the same application cluster is replicating data.”

## Limitations

“This is a local development and demonstration deployment. The config server has one member to reduce resource use; production would use three. Capacity assignment uses a count-then-insert flow and could require transactions or another concurrency strategy at much higher traffic.”

“Authentication, notifications, payments, and cloud deployment are outside this version.”

## Closing

“To conclude, Campus Event Management is a product-oriented application rather than a collection of database exercises. MongoDB supports the actual domain model, business rules, joined screens, analytics, availability, and horizontal distribution. The final demo shows one continuous workflow from event creation to registration, attendance, reporting, and cluster health.”

