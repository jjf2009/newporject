import {
  ApiResponse,
  PaginatedResponse,
  Event,
  Student,
  Registration,
  Department,
  AnalyticsOverview,
  EventRegistrationStat,
  DepartmentRegistrationStat,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message || `Request failed with status ${response.status}`);
    }

    return body as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unexpected network error occurred");
  }
}

// Events API
export async function getEvents(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiRequest<PaginatedResponse<Event>>(`/events${query ? `?${query}` : ""}`);
}

export async function getEvent(id: string) {
  return apiRequest<ApiResponse<Event>>(`/events/${id}`);
}

export async function createEvent(data: Partial<Event>) {
  return apiRequest<ApiResponse<Event>>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: string, data: Partial<Event>) {
  return apiRequest<ApiResponse<Event>>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string, force = false) {
  return apiRequest<ApiResponse<{ deleted: boolean }>>(`/events/${id}${force ? "?force=true" : ""}`, {
    method: "DELETE",
  });
}

// Students API
export async function getStudents(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiRequest<PaginatedResponse<Student>>(`/students${query ? `?${query}` : ""}`);
}

export async function getDepartments() {
  return apiRequest<ApiResponse<Department[]>>("/students/departments");
}

export async function createStudent(data: Partial<Student>) {
  return apiRequest<ApiResponse<Student>>("/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id: string, data: Partial<Student>) {
  return apiRequest<ApiResponse<Student>>(`/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id: string) {
  return apiRequest<ApiResponse<{ deleted: boolean }>>(`/students/${id}`, {
    method: "DELETE",
  });
}

// Registrations API
export async function getRegistrations(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return apiRequest<PaginatedResponse<Registration>>(`/registrations${query ? `?${query}` : ""}`);
}

export async function createRegistration(data: { studentId: string; eventId: string; notes?: string }) {
  return apiRequest<ApiResponse<Registration>>("/registrations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRegistration(
  id: string,
  data: { status?: string; attendance?: string; notes?: string }
) {
  return apiRequest<ApiResponse<Registration>>(`/registrations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRegistration(id: string) {
  return apiRequest<ApiResponse<{ deleted: boolean }>>(`/registrations/${id}`, {
    method: "DELETE",
  });
}

// Analytics API
export async function getAnalyticsOverview() {
  return apiRequest<ApiResponse<AnalyticsOverview>>("/analytics/overview");
}

export async function getRegistrationsByEvent() {
  return apiRequest<ApiResponse<EventRegistrationStat[]>>("/analytics/registrations-by-event");
}

export async function getRegistrationsByDepartment() {
  return apiRequest<ApiResponse<DepartmentRegistrationStat[]>>("/analytics/registrations-by-department");
}

export async function getEventCategorySummary() {
  return apiRequest<ApiResponse<{ category: string; eventCount: number; totalCapacity: number; avgCapacity: number }[]>>(
    "/analytics/event-category-summary"
  );
}

export async function getRecentRegistrations(limit = 10) {
  return apiRequest<ApiResponse<Registration[]>>(`/analytics/recent-registrations?limit=${limit}`);
}

