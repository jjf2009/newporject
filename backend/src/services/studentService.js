const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

async function listStudents({
  search,
  departmentId,
  year,
  sortBy = "studentId",
  order = "asc",
  page = 1,
  limit = 10,
}) {
  const db = getDB();
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { studentId: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (departmentId && ObjectId.isValid(departmentId)) {
    filter.departmentId = new ObjectId(departmentId);
  }

  if (year) {
    filter.year = parseInt(year, 10);
  }

  const allowedSortFields = ["studentId", "name", "year", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "studentId";
  const sortDirection = order === "desc" ? -1 : 1;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    db
      .collection("students")
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .toArray(),
    db.collection("students").countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

async function getStudentById(id) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid student ID format");
  }
  const student = await db.collection("students").findOne({ _id: new ObjectId(id) });
  return student;
}

async function createStudent(data) {
  const db = getDB();

  let deptName = data.departmentName || "General Engineering";
  let deptId = null;

  if (data.departmentId && ObjectId.isValid(data.departmentId)) {
    deptId = new ObjectId(data.departmentId);
    const dept = await db.collection("departments").findOne({ _id: deptId });
    if (dept) deptName = dept.name;
  }

  const newStudent = {
    studentId: data.studentId.trim().toUpperCase(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    departmentId: deptId,
    departmentName: deptName,
    year: Number(data.year) || 1,
    phone: data.phone || "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("students").insertOne(newStudent);
  return { ...newStudent, _id: result.insertedId };
}

async function updateStudent(id, updateData) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid student ID format");
  }

  const patch = { ...updateData, updatedAt: new Date() };
  if (patch.year) patch.year = Number(patch.year);
  if (patch.departmentId && ObjectId.isValid(patch.departmentId)) {
    patch.departmentId = new ObjectId(patch.departmentId);
    const dept = await db.collection("departments").findOne({ _id: patch.departmentId });
    if (dept) patch.departmentName = dept.name;
  }
  delete patch._id;

  const result = await db.collection("students").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  return result;
}

async function deleteStudent(id) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid student ID format");
  }

  const studentObjectId = new ObjectId(id);
  await db.collection("registrations").deleteMany({ studentId: studentObjectId });
  const result = await db.collection("students").deleteOne({ _id: studentObjectId });
  return { deleted: result.deletedCount > 0 };
}

async function listDepartments() {
  const db = getDB();
  return db.collection("departments").find().sort({ name: 1 }).toArray();
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  listDepartments,
};
