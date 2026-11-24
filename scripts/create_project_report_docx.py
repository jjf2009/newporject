from pathlib import Path
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "report-assets"
OUT = ROOT / "docs" / "campus-event-management-report.docx"


def black(run, bold=False, size=10):
    run.font.name = "Arial"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor(0, 0, 0)


def set_cell_shading(cell, fill="EEEEEE"):
    tc_pr = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill)
    tc_pr.append(shading)


def set_cell_text(cell, text, bold=False):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    run = paragraph.add_run(str(text))
    black(run, bold=bold, size=9)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_heading(doc, text, level=1):
    paragraph = doc.add_heading("", level=level)
    run = paragraph.add_run(text)
    black(run, bold=True, size=16 if level == 1 else 12)
    return paragraph


def add_body(doc, text):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.line_spacing = 1.15
    run = paragraph.add_run(text)
    black(run, size=10)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    run = paragraph.add_run(text)
    black(run, size=10)
    return paragraph


def add_table(doc, rows, widths=None):
    table = doc.add_table(rows=0, cols=len(rows[0]))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for index, value in enumerate(row):
            set_cell_text(cells[index], value, bold=row_index == 0)
            if row_index == 0:
                set_cell_shading(cells[index])
    return table


def add_screenshot(doc, filename, caption):
    path = ASSETS / filename
    if path.exists():
        paragraph = doc.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = paragraph.add_run()
        run.add_picture(str(path), width=Inches(6.2))
        caption_paragraph = doc.add_paragraph()
        caption_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        caption_run = caption_paragraph.add_run(caption)
        black(caption_run, size=9)
    else:
        add_body(doc, f"Screenshot unavailable: {filename}")


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.27)
section.page_height = Inches(11.69)
section.top_margin = Inches(0.7)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(0.75)
section.right_margin = Inches(0.75)

# Default style
normal = doc.styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(10)
normal.font.color.rgb = RGBColor(0, 0, 0)

# Cover
for _ in range(4):
    doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Goa College of Engineering\nFarmagudi, Ponda - Goa")
black(r, size=14)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("\nPROJECT REPORT\n\nCAMPUS EVENT MANAGEMENT PLATFORM")
black(r, bold=True, size=24)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Events, student registrations, waitlists, attendance and participation analytics backed by MongoDB")
black(r, size=12)
for _ in range(4):
    doc.add_paragraph()
add_table(doc, [
    ["Prepared by", "Jared John Furtado"],
    ["Project type", "Implemented full-stack web application"],
    ["Technology", "Next.js, Express.js, MongoDB Community Server"],
    ["Report date", "24 November 2026"],
])
doc.add_page_break()

add_heading(doc, "Project Report", 1)
add_table(doc, [
    ["Project", "Campus Event Management Platform"],
    ["Scope", "Event operations for a college campus"],
    ["Frontend", "Next.js App Router, TypeScript, Tailwind CSS, Recharts"],
    ["Backend", "Node.js, Express.js, Zod, official MongoDB Node.js driver"],
    ["Database", "MongoDB Community Server through mongos"],
    ["Deployment", "Docker Compose local sharded cluster"],
    ["Status", "Implemented product prototype ready for demonstration"],
])
add_heading(doc, "Contents", 2)
add_body(doc, "1. Executive Summary\n2. Introduction and Background\n3. Problem Statement\n4. Objectives\n5. Proposed Solution\n6. Implemented Features\n7. MongoDB Design and Implementation\n8. Application Workflows\n9. Privacy, Validation and Reliability\n10. Testing and Current Status\n11. Limitations and Future Work\n12. Demonstration Plan\nAnnexure A: Application Screenshots")
doc.add_page_break()

add_heading(doc, "1. Executive Summary", 1)
add_body(doc, "Campus Event Management Platform is a full-stack application for college event coordinators and student activity teams. It provides one workflow for creating campus events, maintaining student profiles, accepting registrations, managing capacity and waitlists, recording attendance, and reviewing participation analytics.")
add_body(doc, "The project uses MongoDB as the operational database. The Express backend connects through a mongos router. Replica-set shards provide availability and sharded collections provide horizontal distribution while the product UI remains focused on event operations.")
add_body(doc, "The main demonstration is a continuous workflow: create an event, register students, trigger a waitlisted registration when capacity is full, update attendance, and review the resulting analytics.")
add_heading(doc, "Implementation result", 2)
for item in [
    "Functional Next.js frontend with Dashboard, Events, Students, Registrations and Analytics pages.",
    "Express API with validated CRUD operations and domain rules.",
    "MongoDB collections, indexes, aggregation joins and analytics pipelines.",
    "Sharded cluster with two three-member data replica sets behind mongos.",
    "Docker-based setup and idempotent seed data for repeatable demonstrations.",
]:
    add_bullet(doc, item)
doc.add_page_break()

add_heading(doc, "2. Introduction and Background", 1)
add_body(doc, "College events are managed by multiple people across departments, clubs and student activity teams. The coordinator needs a reliable event catalogue, a current student directory, controlled registration capacity, a waitlist, attendance information and useful reports. When these records are spread across separate spreadsheets or forms, duplicate registrations and inaccurate capacity counts become difficult to avoid.")
add_body(doc, "This project addresses that operational problem through a browser-based application. The frontend provides the coordinator experience, the Express API enforces business rules, and MongoDB stores the domain records and calculates analytics.")
add_heading(doc, "3. Problem Statement", 1)
add_body(doc, "A campus event team needs a single source of truth for events and student participation. The system must prevent duplicate student-event registrations, reject invalid references, handle full events without losing demand, expose readable registration information, and provide reports without manually combining spreadsheets.")
add_heading(doc, "4. Objectives", 1)
for item in [
    "Provide one web workflow for event creation, student management, registrations and attendance.",
    "Apply event capacity rules automatically and create waitlisted registrations when required.",
    "Prevent duplicate registrations using server validation and a compound unique index.",
    "Return readable registration records by joining student and event documents.",
    "Calculate participation and capacity analytics inside MongoDB aggregation pipelines.",
    "Use majority writes, replica-set redundancy and sharding without exposing database administration screens to users.",
]:
    add_bullet(doc, item)
doc.add_page_break()

add_heading(doc, "5. Proposed Solution and Architecture", 1)
add_body(doc, "The system follows a three-layer architecture. The browser renders product pages and calls JSON endpoints. The Express API validates input, applies domain rules and builds safe database operations. MongoDB stores and calculates the data through the mongos router.")
add_table(doc, [
    ["Layer", "Implementation", "Responsibility"],
    ["Frontend", "Next.js, TypeScript, Tailwind CSS, Recharts", "Product pages, forms, tables, charts and loading/error states"],
    ["API", "Node.js, Express, Zod", "Validation, pagination, business rules and response formatting"],
    ["Database access", "Official MongoDB Node.js driver", "Connection pooling, indexes, reads, writes and aggregation"],
    ["Database", "MongoDB Community Server", "Documents, indexes, joins, analytics and distributed storage"],
    ["Infrastructure", "Docker Compose", "mongos, config server, replica sets and sharded collection setup"],
])
add_heading(doc, "Deployment topology", 2)
add_body(doc, "The application connects to mongos on port 27020. The config replica set uses cfg1 on port 27030. shard1RS contains s1a, s1b and s1c on ports 27111–27113. shard2RS contains s2a on 27124, s2b on 27122 and s2c on 27123.")
add_table(doc, [
    ["Collection", "Placement", "Shard key / rule"],
    ["departments", "Unsharded on primary shard", "Unique code and name indexes"],
    ["students", "Unsharded on primary shard", "Unique studentId and email indexes"],
    ["events", "Sharded", "Hashed _id for even distribution"],
    ["registrations", "Sharded", "Range studentId + eventId; also unique"],
])
doc.add_page_break()

add_heading(doc, "6. Implemented Features", 1)
add_table(doc, [
    ["Area", "Implemented behaviour"],
    ["Dashboard", "Live student, event, registration and capacity metrics; utilization bars; recent registrations."],
    ["Events", "Create, read, update and delete events; search; category/status filters; dates; venue; capacity; tags; organizer."],
    ["Students", "Student directory; search; department and year filters; profile creation and updates; unique identifiers."],
    ["Registrations", "Student-event validation; duplicate prevention; confirmed and waitlisted statuses; attendance; joined display data."],
    ["Analytics", "Event utilization, department participation, category summaries, status distribution, capacity statistics and recent activity."],
    ["Seed data", "Idempotent base data plus optional tagged volume seed for realistic demonstrations."],
    ["Infrastructure", "Docker Compose cluster, replica-set initialization, sharding rules, majority writes and read preference policy."],
])
add_heading(doc, "Registration workflow", 2)
add_body(doc, "When a registration is submitted, the API validates both referenced documents. It checks the compound student-event uniqueness rule and counts confirmed registrations for the event. If capacity remains, the record is confirmed. If the event is full, it is stored as waitlisted.")
add_heading(doc, "Readable registration records", 2)
add_body(doc, "Registrations store ObjectId references rather than duplicating full student and event documents. The list endpoint uses MongoDB lookup, unwind and project stages to return names, emails, event titles, categories, venues and dates required by the interface.")
doc.add_page_break()

add_heading(doc, "7. MongoDB Design and Implementation", 1)
add_heading(doc, "Documents, references and indexes", 2)
add_body(doc, "Departments, students, events and registrations are separate collections. Students and events are independent documents, while registrations reference them with ObjectId values. Indexes enforce unique student identity, unique department identity, event filtering and duplicate-registration prevention.")
add_heading(doc, "Aggregation", 2)
add_body(doc, "Analytics pipelines use match, group, sum, avg, min, max, lookup, unwind, project and sort. MongoDB returns calculated report data; the frontend only visualizes those results with Recharts.")
add_heading(doc, "Replication", 2)
add_body(doc, "Each data shard is a replica set. One member is primary and accepts writes; the secondaries maintain copies through the oplog. Application writes use majority write concern. If a primary fails, the remaining members can elect a new primary.")
add_heading(doc, "Sharding", 2)
add_body(doc, "The events collection uses a hashed _id shard key to distribute event documents evenly. Registrations use the range key studentId plus eventId, which aligns with the compound unique index and supports student-oriented targeting. The API connects to mongos, so the browser and backend do not choose a shard directly.")
doc.add_page_break()

add_heading(doc, "8. Application Workflows", 1)
add_body(doc, "The coordinator creates an event with title, category, venue, event date, deadline, capacity, status, tags and organizer. Event lists can be searched and filtered.")
add_body(doc, "Student records contain a campus identifier, name, email, department, year, phone and skills. Departments have unique codes and names.")
add_body(doc, "The coordinator registers students against events, observes confirmed or waitlisted status, updates attendance after the event and reviews joined student/event information in one table.")
add_body(doc, "Analytics turn operational records into decision support by comparing event demand, capacity utilization, department participation, category activity and registration status.")
add_heading(doc, "9. Privacy, Validation and Reliability", 1)
for item in [
    "The browser never connects directly to MongoDB.",
    "The server accepts validated parameters instead of arbitrary MongoDB filters or commands.",
    "Duplicate registration is protected at both API and database-index levels.",
    "Event deletion is guarded when registrations exist.",
    "Majority writes improve durability across replica-set members.",
    "Analytics use secondaryPreferred because reports can tolerate slight replication lag.",
    "Published Docker ports bind to 127.0.0.1 for local development.",
]:
    add_bullet(doc, item)
add_heading(doc, "10. Testing and Current Status", 1)
add_body(doc, "Backend syntax checks and validation tests pass. Frontend linting and TypeScript checks pass. The Webpack production build passes and exposes the product routes for Dashboard, Events, Students, Registrations and Analytics. The local MongoDB cluster has been started successfully with both replica sets healthy and both sharded collections initialized.")
doc.add_page_break()

add_heading(doc, "11. Limitations and Future Work", 1)
add_table(doc, [
    ["Area", "Current limitation"],
    ["Local topology", "The config server has one member to reduce local resource use; production should use three."],
    ["Capacity race", "Capacity uses a count-then-insert flow; high-concurrency production use may require transactions or a reservation strategy."],
    ["Security", "Authentication and role-based authorization are not implemented in this prototype."],
    ["Operations", "The Docker cluster is for local development and demonstration, not production hosting."],
    ["Product extensions", "Notifications, payments, cloud deployment and advanced administration are outside the current scope."],
])
add_heading(doc, "12. Demonstration Plan", 1)
add_body(doc, "Start on the Dashboard, create a capacity-limited event, use Students and Registrations to create a confirmed and a waitlisted registration, update attendance, and finish on Analytics to show the resulting reports. The database cluster remains behind the application and provides availability and scale without exposing administration screens to end users.")
doc.add_page_break()

add_heading(doc, "Annexure A — Application Screenshots", 1)
add_body(doc, "The following screenshots were captured from the running application using live seeded data.")
for filename, caption in [
    ("dashboard.png", "Figure A1. Dashboard with live operational metrics."),
    ("events.png", "Figure A2. Events catalogue and event management controls."),
    ("registrations.png", "Figure A3. Registration list with joined student/event information."),
    ("analytics.png", "Figure A4. Participation and capacity analytics."),
    ("students.png", "Figure A5. Student directory and filtering controls."),
]:
    add_screenshot(doc, filename, caption)
    doc.add_page_break()

# Footer page numbers
for sec in doc.sections:
    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("Campus Event Management Platform")
    black(run, size=8)

doc.save(OUT)
print(OUT)

