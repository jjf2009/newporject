# Campus Event Management Platform (`campus-event-management-platform`)

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Sharded%20Cluster-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![SEO & GEO](https://img.shields.io/badge/SEO%20%26%20GEO-Optimized-brightgreen?style=for-the-badge)](./llms.txt)

> Production-grade collegiate event management system combining campus scheduling, student registrations, real-time waitlists, attendance check-ins, multi-venue capacity analytics, and a sharded MongoDB cluster.

---

## 📌 GitHub Repository Configuration (SEO & Discovery)

To optimize this repository for GitHub search discovery, Google indexing, and AI search engines:

| Field | Recommended Value |
|---|---|
| **Repository Name** | `campus-event-management-platform` |
| **Description** | High-performance collegiate event management system for campus scheduling, student registration, waitlists, attendance tracking, and multi-venue analytics backed by a sharded MongoDB cluster. |
| **Website URL** | `https://campus-events.example.com` (or your deployment URL) |
| **Topics (Tags)** | `campus-event-management`, `college-events`, `event-registration-system`, `attendance-tracking`, `student-platform`, `mongodb-sharding`, `nextjs`, `expressjs`, `typescript`, `geo-targeting`, `generative-engine-optimization`, `higher-education` |

---

## 📋 Table of Contents

- [Core Capabilities](#core-capabilities)
- [SEO & GEO Optimization Architecture](#seo--geo-optimization-architecture)
  - [Generative Engine Optimization (GEO)](#generative-engine-optimization-geo)
  - [Geographic & Campus Venue SEO](#geographic--campus-venue-seo)
  - [Structured Data (JSON-LD)](#structured-data-json-ld)
- [System Architecture](#system-architecture)
- [Data Model & Sharding Schema](#data-model--sharding-schema)
- [MongoDB Topology & Replication](#mongodb-deployment)
- [Quick Start & Local Setup](#run-locally)
- [Main API Endpoints](#main-api-areas)
- [Frequently Asked Questions (SEO & GEO FAQ)](#frequently-asked-questions-seo--geo-faq)
- [Documentation Index](#documentation)

---

## 🚀 Core Capabilities

- **Event Lifecycle & Search**: Search with MongoDB `$regex`, filter by category (`Technical`, `Cultural`, `Sports`, `Workshop`, `Seminar`), status (`upcoming`, `ongoing`, `completed`, `cancelled`), and event date.
- **Physical Campus Venue Management**: Multi-hall campus venue management, seating capacity constraints, geo-coordinates, and campus directions.
- **Student Profile Management**: Directory organized by academic department, year of study, contact details, and skill tags.
- **Atomic Registration & Auto-Waitlisting**: Unique compound index `{ studentId: 1, eventId: 1 }` prevents double-booking. When capacity is reached, registrations transition to an ordered waitlist and promote upon cancellations.
- **Verified Attendance Tracking**: Track check-in states (`pending`, `present`, `absent`) for university participation certification.
- **Real-Time Operations Analytics**: Aggregation pipelines for seat utilization, department engagement, category popularity, and registration lifecycle status.
- **Resilient MongoDB Deployment**: The API runs through `mongos` with replica-set shards and sharded application collections managed by the infrastructure layer.

---

## 🌐 SEO & GEO Optimization Architecture

This repository is built with first-class **Search Engine Optimization (SEO)** and **Generative Engine Optimization (GEO)** principles.

### Generative Engine Optimization (GEO)
GEO prepares your application and repository to be indexed, cited, and recommended by AI engines (ChatGPT Search, Perplexity AI, Google Gemini, Claude, and Bing Copilot):
- **`llms.txt`**: Standard machine-readable summary located at [`/llms.txt`](./llms.txt) and in `frontend/public/llms.txt`.
- **`llms-full.txt`**: Deep architectural and technical specification located at [`/llms-full.txt`](./llms-full.txt) and in `frontend/public/llms-full.txt`.
- **AI Crawlers Whitelisted**: Configured in [`robots.ts`](frontend/app/robots.ts) and [`robots.txt`](frontend/public/robots.txt) for `GPTBot`, `PerplexityBot`, `ClaudeBot`, and `Google-Extended`.

### Geographic & Campus Venue SEO
Campus events rely on physical venue discovery and regional relevance:
- **Geographic Meta Tags**: Embedded `geo.region` (`IN-GA`), `geo.placename` (`Campus Main Quad & Conference Halls`), `geo.position` (`15.4226;73.9803`), and `ICBM` tags in [`layout.tsx`](frontend/app/layout.tsx).
- **Venue Badges**: UI displays campus venue locations with geo-pin indicators and capacity tags.
- **Dynamic Sitemap**: [`sitemap.ts`](frontend/app/sitemap.ts) automatically generates XML sitemaps containing all key application routes with priority weighting.

### Structured Data (JSON-LD)
Rich Schema.org semantic graphs are embedded directly in the document head:
- `schema.org/SoftwareApplication`: Entity classification for web search.
- `schema.org/CollegeOrUniversity`: Institutional and campus venue entity with physical address and `GeoCoordinates`.
- `schema.org/EventSeries`: Event catalogue structure with `OfflineEventAttendanceMode` and place metadata.

---

## 🏛️ System Architecture

```text
Next.js 16 Web Application (:3000)
        │ HTTP REST JSON
Express.js 4 API Gateway (:5000)
        │ Official MongoDB Node.js Driver v6.5
mongos Query Router (:27020)
   ├── configRS: cfg1 (:27030)
   ├── shard1RS: s1a (:27111), s1b (:27112), s1c (:27113)
   └── shard2RS: s2a (:27124), s2b (:27122), s2c (:27123)
```

> **Security Note:** The client browser never connects directly to MongoDB. All queries pass through the Express API backend, which coordinates with the `mongos` router.

---

## 📊 Data Model & Sharding Schema

| Collection | Sharding Key | Purpose | Key Fields |
|---|---|---|---|
| `registrations` | Range `{ studentId: 1, eventId: 1 }` | Student participation & waitlists | `studentId`, `eventId`, `status`, `attendance`, `registeredAt` |
| `events` | Hashed `{ _id: "hashed" }` | Campus event catalogue & venues | `title`, `category`, `venue`, `eventDate`, `capacity`, `status` |
| `students` | Unsharded (Primary Shard) | Student directory & profiles | `studentId`, `email`, `departmentId`, `year`, `skills` |
| `departments` | Unsharded (Primary Shard) | Academic departments | `name`, `code`, `coordinator` |

- **Duplicate Prevention**: A unique compound index on `{ studentId: 1, eventId: 1 }` prevents concurrent double-registrations.
- **Aggregation Joins**: The backend aggregates `$lookup` joins on read pipelines without compromising sharded write performance.

---

## 🗄️ MongoDB Deployment

The application runs a local production-topology sharded cluster:

- `registrations` uses a range shard key on `{ studentId: 1, eventId: 1 }`.
- `events` uses a hashed shard key on `{ _id: "hashed" }` to distribute traffic evenly across shards.
- `students` and `departments` remain on the primary shard for strict relational identity integrity.
- Each data shard is configured as a three-member replica set (`s1a`, `s1b`, `s1c` and `s2a`, `s2b`, `s2c`).
- Application transactional writes use `majority` write concern.
- Analytical reporting queries use `secondaryPreferred` read preference to prevent analytical queries from locking transactional write nodes.

---

## 💻 Run Locally

### 1. Start the MongoDB Sharded Cluster

```bash
docker compose -f infrastructure/cluster/compose.yaml up -d
```

The initialization service provisions replica sets, introduces shards to `mongos`, initializes sharding rules, creates index boundaries, and outputs `CLUSTER READY`.

### 2. Configure Backend Environment

Copy or configure your local backend environment:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27020
DB_NAME=campus_events
PORT=5000
```

### 3. Install Dependencies and Seed Data

```bash
# Backend Setup
cd backend
npm install
npm run seed
npm run dev
```

In a separate terminal:

```bash
# Frontend Setup
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Useful Commands

```bash
# Seed realistic high-volume registration data
cd backend && npm run seed:volume

# Prune volume seed data while preserving baseline records
cd backend && npm run seed:remove-volume

# Connect directly to the mongos query router
docker exec -it mongos mongosh mongodb://127.0.0.1:27020/campus_events
```

---

## 🔌 Main API Areas

- `GET /api/health` - Backend and cluster reachability status
- `GET /api/departments` - Academic department directory
- `GET, POST, PUT, DELETE /api/students` - Student directory management
- `GET, POST, PUT, DELETE /api/events` - Event catalogue and venue lifecycle
- `GET, POST, PUT, DELETE /api/registrations` - Student registration and waitlist handling
- `GET /api/analytics` - Seat utilization, category summaries, and department engagement

---

## ❓ Frequently Asked Questions (SEO & GEO FAQ)

### What is the Campus Event Management Platform?
The Campus Event Management Platform is an open-source, full-stack collegiate operations application designed to automate event scheduling, student registration, waitlists, attendance tracking, and multi-venue analytics for universities and colleges.

### How does the platform handle physical campus venue locations and geo-coordinates?
Every event record is linked with campus venue metadata, capacity constraints, and geographical coordinates. The frontend provides Schema.org `Place` and `GeoCoordinates` microdata, enabling search engines and map services to accurately index collegiate venues.

### How does MongoDB sharding benefit high-demand college event registrations?
During peak registration windows (e.g. campus hackathons or cultural fests), thousands of students attempt to register simultaneously. By partitioning `registrations` with a compound range shard key `{ studentId: 1, eventId: 1 }` and `events` with `{ _id: "hashed" }`, write traffic distributes across independent replica set shards without database write bottlenecks.

### Is this repository Generative Engine Optimization (GEO) friendly?
Yes. It includes `llms.txt` and `llms-full.txt` specifications following open AI indexing standards, explicit JSON-LD structured data for `SoftwareApplication` and `EventSeries`, and open crawler access for GPTBot, PerplexityBot, and ClaudeBot.

---

## 📖 Documentation

- [Detailed Project Report](docs/project-report.md)
- [Formatted Project Report PDF](docs/campus-event-management-report.pdf)
- [Editable Project Report DOCX](docs/campus-event-management-report.docx)
- [Practical Demo Script](docs/practical-demo-script.md)
- [Presentation Script](docs/project-presentation-script.md)
- [MongoDB Architecture Concepts](docs/mongodb-concepts.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [MongoDB Infrastructure Documentation](infrastructure/cluster/README.md)
- [LLMs Machine Specification (GEO)](./llms.txt)
- [LLMs Technical Spec (Full)](./llms-full.txt)

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.
