"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import { EmptyState } from "../../components/empty-state";
import {
  getRegistrations,
  getEvents,
  getStudents,
  createRegistration,
  updateRegistration,
  deleteRegistration,
} from "../../lib/api";
import { Registration, Event, Student } from "../../lib/types";
import { formatDate, getStatusBadgeClass } from "../../lib/format";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAttendance, setSelectedAttendance] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // New Registration Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStudentId, setModalStudentId] = useState("");
  const [modalEventId, setModalEventId] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [regRes, evtRes, stuRes] = await Promise.all([
        getRegistrations({
          eventId: selectedEventId,
          status: selectedStatus,
          attendance: selectedAttendance,
          page,
          limit: 10,
        }),
        getEvents({ limit: 50 }),
        getStudents({ limit: 50 }),
      ]);
      setRegistrations(regRes.items || []);
      setTotalPages(regRes.pagination?.totalPages || 1);
      setTotalItems(regRes.pagination?.total || 0);
      setEvents(evtRes.items || []);
      setStudents(stuRes.items || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch registrations");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedStatus, selectedAttendance, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchRegistrations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchRegistrations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStudentId || !modalEventId) return;

    try {
      setSubmitting(true);
      const res = await createRegistration({
        studentId: modalStudentId,
        eventId: modalEventId,
        notes: modalNotes,
      });
      alert(res.message || "Registration created!");
      setIsModalOpen(false);
      setModalNotes("");
      fetchRegistrations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRegistration(id, { status: newStatus });
      fetchRegistrations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleAttendanceChange = async (id: string, newAttendance: string) => {
    try {
      await updateRegistration(id, { attendance: newAttendance });
      fetchRegistrations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update attendance");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this registration document?")) return;
    try {
      await deleteRegistration(id);
      fetchRegistrations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Registrations"
        subtitle="Manage student event enrollments joined via MongoDB $lookup & $unwind pipeline"
      >
        <button
          onClick={() => {
            setModalStudentId(students[0]?._id || "");
            setModalEventId(events[0]?._id || "");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Student
        </button>
      </PageHeader>

      {/* Query Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1 items-center">
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700 max-w-xs"
          >
            <option value="">All Events</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedAttendance}
            onChange={(e) => {
              setSelectedAttendance(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Attendance</option>
            <option value="pending">Pending</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing {registrations.length} of {totalItems} registrations
        </div>
      </div>

      {/* Registrations Table */}
      {loading ? (
        <LoadingState message="Executing $lookup aggregation join..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error}
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No registrations found"
          description="Try selecting a different filter or register a student for an event."
          actionText="Register a Student"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Student ($lookup)</th>
                  <th className="py-3 px-5">Event ($lookup)</th>
                  <th className="py-3 px-5">Registered Date</th>
                  <th className="py-3 px-5">Status (updateOne)</th>
                  <th className="py-3 px-5">Attendance</th>
                  <th className="py-3 px-5">Notes</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900">{reg.studentName || "Student"}</div>
                      <div className="text-[11px] font-mono text-emerald-700">{reg.studentCode}</div>
                      <div className="text-[11px] text-slate-400">{reg.studentDepartment}</div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-800">{reg.eventTitle || "Event"}</div>
                      <div className="text-[11px] text-slate-500">{reg.eventCategory}</div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-mono">{formatDate(reg.registeredAt)}</td>
                    <td className="py-3 px-5">
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-md border ${getStatusBadgeClass(
                          reg.status
                        )}`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="waitlisted">Waitlisted</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-5">
                      <select
                        value={reg.attendance}
                        onChange={(e) => handleAttendanceChange(reg._id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-md border ${getStatusBadgeClass(
                          reg.attendance
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td className="py-3 px-5 text-slate-500 max-w-xs truncate">{reg.notes || "-"}</td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleDelete(reg._id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded hover:bg-rose-100 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Register Student for Event</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enforces compound unique index ({`{ studentId: 1, eventId: 1 }`}) and capacity validation.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={modalStudentId}
                  onChange={(e) => setModalStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentId} - {s.name} ({s.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Event *</label>
                <select
                  required
                  value={modalEventId}
                  onChange={(e) => setModalEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} ({e.capacity} seats, {e.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Special accommodations or project title"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Confirming..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
