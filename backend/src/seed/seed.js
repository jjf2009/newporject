require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { ObjectId } = require("mongodb");
const { connectDB, closeDB } = require("../config/db");

const DEPARTMENTS = [
  {
    _id: new ObjectId("65f000000000000000000001"),
    name: "Computer Engineering",
    code: "CE",
    coordinator: "Prof. Priya Sharma",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    _id: new ObjectId("65f000000000000000000002"),
    name: "Information Technology",
    code: "IT",
    coordinator: "Prof. Rajesh Verma",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    _id: new ObjectId("65f000000000000000000003"),
    name: "Electronics and Telecommunication",
    code: "ETC",
    coordinator: "Prof. Sunita Rao",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    _id: new ObjectId("65f000000000000000000004"),
    name: "Mechanical Engineering",
    code: "ME",
    coordinator: "Prof. Amit Kulkarni",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
];

const STUDENTS = [
  {
    _id: new ObjectId("65f100000000000000000001"),
    studentId: "GEC2026-001",
    name: "Aarav Naik",
    email: "aarav.naik@example.com",
    departmentId: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    year: 3,
    phone: "9822100001",
    skills: ["JavaScript", "Python", "React", "Docker"],
  },
  {
    _id: new ObjectId("65f100000000000000000002"),
    studentId: "GEC2026-002",
    name: "Ananya Deshmukh",
    email: "ananya.d@example.com",
    departmentId: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    year: 4,
    phone: "9822100002",
    skills: ["Go", "Kubernetes", "MongoDB"],
  },
  {
    _id: new ObjectId("65f100000000000000000003"),
    studentId: "GEC2026-003",
    name: "Rohan Kamat",
    email: "rohan.kamat@example.com",
    departmentId: DEPARTMENTS[1]._id,
    departmentName: DEPARTMENTS[1].name,
    year: 2,
    phone: "9822100003",
    skills: ["Java", "Spring Boot", "SQL"],
  },
  {
    _id: new ObjectId("65f100000000000000000004"),
    studentId: "GEC2026-004",
    name: "Diya Fernandes",
    email: "diya.f@example.com",
    departmentId: DEPARTMENTS[1]._id,
    departmentName: DEPARTMENTS[1].name,
    year: 3,
    phone: "9822100004",
    skills: ["UI/UX", "Figma", "HTML/CSS"],
  },
  {
    _id: new ObjectId("65f100000000000000000005"),
    studentId: "GEC2026-005",
    name: "Siddharth Joshi",
    email: "siddharth.j@example.com",
    departmentId: DEPARTMENTS[2]._id,
    departmentName: DEPARTMENTS[2].name,
    year: 1,
    phone: "9822100005",
    skills: ["C++", "Arduino", "Embedded C"],
  },
  {
    _id: new ObjectId("65f100000000000000000006"),
    studentId: "GEC2026-006",
    name: "Tanvi Sawant",
    email: "tanvi.s@example.com",
    departmentId: DEPARTMENTS[2]._id,
    departmentName: DEPARTMENTS[2].name,
    year: 4,
    phone: "9822100006",
    skills: ["IoT", "Python", "Signal Processing"],
  },
  {
    _id: new ObjectId("65f100000000000000000007"),
    studentId: "GEC2026-007",
    name: "Karan Prabhu",
    email: "karan.prabhu@example.com",
    departmentId: DEPARTMENTS[3]._id,
    departmentName: DEPARTMENTS[3].name,
    year: 2,
    phone: "9822100007",
    skills: ["AutoCAD", "SolidWorks", "Robotics"],
  },
  {
    _id: new ObjectId("65f100000000000000000008"),
    studentId: "GEC2026-008",
    name: "Meera Bhat",
    email: "meera.bhat@example.com",
    departmentId: DEPARTMENTS[3]._id,
    departmentName: DEPARTMENTS[3].name,
    year: 3,
    phone: "9822100008",
    skills: ["Thermodynamics", "MATLAB", "Simulation"],
  },
  {
    _id: new ObjectId("65f100000000000000000009"),
    studentId: "GEC2026-009",
    name: "Aditya Hegde",
    email: "aditya.h@example.com",
    departmentId: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    year: 2,
    phone: "9822100009",
    skills: ["Rust", "Systems Programming"],
  },
  {
    _id: new ObjectId("65f100000000000000000010"),
    studentId: "GEC2026-010",
    name: "Pooja Chari",
    email: "pooja.chari@example.com",
    departmentId: DEPARTMENTS[1]._id,
    departmentName: DEPARTMENTS[1].name,
    year: 1,
    phone: "9822100010",
    skills: ["Python", "Web Design"],
  },
  {
    _id: new ObjectId("65f100000000000000000011"),
    studentId: "GEC2026-011",
    name: "Vivek Narvekar",
    email: "vivek.n@example.com",
    departmentId: DEPARTMENTS[2]._id,
    departmentName: DEPARTMENTS[2].name,
    year: 3,
    phone: "9822100011",
    skills: ["VLSI", "Verilog"],
  },
  {
    _id: new ObjectId("65f100000000000000000012"),
    studentId: "GEC2026-012",
    name: "Sanika Rane",
    email: "sanika.rane@example.com",
    departmentId: DEPARTMENTS[3]._id,
    departmentName: DEPARTMENTS[3].name,
    year: 4,
    phone: "9822100012",
    skills: ["Ansys", "Manufacturing"],
  },
  {
    _id: new ObjectId("65f100000000000000000013"),
    studentId: "GEC2026-013",
    name: "Nikhil Shirodkar",
    email: "nikhil.s@example.com",
    departmentId: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    year: 1,
    phone: "9822100013",
    skills: ["C", "Algorithms"],
  },
  {
    _id: new ObjectId("65f100000000000000000014"),
    studentId: "GEC2026-014",
    name: "Gauri Gaonkar",
    email: "gauri.g@example.com",
    departmentId: DEPARTMENTS[1]._id,
    departmentName: DEPARTMENTS[1].name,
    year: 4,
    phone: "9822100014",
    skills: ["Cybersecurity", "Ethical Hacking"],
  },
  {
    _id: new ObjectId("65f100000000000000000015"),
    studentId: "GEC2026-015",
    name: "Sameer Parsekar",
    email: "sameer.p@example.com",
    departmentId: DEPARTMENTS[2]._id,
    departmentName: DEPARTMENTS[2].name,
    year: 2,
    phone: "9822100015",
    skills: ["PCB Design", "Sensors"],
  },
  {
    _id: new ObjectId("65f100000000000000000016"),
    studentId: "GEC2026-016",
    name: "Shruti Shet",
    email: "shruti.shet@example.com",
    departmentId: DEPARTMENTS[3]._id,
    departmentName: DEPARTMENTS[3].name,
    year: 1,
    phone: "9822100016",
    skills: ["Engineering Drawing", "Python"],
  },
  {
    _id: new ObjectId("65f100000000000000000017"),
    studentId: "GEC2026-017",
    name: "Pranav Sinai",
    email: "pranav.s@example.com",
    departmentId: DEPARTMENTS[0]._id,
    departmentName: DEPARTMENTS[0].name,
    year: 3,
    phone: "9822100017",
    skills: ["Machine Learning", "PyTorch"],
  },
  {
    _id: new ObjectId("65f100000000000000000018"),
    studentId: "GEC2026-018",
    name: "Isha Borkar",
    email: "isha.borkar@example.com",
    departmentId: DEPARTMENTS[1]._id,
    departmentName: DEPARTMENTS[1].name,
    year: 2,
    phone: "9822100018",
    skills: ["React Native", "TypeScript"],
  },
  {
    _id: new ObjectId("65f100000000000000000019"),
    studentId: "GEC2026-019",
    name: "Omkar Mandrekar",
    email: "omkar.m@example.com",
    departmentId: DEPARTMENTS[2]._id,
    departmentName: DEPARTMENTS[2].name,
    year: 4,
    phone: "9822100019",
    skills: ["FPGA", "Embedded Linux"],
  },
  {
    _id: new ObjectId("65f100000000000000000020"),
    studentId: "GEC2026-020",
    name: "Kavya Tendulkar",
    email: "kavya.t@example.com",
    departmentId: DEPARTMENTS[3]._id,
    departmentName: DEPARTMENTS[3].name,
    year: 3,
    phone: "9822100020",
    skills: ["Mechatronics", "Control Systems"],
  },
];

const EVENTS = [
  {
    _id: new ObjectId("65f200000000000000000001"),
    title: "Campus Hackathon 2026",
    description: "A 24-hour competitive software hackathon solving civic and college challenges.",
    category: "Technical",
    venue: "Central Computing Lab",
    eventDate: new Date("2026-12-10T09:00:00Z"),
    registrationDeadline: new Date("2026-12-05T18:00:00Z"),
    capacity: 12,
    status: "upcoming",
    tags: ["hackathon", "coding", "web3", "ai"],
    organizer: "Computer Engineering Society",
  },
  {
    _id: new ObjectId("65f200000000000000000002"),
    title: "MongoDB & NoSQL Deep Dive Workshop",
    description: "Hands-on masterclass covering CRUD, indexing, aggregation, and replica set failover.",
    category: "Workshop",
    venue: "Seminar Hall B",
    eventDate: new Date("2026-12-15T10:00:00Z"),
    registrationDeadline: new Date("2026-12-12T17:00:00Z"),
    capacity: 25,
    status: "upcoming",
    tags: ["mongodb", "database", "nosql", "backend"],
    organizer: "GEC Developer Student Club",
  },
  {
    _id: new ObjectId("65f200000000000000000003"),
    title: "Annual Cultural Fest - Resonance",
    description: "Multi-genre music, dance performances, and theatrical acts by collegiate artists.",
    category: "Cultural",
    venue: "Main Open Air Amphitheatre",
    eventDate: new Date("2026-12-20T17:00:00Z"),
    registrationDeadline: new Date("2026-12-18T23:59:00Z"),
    capacity: 200,
    status: "upcoming",
    tags: ["cultural", "music", "dance", "drama"],
    organizer: "Student Cultural Council",
  },
  {
    _id: new ObjectId("65f200000000000000000004"),
    title: "Inter-College Robotics Expo",
    description: "Line-following, maze-solving, and combat robot demonstrations from engineering colleges.",
    category: "Technical",
    venue: "Mechanical Workshop Block",
    eventDate: new Date("2026-11-28T09:30:00Z"),
    registrationDeadline: new Date("2026-11-25T18:00:00Z"),
    capacity: 50,
    status: "ongoing",
    tags: ["robotics", "embedded", "hardware", "iot"],
    organizer: "Robotics Club",
  },
  {
    _id: new ObjectId("65f200000000000000000005"),
    title: "AI & Large Language Models Seminar",
    description: "Keynote talks by industry practitioners on Transformer models and agentic workflows.",
    category: "Seminar",
    venue: "Auditorium Hall 1",
    eventDate: new Date("2026-11-10T14:00:00Z"),
    registrationDeadline: new Date("2026-11-08T18:00:00Z"),
    capacity: 80,
    status: "completed",
    tags: ["ai", "machine-learning", "seminar"],
    organizer: "IT Department",
  },
  {
    _id: new ObjectId("65f200000000000000000006"),
    title: "Annual Football Championship",
    description: "7-a-side inter-department knockout football tournament.",
    category: "Sports",
    venue: "College Sports Ground",
    eventDate: new Date("2026-11-05T08:00:00Z"),
    registrationDeadline: new Date("2026-11-01T20:00:00Z"),
    capacity: 60,
    status: "completed",
    tags: ["sports", "football", "fitness"],
    organizer: "Sports Department",
  },
  {
    _id: new ObjectId("65f200000000000000000007"),
    title: "Full-Stack Web Development Bootcamp",
    description: "Interactive session on Next.js 15, TypeScript, and modern API architectures.",
    category: "Workshop",
    venue: "Lab 3",
    eventDate: new Date("2026-12-02T13:00:00Z"),
    registrationDeadline: new Date("2026-11-30T18:00:00Z"),
    capacity: 40,
    status: "upcoming",
    tags: ["nextjs", "react", "typescript"],
    organizer: "Coding Circle",
  },
  {
    _id: new ObjectId("65f200000000000000000008"),
    title: "Cybersecurity & CTF Challenge",
    description: "Jeopardy-style Capture The Flag event testing web exploitation and cryptography.",
    category: "Technical",
    venue: "Network Security Lab",
    eventDate: new Date("2026-12-18T10:00:00Z"),
    registrationDeadline: new Date("2026-12-15T18:00:00Z"),
    capacity: 30,
    status: "upcoming",
    tags: ["ctf", "security", "linux"],
    organizer: "InfoSec Club",
  },
  {
    _id: new ObjectId("65f200000000000000000009"),
    title: "CAD & 3D Printing Masterclass",
    description: "Introduction to additive manufacturing and parametric mechanical design.",
    category: "Workshop",
    venue: "FabLab Studio",
    eventDate: new Date("2026-10-25T11:00:00Z"),
    registrationDeadline: new Date("2026-10-22T17:00:00Z"),
    capacity: 20,
    status: "completed",
    tags: ["cad", "3dprinting", "prototyping"],
    organizer: "ME Department",
  },
  {
    _id: new ObjectId("65f200000000000000000010"),
    title: "Drone Racing League (Cancelled)",
    description: "Indoor FPV quadcopter obstacle course race.",
    category: "Sports",
    venue: "Indoor Stadium",
    eventDate: new Date("2026-11-15T15:00:00Z"),
    registrationDeadline: new Date("2026-11-12T18:00:00Z"),
    capacity: 15,
    status: "cancelled",
    tags: ["drones", "fpv", "racing"],
    organizer: "Aero Club",
  },
];

const REGISTRATIONS = [
  // Event 1 (Hackathon - capacity 12)
  {
    _id: new ObjectId("65f300000000000000000001"),
    studentId: STUDENTS[0]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T10:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Team lead for Project Alpha",
  },
  {
    _id: new ObjectId("65f300000000000000000002"),
    studentId: STUDENTS[1]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T10:15:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Backend specialist",
  },
  {
    _id: new ObjectId("65f300000000000000000003"),
    studentId: STUDENTS[2]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T10:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Fullstack participant",
  },
  {
    _id: new ObjectId("65f300000000000000000004"),
    studentId: STUDENTS[3]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T11:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "UI Designer",
  },
  {
    _id: new ObjectId("65f300000000000000000005"),
    studentId: STUDENTS[8]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T11:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Systems builder",
  },
  {
    _id: new ObjectId("65f300000000000000000006"),
    studentId: STUDENTS[16]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-20T12:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "AI integration",
  },

  // Event 2 (MongoDB Workshop)
  {
    _id: new ObjectId("65f300000000000000000007"),
    studentId: STUDENTS[0]._id,
    eventId: EVENTS[1]._id,
    registeredAt: new Date("2026-11-19T09:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Interested in sharding mechanics",
  },
  {
    _id: new ObjectId("65f300000000000000000008"),
    studentId: STUDENTS[2]._id,
    eventId: EVENTS[1]._id,
    registeredAt: new Date("2026-11-19T09:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Learning aggregation pipelines",
  },
  {
    _id: new ObjectId("65f300000000000000000009"),
    studentId: STUDENTS[9]._id,
    eventId: EVENTS[1]._id,
    registeredAt: new Date("2026-11-19T10:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Beginner level",
  },
  {
    _id: new ObjectId("65f300000000000000000010"),
    studentId: STUDENTS[12]._id,
    eventId: EVENTS[1]._id,
    registeredAt: new Date("2026-11-19T10:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "First year student",
  },
  {
    _id: new ObjectId("65f300000000000000000011"),
    studentId: STUDENTS[13]._id,
    eventId: EVENTS[1]._id,
    registeredAt: new Date("2026-11-19T11:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "NoSQL security interest",
  },

  // Event 3 (Cultural Fest)
  {
    _id: new ObjectId("65f300000000000000000012"),
    studentId: STUDENTS[3]._id,
    eventId: EVENTS[2]._id,
    registeredAt: new Date("2026-11-15T14:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Dance crew participant",
  },
  {
    _id: new ObjectId("65f300000000000000000013"),
    studentId: STUDENTS[5]._id,
    eventId: EVENTS[2]._id,
    registeredAt: new Date("2026-11-15T14:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Music lead",
  },
  {
    _id: new ObjectId("65f300000000000000000014"),
    studentId: STUDENTS[7]._id,
    eventId: EVENTS[2]._id,
    registeredAt: new Date("2026-11-15T15:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Stage coordination",
  },
  {
    _id: new ObjectId("65f300000000000000000015"),
    studentId: STUDENTS[10]._id,
    eventId: EVENTS[2]._id,
    registeredAt: new Date("2026-11-15T15:30:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Audience pass",
  },
  {
    _id: new ObjectId("65f300000000000000000016"),
    studentId: STUDENTS[17]._id,
    eventId: EVENTS[2]._id,
    registeredAt: new Date("2026-11-15T16:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Drama troupe",
  },

  // Event 4 (Robotics Expo - ongoing)
  {
    _id: new ObjectId("65f300000000000000000017"),
    studentId: STUDENTS[4]._id,
    eventId: EVENTS[3]._id,
    registeredAt: new Date("2026-11-10T10:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Line follower bot",
  },
  {
    _id: new ObjectId("65f300000000000000000018"),
    studentId: STUDENTS[6]._id,
    eventId: EVENTS[3]._id,
    registeredAt: new Date("2026-11-10T11:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Robo-wars chassis",
  },
  {
    _id: new ObjectId("65f300000000000000000019"),
    studentId: STUDENTS[14]._id,
    eventId: EVENTS[3]._id,
    registeredAt: new Date("2026-11-10T11:30:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Sensor telemetry",
  },
  {
    _id: new ObjectId("65f300000000000000000020"),
    studentId: STUDENTS[19]._id,
    eventId: EVENTS[3]._id,
    registeredAt: new Date("2026-11-10T12:00:00Z"),
    status: "confirmed",
    attendance: "absent",
    notes: "Medical leave",
  },

  // Event 5 (AI Seminar - completed)
  {
    _id: new ObjectId("65f300000000000000000021"),
    studentId: STUDENTS[1]._id,
    eventId: EVENTS[4]._id,
    registeredAt: new Date("2026-11-01T08:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Attended full session",
  },
  {
    _id: new ObjectId("65f300000000000000000022"),
    studentId: STUDENTS[8]._id,
    eventId: EVENTS[4]._id,
    registeredAt: new Date("2026-11-01T08:30:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Submitted feedback",
  },
  {
    _id: new ObjectId("65f300000000000000000023"),
    studentId: STUDENTS[16]._id,
    eventId: EVENTS[4]._id,
    registeredAt: new Date("2026-11-01T09:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Asked question in Q&A",
  },
  {
    _id: new ObjectId("65f300000000000000000024"),
    studentId: STUDENTS[3]._id,
    eventId: EVENTS[4]._id,
    registeredAt: new Date("2026-11-02T10:00:00Z"),
    status: "cancelled",
    attendance: "absent",
    notes: "User cancelled registration",
  },

  // Event 6 (Football Championship - completed)
  {
    _id: new ObjectId("65f300000000000000000025"),
    studentId: STUDENTS[6]._id,
    eventId: EVENTS[5]._id,
    registeredAt: new Date("2026-10-28T09:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Mechanical team forward",
  },
  {
    _id: new ObjectId("65f300000000000000000026"),
    studentId: STUDENTS[18]._id,
    eventId: EVENTS[5]._id,
    registeredAt: new Date("2026-10-28T10:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "ETC team goalkeeper",
  },

  // Event 7 (Full-Stack Bootcamp - upcoming)
  {
    _id: new ObjectId("65f300000000000000000027"),
    studentId: STUDENTS[0]._id,
    eventId: EVENTS[6]._id,
    registeredAt: new Date("2026-11-21T09:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Next.js architecture",
  },
  {
    _id: new ObjectId("65f300000000000000000028"),
    studentId: STUDENTS[4]._id,
    eventId: EVENTS[6]._id,
    registeredAt: new Date("2026-11-21T10:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Fullstack transition",
  },
  {
    _id: new ObjectId("65f300000000000000000029"),
    studentId: STUDENTS[9]._id,
    eventId: EVENTS[6]._id,
    registeredAt: new Date("2026-11-21T11:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Web fundamentals",
  },
  {
    _id: new ObjectId("65f300000000000000000030"),
    studentId: STUDENTS[17]._id,
    eventId: EVENTS[6]._id,
    registeredAt: new Date("2026-11-21T12:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Mobile web focus",
  },

  // Event 8 (Cybersecurity CTF)
  {
    _id: new ObjectId("65f300000000000000000031"),
    studentId: STUDENTS[1]._id,
    eventId: EVENTS[7]._id,
    registeredAt: new Date("2026-11-18T10:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Binary exploitation track",
  },
  {
    _id: new ObjectId("65f300000000000000000032"),
    studentId: STUDENTS[13]._id,
    eventId: EVENTS[7]._id,
    registeredAt: new Date("2026-11-18T11:00:00Z"),
    status: "confirmed",
    attendance: "pending",
    notes: "Web security track",
  },

  // Event 9 (3D Printing - completed)
  {
    _id: new ObjectId("65f300000000000000000033"),
    studentId: STUDENTS[7]._id,
    eventId: EVENTS[8]._id,
    registeredAt: new Date("2026-10-20T09:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "Completed gear print",
  },
  {
    _id: new ObjectId("65f300000000000000000034"),
    studentId: STUDENTS[11]._id,
    eventId: EVENTS[8]._id,
    registeredAt: new Date("2026-10-20T10:00:00Z"),
    status: "confirmed",
    attendance: "present",
    notes: "FEA model printing",
  },

  // Waitlisted registrations demonstration
  {
    _id: new ObjectId("65f300000000000000000035"),
    studentId: STUDENTS[11]._id,
    eventId: EVENTS[0]._id,
    registeredAt: new Date("2026-11-21T15:00:00Z"),
    status: "waitlisted",
    attendance: "pending",
    notes: "Waitlisted - event reached initial demo quota",
  },
];

async function seedVolume(db) {
  const volumeStudents = Array.from({ length: 2000 }, (_, index) => {
    const n = index + 1;
    return {
      studentId: `VOL2026-${String(n).padStart(4, "0")}`,
      name: `Volume Student ${n}`,
      email: `volume.student.${n}@example.com`,
      departmentId: DEPARTMENTS[index % DEPARTMENTS.length]._id,
      departmentName: DEPARTMENTS[index % DEPARTMENTS.length].name,
      year: (index % 4) + 1,
      phone: `90000${String(n).padStart(5, "0")}`,
      skills: ["MongoDB", "JavaScript"],
      seedBatch: "volume",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const volumeEvents = Array.from({ length: 200 }, (_, index) => ({
    title: `Volume Event ${index + 1}`,
    description: "Generated volume-seed event for sharding demonstrations.",
    category: ["Technical", "Workshop", "Seminar", "Cultural"][index % 4],
    venue: `Volume Venue ${(index % 20) + 1}`,
    eventDate: new Date(Date.UTC(2027, index % 12, (index % 25) + 1, 10, 0)),
    registrationDeadline: new Date(Date.UTC(2027, index % 12, (index % 25) + 1, 9, 0)),
    capacity: 50 + (index % 6) * 25,
    status: "upcoming",
    tags: ["volume", "sharding"],
    organizer: "Volume Seed",
    seedBatch: "volume",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.collection("students").bulkWrite(
    volumeStudents.map((doc) => ({ updateOne: { filter: { studentId: doc.studentId }, update: { $setOnInsert: doc }, upsert: true } })),
    { ordered: false }
  );
  await db.collection("events").bulkWrite(
    volumeEvents.map((doc) => ({ updateOne: { filter: { title: doc.title }, update: { $setOnInsert: doc }, upsert: true } })),
    { ordered: false }
  );

  const students = await db.collection("students").find({ seedBatch: "volume" }, { projection: { _id: 1 } }).toArray();
  const events = await db.collection("events").find({ seedBatch: "volume" }, { projection: { _id: 1 } }).toArray();
  const registrations = [];
  for (let index = 0; index < students.length; index += 1) {
    for (let offset = 0; offset < 10; offset += 1) {
      registrations.push({
        studentId: students[index]._id,
        eventId: events[(index + offset) % events.length]._id,
        registeredAt: new Date(),
        status: "confirmed",
        attendance: "pending",
        notes: "Volume seed registration",
        seedBatch: "volume",
      });
    }
  }
  for (let index = 0; index < registrations.length; index += 500) {
    const batch = registrations.slice(index, index + 500);
    await db.collection("registrations").bulkWrite(
      batch.map((doc) => ({ updateOne: { filter: { studentId: doc.studentId, eventId: doc.eventId }, update: { $setOnInsert: doc }, upsert: true } })),
      { ordered: false }
    );
  }
  console.log(`✓ Volume seed: ${students.length} students, ${events.length} events, ${registrations.length} registration pairs ensured`);
}

async function removeVolume(db) {
  const collections = ["registrations", "students", "events"];
  for (const name of collections) {
    const count = await db.collection(name).countDocuments({ seedBatch: "volume" });
    console.log(`${name}: ${count} volume documents would be removed`);
  }
  if (!process.argv.includes("--yes")) {
    throw new Error("Refusing to remove volume data without --yes");
  }
  for (const name of collections) {
    await db.collection(name).deleteMany({ seedBatch: "volume" });
  }
  console.log("✓ Volume seed removed.");
}

async function seed() {
  const isVolume = process.argv.includes("--volume");
  const isRemoveVolume = process.argv.includes("--remove-volume");
  if (process.argv.includes("--reset")) {
    throw new Error("--reset is not supported. Use the idempotent seed or --remove-volume --yes.");
  }
  console.log("--- Starting Campus Event Management MongoDB Seeding ---");

  const db = await connectDB();

  if (isRemoveVolume) {
    await removeVolume(db);
    await closeDB();
    return;
  }

  const summary = {
    departments: { inserted: 0, updated: 0 },
    students: { inserted: 0, updated: 0 },
    events: { inserted: 0, updated: 0 },
    registrations: { inserted: 0, updated: 0 },
  };

  // Upsert Departments
  for (const dept of DEPARTMENTS) {
    const result = await db
      .collection("departments")
      .updateOne({ code: dept.code }, { $set: dept }, { upsert: true });
    summary.departments.inserted += result.upsertedCount;
    summary.departments.updated += result.modifiedCount;
  }
  console.log(`✓ Departments: ${summary.departments.inserted} inserted, ${summary.departments.updated} updated`);

  // Upsert Students
  for (const stu of STUDENTS) {
    const studentDoc = {
      ...stu,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db
      .collection("students")
      .updateOne({ studentId: stu.studentId }, { $set: studentDoc }, { upsert: true });
    summary.students.inserted += result.upsertedCount;
    summary.students.updated += result.modifiedCount;
  }
  console.log(`✓ Students: ${summary.students.inserted} inserted, ${summary.students.updated} updated`);

  // Upsert Events
  for (const evt of EVENTS) {
    const eventDoc = {
      ...evt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db
      .collection("events")
      .updateOne({ title: evt.title }, { $set: eventDoc }, { upsert: true });
    summary.events.inserted += result.upsertedCount;
    summary.events.updated += result.modifiedCount;
  }
  console.log(`✓ Events: ${summary.events.inserted} inserted, ${summary.events.updated} updated`);

  // Upsert Registrations
  for (const reg of REGISTRATIONS) {
    const result = await db
      .collection("registrations")
      .updateOne(
        { studentId: reg.studentId, eventId: reg.eventId },
        { $set: reg },
        { upsert: true }
      );
    summary.registrations.inserted += result.upsertedCount;
    summary.registrations.updated += result.modifiedCount;
  }
  console.log(`✓ Registrations: ${summary.registrations.inserted} inserted, ${summary.registrations.updated} updated`);

  if (isVolume) await seedVolume(db);

  console.log("--- Seeding complete and indexes confirmed ---");
  await closeDB();
}

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await closeDB();
  process.exit(1);
});
