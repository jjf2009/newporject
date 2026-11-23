# Local MongoDB Cluster

This Compose stack is the database deployment used by Campus Event Management. It is not a separate lab. The Express API connects to mongos, and the product pages use the resulting data.

## Topology

- cfg1: config server replica-set member, host port 27030.
- s1a, s1b, s1c: three members of shard1RS, host ports 27111–27113.
- s2a, s2b, s2c: three members of shard2RS, host ports 27121–27123.
- mongos: application router, host port 27020.
- cluster-init: one-shot initialization job.

The config replica set has one member to keep the local resource footprint small. Production should use three config-server members.

## Start

From the repository root:

    docker compose -f infrastructure/cluster/compose.yaml up -d

Watch initialization:

    docker logs -f cluster-init

The job initializes replica sets using container DNS names, adds both shards, enables sharding for campus_events, creates the shard-key indexes, and prints CLUSTER READY after both sharded collections are visible.

## Verify

    docker compose -f infrastructure/cluster/compose.yaml ps
    docker exec -it mongos mongosh --eval 'db.adminCommand({ ping: 1 })'
    docker exec -it mongos mongosh --eval 'db.adminCommand({ listShards: 1 })'

The application connection string is:

    mongodb://127.0.0.1:27020/campus_events

The backend connects only to this router.

## Data placement

- registrations uses the range key studentId plus eventId and retains its compound unique index.
- events uses the hashed _id key.
- students and departments are unsharded and use the primary shard.

## Failover demonstration

Open the Cluster page and identify a current primary. Stop only that container:

    docker stop <primary-container>

Refresh the Cluster page and wait for a new election. The application continues to use mongos. Restart the stopped member afterward:

    docker start <stopped-container>

It should rejoin as a secondary.

## Stop and reset

Stop the services while preserving data:

    docker compose -f infrastructure/cluster/compose.yaml down

Deleting volumes is permanent for this local environment:

    docker compose -f infrastructure/cluster/compose.yaml down -v

Use volume deletion only when intentionally rebuilding the local database.

