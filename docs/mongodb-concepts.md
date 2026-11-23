# MongoDB in the Application

This document explains why MongoDB is used in Campus Event Management and how the implementation supports the product.

## Document model

A MongoDB document stores one business object as a BSON document. This suits the application because event and student records have natural nested values such as tags and skills, while registrations remain separate records with references.

The application uses ObjectId for document identity and relationships. Dates are stored as native dates so event filtering and sorting happen correctly in MongoDB.

## Collections

The database contains departments, students, events, registrations, and cluster_probes.

Collections are separated by business responsibility. This makes event, student, and registration APIs easy to reason about and lets indexes match the queries used by each screen.

## References and readable screens

A registration stores studentId and eventId references. It does not duplicate every student and event field.

For the registration table, the backend runs an aggregation pipeline:

1. lookup finds the referenced student.
2. unwind turns the lookup array into one student object.
3. lookup finds the referenced event.
4. unwind turns the event result into one object.
5. project returns the names and fields required by the UI.

This keeps the stored registration small while giving users a readable table.

## CRUD and validation

The official MongoDB driver provides insertOne, find, updateOne, findOneAndUpdate, deleteOne, and deleteMany for the application services.

The API validates input before these methods run. It also builds filters on the server from allowlisted parameters. A browser cannot send arbitrary MongoDB commands.

## Indexes

Indexes are created at backend startup.

Student ID and email are unique because they identify a student. Department code and name are unique because they identify a department. Event status/date and category support event lists and filters. The registration compound unique index prevents duplicate student-event pairs, while event/status and student/status indexes support registration views.

## Aggregation and analytics

Analytics are calculated in MongoDB through pipelines. Typical stages include:

- match filters input records.
- group calculates totals and counts.
- sum, avg, min, and max calculate numeric metrics.
- lookup joins related collections.
- unwind flattens joined arrays.
- project shapes the API response.
- sort orders the returned report.

The frontend does not recalculate these values. It displays the API results with Recharts.

## Replication

A replica set maintains multiple copies of data. One member is primary and accepts writes. Secondary members replay operations from the oplog.

This project has three members in each data shard. Application writes use majority write concern. The Cluster page shows member states and oplog windows and can run a controlled marker probe through mongos.

## Sharding

Sharding partitions data across multiple shards. Mongos is the router used by the backend. Config-server metadata tells mongos where chunks and sharded collections live.

The application uses:

- registrations with range key studentId plus eventId. This aligns with the unique registration index and supports student-oriented targeting.
- events with hashed _id. This spreads event documents more evenly and keeps ID lookups targetable.
- students and departments unsharded because their unique identity indexes and modest size make them better kept together.

## Why both are used

Replication provides availability and redundancy. Sharding provides horizontal distribution of data and workload. A sharded production deployment commonly uses replica sets for the shards, which is why this application demonstrates both in one operational stack.

## Operational read preferences

CRUD screens use normal primary reads so users see their own updates quickly. Analytics use secondaryPreferred to spread report reads and demonstrate a realistic trade-off: reports may briefly lag behind the newest write.

