"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAnalyticsOverview,
  getRegistrationsByEvent,
  getRegistrationsByDepartment,
  getEventCategorySummary,
} from "../../lib/api";
import {
  AnalyticsOverview,
  EventRegistrationStat,
  DepartmentRegistrationStat,
} from "../../lib/types";

const STATUS_COLORS = ["#10b981", "#8b5cf6", "#f43f5e", "#64748b"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [eventStats, setEventStats] = useState<EventRegistrationStat[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentRegistrationStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<
    { category: string; eventCount: number; totalCapacity: number; avgCapacity: number }[]
  >([]);

  const [activePipeline, setActivePipeline] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const [ovRes, evRes, depRes, catRes] = await Promise.all([
          getAnalyticsOverview(),
          getRegistrationsByEvent(),
          getRegistrationsByDepartment(),
          getEventCategorySummary(),
        ]);
        setOverview(ovRes.data || null);
        setEventStats(evRes.data || []);
        setDepartmentStats(depRes.data || []);
        setCategoryStats(catRes.data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load analytics");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating aggregation pipelines ($match, $group, $lookup)..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Aggregation & Analytics Lab"
        subtitle="Live statistical aggregations powered directly by MongoDB pipeline stages"
      />

      {/* Capacity & Statistical Accumulators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">$avg Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{overview?.averageCapacity ?? 0} seats</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Average per event</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">$min Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{overview?.minCapacity ?? 0} seats</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Smallest single event</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">$max Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{overview?.maxCapacity ?? 0} seats</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Largest venue event</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">$sum Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{overview?.totalCapacity ?? 0} seats</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Total campus event quota</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Registrations by Event</h2>
            <p className="text-xs text-slate-500">Live $group and $lookup result</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats.slice(0, 8)} margin={{ top: 8, right: 8, left: -16, bottom: 42 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="title" angle={-35} textAnchor="end" interval={0} height={70} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="confirmedCount" name="Confirmed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waitlistedCount" name="Waitlisted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Registration Status Distribution</h2>
            <p className="text-xs text-slate-500">Live $group result from registrations</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(overview?.statusBreakdown || []).map((item) => ({ status: item._id, count: item.count }))}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(overview?.statusBreakdown || []).map((item, index) => (
                    <Cell key={item._id} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Registrations by Department</h2>
          <p className="text-xs text-slate-500">Live $lookup, $unwind, $group, and $sort result</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentStats} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="registrations" name="Registrations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations by Department & Pipeline Modal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registrations by Department</h2>
              <p className="text-xs text-slate-500">Joined across students & registrations collections</p>
            </div>
            <button
              onClick={() =>
                setActivePipeline(
                  activePipeline === "dept"
                    ? null
                    : `db.registrations.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $group: {
      _id: "$student.departmentName",
      registrationCount: { $sum: 1 },
      uniqueStudents: { $addToSet: "$student._id" }
    }
  },
  {
    $project: {
      department: "$_id",
      registrations: "$registrationCount",
      uniqueStudentsCount: { $size: "$uniqueStudents" }
    }
  },
  { $sort: { registrations: -1 } }
]);`
                )
              }
              className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
            >
              {activePipeline === "dept" ? "Hide Pipeline" : "View Pipeline"}
            </button>
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept) => {
              const maxRegs = Math.max(...departmentStats.map((d) => d.registrations), 1);
              const pct = Math.round((dept.registrations / maxRegs) * 100);

              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.department}</span>
                    <span className="font-mono text-slate-500">
                      {dept.registrations} regs ({dept.uniqueStudentsCount} students)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {activePipeline === "dept" && (
            <div className="mt-5 p-4 bg-slate-900 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
              <pre>{activePipeline}</pre>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Event Category Breakdown</h2>
              <p className="text-xs text-slate-500">Event count and total capacity per category</p>
            </div>
            <button
              onClick={() =>
                setActivePipeline(
                  activePipeline === "cat"
                    ? null
                    : `db.events.aggregate([
  {
    $group: {
      _id: "$category",
      eventCount: { $sum: 1 },
      totalCapacity: { $sum: "$capacity" },
      avgCapacity: { $round: [{ $avg: "$capacity" }, 0] }
    }
  },
  { $sort: { eventCount: -1 } }
]);`
                )
              }
              className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
            >
              {activePipeline === "cat" ? "Hide Pipeline" : "View Pipeline"}
            </button>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{cat.category}</div>
                  <div className="text-[11px] text-slate-500">Avg capacity: {cat.avgCapacity} seats</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">{cat.eventCount} events</div>
                  <div className="text-[11px] font-mono text-slate-500">{cat.totalCapacity} total seats</div>
                </div>
              </div>
            ))}
          </div>

          {activePipeline === "cat" && (
            <div className="mt-5 p-4 bg-slate-900 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
              <pre>{activePipeline}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Event Registrations Full Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Event Enrollment Utilization Summary</h2>
            <p className="text-xs text-slate-500">Real-time count of confirmed vs waitlisted registrations</p>
          </div>
          <button
            onClick={() =>
              setActivePipeline(
                activePipeline === "event"
                  ? null
                  : `db.registrations.aggregate([
  {
    $group: {
      _id: "$eventId",
      totalRegistrations: { $sum: 1 },
      confirmedCount: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
      waitlistedCount: { $sum: { $cond: [{ $eq: ["$status", "waitlisted"] }, 1, 0] } }
    }
  },
  {
    $lookup: {
      from: "events",
      localField: "_id",
      foreignField: "_id",
      as: "event"
    }
  },
  { $unwind: "$event" },
  { $sort: { confirmedCount: -1 } }
]);`
              )
            }
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-700 hover:bg-slate-200"
          >
            {activePipeline === "event" ? "Hide Pipeline" : "View Pipeline"}
          </button>
        </div>

        {activePipeline === "event" && (
          <div className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border-b border-slate-200">
            <pre>{activePipeline}</pre>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Event Title</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Confirmed</th>
                <th className="py-3 px-5">Waitlisted</th>
                <th className="py-3 px-5">Capacity</th>
                <th className="py-3 px-5">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventStats.map((evt) => (
                <tr key={evt.eventId} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-5 font-bold text-slate-900">{evt.title}</td>
                  <td className="py-3 px-5 text-slate-600">{evt.category}</td>
                  <td className="py-3 px-5 font-mono text-emerald-700 font-semibold">{evt.confirmedCount}</td>
                  <td className="py-3 px-5 font-mono text-purple-700 font-semibold">{evt.waitlistedCount}</td>
                  <td className="py-3 px-5 font-mono text-slate-700">{evt.capacity}</td>
                  <td className="py-3 px-5">
                    <span className="font-mono font-semibold text-slate-900">{evt.utilizationPercentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
