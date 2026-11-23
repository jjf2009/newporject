const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const {
  registrationCreate,
  registrationUpdate,
  registrationListQuery,
  validate,
  validateObjectIdParam,
} = require("../utils/validation");

router.get("/", validate(registrationListQuery, "query"), registrationController.listRegistrations);
router.get("/:id", validateObjectIdParam("id"), registrationController.getRegistrationById);
router.post("/", validate(registrationCreate), registrationController.createRegistration);
router.patch("/:id", validateObjectIdParam("id"), validate(registrationUpdate), registrationController.updateRegistration);
router.delete("/:id", validateObjectIdParam("id"), registrationController.deleteRegistration);

module.exports = router;
