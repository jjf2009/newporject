"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import { EmptyState } from "../../components/empty-state";
import {
  getStudents,
  getDepartments,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../lib/api";
import { Student, Department } from "../../lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("studentId");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    departmentId: "",
    year: 1,
    phone: "",
    skills: "",
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [studRes, deptRes] = await Promise.all([
        getStudents({
          search,
          departmentId,
          year,
          sortBy,
          order,
          page,
          limit: 10,
        }),
        getDepartments(),
      ]);
      setStudents(studRes.items || []);
      setTotalPages(studRes.pagination?.totalPages || 1);
      setTotalItems(studRes.pagination?.total || 0);
      setDepartments(deptRes.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch students from MongoDB");
      }
    } finally {
      setLoading(false);
    }
  }, [search, departmentId, year, sortBy, order, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStudents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchStudents]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      studentId: `GEC2026-${String(totalItems + 1).padStart(3, "0")}`,
      name: "",
      email: "",
      departmentId: departments[0]?._id || "",
      year: 1,
      phone: "",
      skills: "JavaScript, Python",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      studentId: stu.studentId,
      name: stu.name,
      email: stu.email,
      departmentId: stu.departmentId || "",
      year: stu.year,
      phone: stu.phone || "",
      skills: stu.skills ? stu.skills.join(", ") : "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: formData.studentId,
        name: formData.name,
        email: formData.email,
        departmentId: formData.departmentId,
        year: Number(formData.year),
        phone: formData.phone,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingStudent) {
        await updateStudent(editingStudent._id, payload);
      } else {
        await createStudent(payload);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save student");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteStudent(deleteConfirmation.id);
      setDeleteConfirmation(null);
      fetchStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        subtitle="Manage student profiles, enforce compound index constraints, and track skillsets"
      >
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Enroll Student
        </button>
      </PageHeader>

      {/* Query Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1 items-center">
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg w-64 focus:outline-emerald-500 bg-slate-50"
          />

          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="">All Years</option>
            <option value="1">Year 1 (FE)</option>
            <option value="2">Year 2 (SE)</option>
            <option value="3">Year 3 (TE)</option>
            <option value="4">Year 4 (BE)</option>
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
            <option value="studentId-asc">Sort by ID (Ascending)</option>
            <option value="studentId-desc">Sort by ID (Descending)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="year-desc">Year (4 down to 1)</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing {students.length} of {totalItems} enrolled students
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingState message="Executing students.find() query..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try broadening search filters or enroll a new student."
          actionText="Enroll New Student"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Student ID & Name</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Year</th>
                  <th className="py-3 px-5">Email / Phone</th>
                  <th className="py-3 px-5">Skills (BSON Array)</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {stu.studentId}
                      </span>
                      <div className="font-bold text-slate-900 mt-1">{stu.name}</div>
                    </td>
                    <td className="py-3 px-5 text-slate-700 font-medium">{stu.departmentName}</td>
                    <td className="py-3 px-5 font-mono text-slate-600">Year {stu.year}</td>
                    <td className="py-3 px-5 text-slate-600">
                      <div>{stu.email}</div>
                      <div className="text-[11px] text-slate-400">{stu.phone || "-"}</div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {stu.skills?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(stu)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({ id: stu._id, name: stu.name })}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingStudent ? "Edit Student Details" : "Enroll New Student (insertOne)"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student ID (Unique Index) *</label>
                  <input
                    required
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Unique Index) *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year (1 - 4)</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills (Comma-separated Array)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, Go, Docker"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
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
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Student (deleteOne)</h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to remove <span className="font-semibold">{deleteConfirmation.name}</span> and their registrations?
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
