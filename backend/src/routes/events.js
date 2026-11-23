const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  eventCreate,
  eventUpdate,
  eventListQuery,
  validate,
  validateObjectIdParam,
} = require("../utils/validation");

router.get("/", validate(eventListQuery, "query"), eventController.listEvents);
router.get("/:id", validateObjectIdParam("id"), eventController.getEventById);
router.post("/", validate(eventCreate), eventController.createEvent);
router.patch("/:id", validateObjectIdParam("id"), validate(eventUpdate), eventController.updateEvent);
router.delete("/:id", validateObjectIdParam("id"), eventController.deleteEvent);

module.exports = router;
