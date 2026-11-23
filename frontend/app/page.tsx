"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "../components/page-header";
import { StatCard } from "../components/stat-card";
import { LoadingState } from "../components/loading-state";
import {
  getAnalyticsOverview,
  getRegistrationsByEvent,
  getRecentRegistrations,
} from "../lib/api";
import {
  AnalyticsOverview,
  EventRegistrationStat,
  Registration,
} from "../lib/types";
import { formatDate, getStatusBadgeClass } from "../lib/format";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [eventStats, setEventStats] = useState<EventRegistrationStat[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [ovRes, evRes, rcRes] = await Promise.all([
          getAnalyticsOverview(),
          getRegistrationsByEvent(),
          getRecentRegistrations(6),
        ]);
        setOverview(ovRes.data || null);
        setEventStats(evRes.data || []);
        setRecentRegistrations(rcRes.data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard metrics.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Fetching live MongoDB metrics..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h3 className="font-semibold text-lg">Unable to connect to MongoDB API</h3>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs text-rose-600 mt-3 font-mono">
          Ensure the existing `mongodb` Docker container is running and the backend is started on port 5000.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campus Event Command Center"
        subtitle="Real-time event operations, participation metrics, and system health"
      >
        <Link href="/events" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-xs">
          Manage Events →
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={overview?.studentCount ?? 0}
          subtitle="Enrolled campus students"
          badge="students"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Active Events"
          value={overview?.eventCount ?? 0}
          subtitle={`${overview?.upcomingEvents ?? 0} upcoming sessions`}
          badge="events"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Registrations"
          value={overview?.confirmedRegistrations ?? 0}
          subtitle="Confirmed student seats"
          badge="confirmed"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Avg Event Capacity"
          value={overview?.averageCapacity ?? 0}
          subtitle={`Min ${overview?.minCapacity ?? 0} • Max ${overview?.maxCapacity ?? 0}`}
          badge="$avg"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      </div>

      {/* Middle Grid: Event Utilization & Registration Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Fill Rates (Aggregated) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Event Registrations & Utilization</h2>
              <p className="text-xs text-slate-500">Calculated using MongoDB $group & $lookup aggregation</p>
            </div>
            <Link href="/analytics" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View Aggregation →
            </Link>
          </div>

          <div className="space-y-4">
            {eventStats.slice(0, 5).map((evt) => (
              <div key={evt.eventId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{evt.title}</span>
                  <span className="font-mono text-slate-500">
                    {evt.confirmedCount} / {evt.capacity} seats ({evt.utilizationPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      evt.utilizationPercentage >= 90
                        ? "bg-rose-500"
                        : evt.utilizationPercentage >= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, evt.utilizationPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational summary */}
        <div className="bg-slate-900 text-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Operations Overview
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Run campus events in one place</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create events, manage students, process registrations, track attendance, and use analytics to understand participation.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Event capacity and waitlists
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Student and department management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Registration and attendance workflows
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Live participation analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Resilient MongoDB cluster
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/cluster"
              className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs text-center block hover:bg-emerald-400 transition"
            >
              View System Health
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
            <p className="text-xs text-slate-500">Live student signups joined with event documents</p>
          </div>
          <Link href="/registrations" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            All Registrations →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Event</th>
                <th className="py-3 px-5">Registered At</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No registrations found. Run the seed script or register a student.
                  </td>
                </tr>
              ) : (
                recentRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-5 font-semibold text-slate-900">
                      {reg.studentName || "Student"}
                      <span className="block text-[11px] font-normal text-slate-500">{reg.studentId}</span>
                    </td>
                    <td className="py-3 px-5 text-slate-600">{reg.studentDepartment || "-"}</td>
                    <td className="py-3 px-5 text-slate-800 font-medium">{reg.eventTitle || "Event"}</td>
                    <td className="py-3 px-5 text-slate-500">{formatDate(reg.registeredAt)}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                          reg.status
                        )}`}
                      >
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
