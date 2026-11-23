export interface Department {
  _id: string;
  name: string;
  code: string;
  coordinator?: string;
  createdAt?: string;
}

export interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  departmentId?: string;
  departmentName: string;
  year: number;
  phone?: string;
  skills: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type EventCategory =
  | "Technical"
  | "Cultural"
  | "Sports"
  | "Workshop"
  | "Seminar"
  | "Other";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  capacity: number;
  status: EventStatus;
  tags: string[];
  organizer: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";
export type AttendanceStatus = "pending" | "present" | "absent";

export interface Registration {
  _id: string;
  studentId: string;
  eventId: string;
  registeredAt: string;
  status: RegistrationStatus;
  attendance: AttendanceStatus;
  notes?: string;
  studentName?: string;
  studentCode?: string;
  studentEmail?: string;
  studentDepartment?: string;
  studentYear?: number;
  eventTitle?: string;
  eventCategory?: string;
  eventVenue?: string;
  eventDate?: string;
  eventCapacity?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  items: T[];
  pagination: Pagination;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AnalyticsOverview {
  studentCount: number;
  eventCount: number;
  confirmedRegistrations: number;
  upcomingEvents: number;
  averageCapacity: number;
  minCapacity: number;
  maxCapacity: number;
  totalCapacity: number;
  statusBreakdown: { _id: string; count: number }[];
}

export interface EventRegistrationStat {
  eventId: string;
  title: string;
  category: string;
  capacity: number;
  status: string;
  totalRegistrations: number;
  confirmedCount: number;
  waitlistedCount: number;
  utilizationPercentage: number;
}

export interface DepartmentRegistrationStat {
  department: string;
  registrations: number;
  uniqueStudentsCount: number;
}

export interface ReplicaMember {
  id: number;
  name: string;
  stateStr: string;
  health: number;
}

export interface ReplicationStatus {
  active: boolean;
  mode: string;
  setName?: string;
  members?: ReplicaMember[];
  message?: string;
}

export interface ShardingStatus {
  active: boolean;
  mode: string;
  shards?: unknown[];
  message?: string;
  setupGuide?: {
    concepts: string[];
    commands: string[];
  };
}
