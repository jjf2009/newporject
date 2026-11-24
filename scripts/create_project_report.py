from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Image, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "report-assets"
OUT = ROOT / "docs" / "campus-event-management-report.pdf"
FONT_DIR = Path("/usr/share/fonts/liberation-sans-fonts")

pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_DIR / "LiberationSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONT_DIR / "LiberationSans-Bold.ttf")))

PAGE_W, PAGE_H = A4
GREEN = colors.black
NAVY = colors.black
SLATE = colors.black
LIGHT = colors.HexColor("#eef3f8")
BORDER = colors.HexColor("#d5deea")


def p(text, style):
    return Paragraph(text, style)


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="BodyCustom", parent=styles["BodyText"], fontName="DejaVu",
    fontSize=9.2, leading=14, textColor=colors.HexColor("#26344d"),
    spaceAfter=7, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    name="Small", parent=styles["BodyText"], fontName="DejaVu",
    fontSize=7.8, leading=10.5, textColor=SLATE
))
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="DejaVu-Bold",
    fontSize=25, leading=31, textColor=NAVY, alignment=TA_CENTER,
    spaceAfter=16
))
styles.add(ParagraphStyle(
    name="CoverSub", parent=styles["BodyText"], fontName="DejaVu",
    fontSize=12, leading=18, textColor=SLATE, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name="H1Custom", parent=styles["Heading1"], fontName="DejaVu-Bold",
    fontSize=15, leading=20, textColor=NAVY, spaceBefore=8, spaceAfter=10
))
styles.add(ParagraphStyle(
    name="H2Custom", parent=styles["Heading2"], fontName="DejaVu-Bold",
    fontSize=11.5, leading=15, textColor=GREEN, spaceBefore=8, spaceAfter=6
))
styles.add(ParagraphStyle(
    name="Caption", parent=styles["BodyText"], fontName="DejaVu",
    fontSize=8, leading=10, textColor=SLATE, alignment=TA_CENTER,
    spaceBefore=4, spaceAfter=10
))
styles.add(ParagraphStyle(
    name="Quote", parent=styles["BodyText"], fontName="DejaVu",
    fontSize=9.5, leading=14, leftIndent=15, rightIndent=15,
    textColor=colors.HexColor("#33445e"), borderColor=GREEN,
    borderWidth=2, borderPadding=8, spaceBefore=6, spaceAfter=10
))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.line(18 * mm, 15 * mm, PAGE_W - 18 * mm, 15 * mm)
    canvas.setFont("DejaVu", 7.5)
    canvas.setFillColor(SLATE)
    canvas.drawString(18 * mm, 9 * mm, "Campus Event Management Platform")
    canvas.drawRightString(PAGE_W - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def section(title):
    return p(title, styles["H1Custom"])


def subsection(title):
    return p(title, styles["H2Custom"])


def body(text):
    return p(text, styles["BodyCustom"])


def bullet(text):
    return p(f"• {text}", styles["BodyCustom"])


def table(data, widths, header=True):
    converted = []
    for row in data:
        converted.append([
            p(str(cell), styles["Small"]) for cell in row
        ])
    t = Table(converted, colWidths=widths, repeatRows=1 if header else 0,
             hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eeeeee")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ]
    for row_index in range(1 if header else 0, len(data)):
        if row_index % 2 == (1 if header else 0):
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.HexColor("#f7fafc")))
    t.setStyle(TableStyle(commands))
    return t


def screenshot(filename, caption):
    path = ASSETS / filename
    if not path.exists():
        return [body(f"Screenshot unavailable: {filename}")]
    image = Image(str(path))
    max_width = PAGE_W - 36 * mm
    max_height = 102 * mm
    scale = min(max_width / image.imageWidth, max_height / image.imageHeight)
    image.drawWidth = image.imageWidth * scale
    image.drawHeight = image.imageHeight * scale
    return [image, p(caption, styles["Caption"])]


story = []

# Cover
story += [
    Spacer(1, 28 * mm),
    p("Goa College of Engineering", styles["CoverSub"]),
    p("Farmagudi, Ponda - Goa", styles["CoverSub"]),
    Spacer(1, 27 * mm),
    HRFlowable(width="62%", thickness=2, color=GREEN, hAlign="CENTER"),
    Spacer(1, 14 * mm),
    p("PROJECT REPORT", styles["CoverSub"]),
    Spacer(1, 7 * mm),
    p("CAMPUS EVENT MANAGEMENT<br/>PLATFORM", styles["CoverTitle"]),
    p("Events, student registrations, waitlists, attendance and participation analytics backed by MongoDB", styles["CoverSub"]),
    Spacer(1, 30 * mm),
    table([
        ["Prepared by", "Jared John Furtado"],
        ["Project type", "Implemented full-stack web application"],
        ["Technology", "Next.js, Express.js, MongoDB Community Server"],
        ["Report date", "24 November 2026"],
    ], [42 * mm, 92 * mm], header=False),
    Spacer(1, 20 * mm),
    p("Implementation report and demonstration guide", styles["CoverSub"]),
    PageBreak(),
]

# Formal front matter
story += [
    section("PROJECT REPORT"),
    table([
        ["Project", "Campus Event Management Platform"],
        ["Scope", "Event operations for a college campus"],
        ["Frontend", "Next.js App Router, TypeScript, Tailwind CSS, Recharts"],
        ["Backend", "Node.js, Express.js, Zod, official MongoDB Node.js driver"],
        ["Database", "MongoDB Community Server through mongos"],
        ["Deployment", "Docker Compose local sharded cluster"],
        ["Status", "Implemented product prototype ready for demonstration"],
    ], [38 * mm, 96 * mm], header=False),
    Spacer(1, 10),
    subsection("Contents"),
    body("1. Executive Summary<br/>2. Introduction and Background<br/>3. Problem Statement<br/>4. Objectives<br/>5. Proposed Solution<br/>6. Implemented Features<br/>7. MongoDB Design and Implementation<br/>8. Application Workflows<br/>9. Privacy, Validation and Reliability<br/>10. Testing and Current Status<br/>11. Limitations and Future Work<br/>12. Demonstration Plan<br/>Annexure A: Application Screenshots"),
    PageBreak(),
]

# 1
story += [
    section("Executive Summary"),
    body("Campus Event Management Platform is a full-stack application for college event coordinators and student activity teams. It provides one workflow for creating campus events, maintaining student profiles, accepting registrations, managing capacity and waitlists, recording attendance, and reviewing participation analytics."),
    body("The project uses MongoDB as the operational database rather than presenting database features as isolated exercises. The Express backend connects to MongoDB through a mongos router. The data layer uses replica-set shards for availability and sharded collections for horizontal distribution, while the product UI remains focused on event operations."),
    p("The main demonstration is a continuous product workflow: create an event, register students, trigger a waitlisted registration when capacity is full, update attendance, and review the resulting analytics.", styles["Quote"]),
    subsection("Implementation result"),
    bullet("Functional Next.js frontend with Dashboard, Events, Students, Registrations and Analytics pages."),
    bullet("Express API with validated CRUD operations and domain rules."),
    bullet("MongoDB collections, indexes, aggregation joins and analytics pipelines."),
    bullet("Sharded cluster with two three-member data replica sets behind mongos."),
    bullet("Docker-based setup and idempotent seed data for repeatable demonstrations."),
    PageBreak(),
]

# 2-4
story += [
    section("Introduction and Background"),
    body("College events are managed by multiple people across departments, clubs and student activity teams. The coordinator needs a reliable event catalogue, a current student directory, controlled registration capacity, a waitlist, attendance information and useful reports. When these records are spread across separate spreadsheets or forms, duplicate registrations and inaccurate capacity counts become difficult to avoid."),
    body("This project addresses that operational problem through a browser-based application. The frontend provides the coordinator experience, the Express API enforces business rules, and MongoDB stores the domain records and calculates analytics."),
    section("Problem Statement"),
    body("A campus event team needs a single source of truth for events and student participation. The system must prevent duplicate student-event registrations, reject invalid references, handle full events without losing demand, expose readable registration information, and provide reports without manually combining spreadsheets."),
    body("The deployment must also remain dependable as data volume and concurrent access grow. For that reason, the application connects through mongos to a MongoDB cluster where each data shard is a replica set."),
    section("Objectives"),
    bullet("Provide one web workflow for event creation, student management, registrations and attendance."),
    bullet("Apply event capacity rules automatically and create waitlisted registrations when required."),
    bullet("Prevent duplicate registrations using server validation and a compound unique index."),
    bullet("Return readable registration records by joining student and event documents."),
    bullet("Calculate participation and capacity analytics inside MongoDB aggregation pipelines."),
    bullet("Use majority writes, replica-set redundancy and sharding without exposing database administration screens to users."),
    PageBreak(),
]

# 5
story += [
    section("Proposed Solution and Architecture"),
    body("The system follows a three-layer architecture. The browser renders product pages and calls JSON endpoints. The Express API validates input, applies domain rules and builds safe database operations. MongoDB stores and calculates the data through the mongos router."),
    table([
        ["Layer", "Implementation", "Responsibility"],
        ["Frontend", "Next.js, TypeScript, Tailwind CSS, Recharts", "Product pages, forms, tables, charts and loading/error states"],
        ["API", "Node.js, Express, Zod", "Validation, pagination, business rules and response formatting"],
        ["Database access", "Official MongoDB Node.js driver", "Connection pooling, indexes, reads, writes and aggregation"],
        ["Database", "MongoDB Community Server", "Documents, indexes, joins, analytics and distributed storage"],
        ["Infrastructure", "Docker Compose", "mongos, config server, replica sets and sharded collection setup"],
    ], [28 * mm, 52 * mm, 54 * mm]),
    Spacer(1, 8),
    subsection("Deployment topology"),
    body("The application connects to mongos on port 27020. The config replica set uses cfg1 on port 27030. shard1RS contains s1a, s1b and s1c on ports 27111–27113. shard2RS contains s2a on 27124, s2b on 27122 and s2c on 27123. The non-sequential s2a port avoids a host port conflict while the members still use normal Docker DNS names internally."),
    table([
        ["Collection", "Placement", "Shard key / rule"],
        ["departments", "Unsharded on primary shard", "Unique code and name indexes"],
        ["students", "Unsharded on primary shard", "Unique studentId and email indexes"],
        ["events", "Sharded", "Hashed _id for even distribution"],
        ["registrations", "Sharded", "Range studentId + eventId; also unique"],
    ], [32 * mm, 46 * mm, 56 * mm]),
    PageBreak(),
]

# 6
story += [
    section("Implemented Features"),
    table([
        ["Area", "Implemented behaviour"],
        ["Dashboard", "Live student, event, registration and capacity metrics; utilization bars; recent registrations."],
        ["Events", "Create, read, update and delete events; search; category/status filters; dates; venue; capacity; tags; organizer."],
        ["Students", "Student directory; search; department and year filters; profile creation and updates; unique identifiers."],
        ["Registrations", "Student-event validation; duplicate prevention; confirmed and waitlisted statuses; attendance; joined display data."],
        ["Analytics", "Event utilization, department participation, category summaries, status distribution, capacity statistics and recent activity."],
        ["Seed data", "Idempotent base data plus optional tagged volume seed for realistic demonstrations."],
        ["Infrastructure", "Docker Compose cluster, replica-set initialization, sharding rules, majority writes and read preference policy."],
    ], [34 * mm, 100 * mm]),
    Spacer(1, 8),
    subsection("Registration workflow"),
    body("When a registration is submitted, the API validates both referenced documents. It checks the compound student-event uniqueness rule and counts confirmed registrations for the event. If capacity remains, the record is confirmed. If the event is full, it is stored as waitlisted. The same record can later carry attendance and notes."),
    subsection("Readable registration records"),
    body("Registrations store ObjectId references rather than duplicating full student and event documents. The list endpoint uses MongoDB lookup, unwind and project stages to return names, emails, event titles, categories, venues and dates required by the interface."),
    PageBreak(),
]

# 7
story += [
    section("MongoDB Design and Implementation"),
    subsection("Documents and references"),
    body("Departments, students, events and registrations are separate collections. Students contain profile fields and a department reference. Events contain schedule and capacity fields. Registrations reference a student and an event, which keeps the relationship explicit and prevents stale duplicated details."),
    subsection("Indexes"),
    bullet("students: unique studentId, unique email, departmentId and year indexes."),
    bullet("departments: unique code and unique name indexes."),
    bullet("events: status/date, category and capacity indexes."),
    bullet("registrations: unique studentId + eventId, event/status and student/status indexes."),
    subsection("Aggregation"),
    body("Analytics pipelines use match, group, sum, avg, min, max, lookup, unwind, project and sort. MongoDB returns calculated report data; the frontend only visualizes those results with Recharts."),
    subsection("Replication"),
    body("Each data shard is a replica set. One member is primary and accepts writes; the secondaries maintain copies through the oplog. Application writes use majority write concern, which requires acknowledgement from a replica-set majority. If a primary fails, the remaining members can elect a new primary."),
    subsection("Sharding"),
    body("The events collection uses a hashed _id shard key to distribute event documents evenly. Registrations use the range key studentId plus eventId, which aligns with the compound unique index and supports student-oriented targeting. The API connects to mongos, so the browser and backend do not need to choose a shard directly."),
    PageBreak(),
]

# 8-11
story += [
    section("Application Workflows"),
    subsection("Event coordination"),
    body("The coordinator creates an event with title, category, venue, event date, deadline, capacity, status, tags and organizer. Event lists can be searched and filtered. Updates are validated by the API before reaching MongoDB."),
    subsection("Student and department management"),
    body("Student records contain a campus identifier, name, email, department, year, phone and skills. Departments have unique codes and names. These collections are intentionally kept unsharded because they are reference directories with important unique identity indexes."),
    subsection("Registration and attendance"),
    body("The coordinator registers students against events, observes confirmed or waitlisted status, updates attendance after the event and can review joined student/event information in one table."),
    subsection("Analytics"),
    body("Analytics turn operational records into decision support. The coordinator can compare event demand, capacity utilization, department participation, category activity and registration status."),
    section("Privacy, Validation and Reliability"),
    bullet("The browser never connects directly to MongoDB."),
    bullet("The server accepts validated parameters instead of arbitrary MongoDB filters or commands."),
    bullet("Passwords and authentication credentials are not part of the event domain data."),
    bullet("Duplicate registration is protected at both API and database-index levels."),
    bullet("Event deletion is guarded when registrations exist."),
    bullet("Majority writes improve durability across replica-set members."),
    bullet("Analytics use secondaryPreferred because reports can tolerate slight replication lag."),
    bullet("Published Docker ports bind to 127.0.0.1 for local development."),
    section("Testing and Current Status"),
    body("Backend JavaScript syntax checks and automated validation tests pass. Frontend linting and TypeScript checks pass. The Webpack production build passes and exposes the product routes for Dashboard, Events, Students, Registrations and Analytics. The local MongoDB cluster has been started successfully with both replica sets healthy and both sharded collections initialized."),
    PageBreak(),
]

# 12
story += [
    section("Limitations and Future Work"),
    table([
        ["Area", "Current limitation"],
        ["Local topology", "The config server has one member to reduce local resource use; production should use three."],
        ["Capacity race", "Capacity uses a count-then-insert flow; high-concurrency production use may require transactions or a reservation strategy."],
        ["Security", "Authentication and role-based authorization are not implemented in this prototype."],
        ["Operations", "The Docker cluster is for local development and demonstration, not production hosting."],
        ["Product extensions", "Notifications, payments, cloud deployment and advanced administration are outside the current scope."],
    ], [38 * mm, 96 * mm]),
    Spacer(1, 10),
    section("Demonstration Plan"),
    body("The recommended demonstration starts on the Dashboard, moves to Events to create a capacity-limited event, uses Students and Registrations to create a confirmed and a waitlisted registration, updates attendance, and finishes on Analytics to show the resulting reports. The database cluster remains behind the application and can be explained as the infrastructure that provides availability and scale."),
    p("The product story is more important than isolated database commands: demonstrate a real campus event workflow and then explain how MongoDB supports it.", styles["Quote"]),
    PageBreak(),
]

# Annexure screenshots
story += [
    section("Annexure A — Application Screenshots"),
    body("The following screenshots were captured from the running application using live seeded data. They are included as evidence of the implemented product interface."),
]
for filename, caption in [
    ("dashboard.png", "Figure A1. Dashboard with live student, event, registration and capacity metrics."),
    ("events.png", "Figure A2. Events page with the event catalogue and coordinator controls."),
    ("registrations.png", "Figure A3. Registrations page with joined student/event information and status handling."),
    ("analytics.png", "Figure A4. Analytics page with MongoDB-generated participation and capacity reports."),
    ("students.png", "Figure A5. Students page with the campus student directory and filtering controls."),
]:
    story += screenshot(filename, caption)
    story.append(PageBreak())

doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    rightMargin=18 * mm, leftMargin=18 * mm,
    topMargin=17 * mm, bottomMargin=20 * mm,
    title="Campus Event Management Platform — Project Report",
    author="Jared John Furtado",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)

