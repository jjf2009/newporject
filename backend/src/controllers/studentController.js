const studentService = require("../services/studentService");

async function listStudents(req, res, next) {
  try {
    const data = await studentService.listStudents(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const { studentId, name, email } = req.body;
    if (!studentId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "studentId, name, and email are required fields",
      });
    }

    const created = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: created, message: "Student created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate key: A student with this studentId or email already exists.",
      });
    }
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const updated = await studentService.updateStudent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: updated, message: "Student updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate key: studentId or email collision.",
      });
    }
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    res.json({ success: true, message: "Student deleted successfully", ...result });
  } catch (error) {
    next(error);
  }
}

async function listDepartments(req, res, next) {
  try {
    const departments = await studentService.listDepartments();
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  listDepartments,
};
