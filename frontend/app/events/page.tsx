"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import { EmptyState } from "../../components/empty-state";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../lib/api";
import { Event, EventCategory, EventStatus } from "../../lib/types";
import { formatDate, getCategoryBadgeClass, getStatusBadgeClass } from "../../lib/format";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("eventDate");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical" as EventCategory,
    venue: "",
    eventDate: "",
    capacity: 50,
    status: "upcoming" as EventStatus,
    organizer: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEvents({
        search,
        category,
        status,
        sortBy,
        order,
        page,
        limit: 8,
      });
      setEvents(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch events from MongoDB");
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sortBy, order, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchEvents]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      category: "Technical",
      venue: "Main Auditorium",
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      capacity: 50,
      status: "upcoming",
      organizer: "Student Activity Committee",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      venue: evt.venue,
      eventDate: new Date(evt.eventDate).toISOString().slice(0, 16),
      capacity: evt.capacity,
      status: evt.status,
      organizer: evt.organizer,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, formData);
      } else {
        await createEvent(formData);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save event");
    }
  };

  const handleDelete = async (force = false) => {
    if (!deleteConfirmation) return;
    try {
      await deleteEvent(deleteConfirmation.id, force);
      setDeleteConfirmation(null);
      fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("registration")) {
        if (confirm(`${err.message}\n\nDo you want to FORCE delete this event and remove all attached registrations?`)) {
          handleDelete(true);
        }
      } else {
        alert(err instanceof Error ? err.message : "Failed to delete event");
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Events"
        subtitle="Manage and schedule campus events with MongoDB CRUD and query operators"
      >
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </PageHeader>

      {/* Query Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1 items-center">
          <input
            type="text"
            placeholder="Search events ($regex)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg w-64 focus:outline-emerald-500 bg-slate-50"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Workshop">Workshop</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Seminar">Seminar</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split("-");
              setSortBy(f);
              setOrder(o as "asc" | "desc");
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="eventDate-asc">Sort by Date (Earliest)</option>
            <option value="eventDate-desc">Sort by Date (Latest)</option>
            <option value="capacity-desc">Capacity (High to Low)</option>
            <option value="capacity-asc">Capacity (Low to High)</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing {events.length} of {totalItems} events
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <LoadingState message="Querying events with MongoDB filters..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="Try clearing search filters or create a new event."
          actionText="Create New Event"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Title & Organizer</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Venue</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Capacity</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900">{evt.title}</div>
                      <div className="text-[11px] text-slate-500">{evt.organizer || "Campus Group"}</div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryBadgeClass(evt.category)}`}>
                        {evt.category}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-700">{evt.venue}</td>
                    <td className="py-3 px-5 text-slate-600 font-medium">{formatDate(evt.eventDate)}</td>
                    <td className="py-3 px-5 font-mono text-slate-800">{evt.capacity} seats</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(evt.status)}`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({ id: evt._id, title: evt.title })}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded hover:bg-rose-100 transition"
                      >
                        Delete
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingEvent ? "Edit Event (updateOne)" : "Create Event (insertOne)"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-xs"
                >
                  Save to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Confirm Delete (deleteOne)</h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirmation.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(false)}
                className="px-3 py-1.5 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
