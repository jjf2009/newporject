# Campus Event Management Frontend

This is the Next.js frontend for the Campus Event Management product.

## Product pages

- Dashboard: operational summary and recent registrations.
- Events: event creation, editing, filtering, and capacity management.
- Students: student directory and profile management.
- Registrations: registration status, waitlists, joined event/student details, and attendance.
- Analytics: participation and capacity reports.

## Run

Install dependencies and start the development server:

    pnpm install
    pnpm dev

Open http://localhost:3000.

The frontend calls the backend at http://127.0.0.1:5000/api by default. Set NEXT_PUBLIC_API_BASE_URL only when the API is hosted elsewhere.

The browser never connects directly to MongoDB. Replication and sharding are infrastructure concerns managed by Docker and mongos, not separate user-facing pages.

