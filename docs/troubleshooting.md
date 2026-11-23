# Troubleshooting

## The frontend shows a network error

Confirm that the backend is running on port 5000:

    cd backend
    npm run dev

Confirm that the frontend uses:

    NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api

Check the backend health endpoint:

    curl http://127.0.0.1:5000/api/health

## The backend cannot connect to MongoDB

The backend must connect to mongos, not to the old standalone port:

    MONGODB_URI=mongodb://127.0.0.1:27020

Check the cluster:

    docker compose -f infrastructure/cluster/compose.yaml ps

Check the router directly:

    docker exec -it mongos mongosh --eval 'db.adminCommand({ ping: 1 })'

If the cluster is stopped, start it:

    docker compose -f infrastructure/cluster/compose.yaml up -d

## Cluster initialization is not complete

Inspect the init job:

    docker logs cluster-init

It should print CLUSTER READY. If a member is unhealthy, inspect that member:

    docker logs cfg1
    docker logs s1a
    docker logs s1b
    docker logs s1c
    docker logs s2a
    docker logs s2b
    docker logs s2c

The cluster requires host ports 27020, 27030, 27111–27113, and 27121–27123. Check for conflicts before starting it:

    ss -ltnp

Do not kill an unrelated process automatically. Release the conflicting port or change the local environment deliberately and update the matching backend node configuration.

## Compass cannot connect

Use the router URI for application data:

    mongodb://127.0.0.1:27020/campus_events

To inspect a specific member, use direct connection:

    mongodb://127.0.0.1:27111/?directConnection=true

Members advertise Docker DNS names internally. Direct connection is therefore required when connecting to a member from the host.

## Analytics fails while other pages work

Check the backend log and call the analytics endpoint directly:

    curl http://127.0.0.1:5000/api/analytics/overview

If only the category summary fails, inspect the data returned by:

    curl http://127.0.0.1:5000/api/analytics/event-category-summary

The browser should not be blocked by an extension such as uBlock Origin for a localhost API request. Disable the blocking rule for localhost if it is the cause.

## Registration is waitlisted

This is expected when confirmed registrations have reached the event capacity. Cancel or remove a confirmed registration, then create another registration if you want to demonstrate the status change.

## Duplicate registration conflict

The same student-event pair is protected by a unique compound index. Register a different student or event. This is intentional data protection.

## Resetting local cluster data

The normal stop command preserves data:

    docker compose -f infrastructure/cluster/compose.yaml down

Removing volumes permanently deletes the local cluster data and should only be done deliberately:

    docker compose -f infrastructure/cluster/compose.yaml down -v

After a volume reset, start the cluster again and run the base seed.

