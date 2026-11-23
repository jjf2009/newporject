const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const {
  studentCreate,
  studentUpdate,
  studentListQuery,
  validate,
  validateObjectIdParam,
} = require("../utils/validation");

router.get("/departments", studentController.listDepartments);
router.get("/", validate(studentListQuery, "query"), studentController.listStudents);
router.get("/:id", validateObjectIdParam("id"), studentController.getStudentById);
router.post("/", validate(studentCreate), studentController.createStudent);
router.patch("/:id", validateObjectIdParam("id"), validate(studentUpdate), studentController.updateStudent);
router.delete("/:id", validateObjectIdParam("id"), studentController.deleteStudent);

module.exports = router;
