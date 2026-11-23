const express = require("express");
const router = express.Router();
const controller = require("../controllers/departmentController");
const { departmentCreate, departmentUpdate, validate, validateObjectIdParam } = require("../utils/validation");

router.get("/", controller.list);
router.post("/", validate(departmentCreate), controller.create);
router.patch("/:id", validateObjectIdParam("id"), validate(departmentUpdate), controller.update);
router.delete("/:id", validateObjectIdParam("id"), controller.remove);

module.exports = router;
