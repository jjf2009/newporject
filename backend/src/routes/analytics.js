const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { recentRegistrationQuery, validate } = require("../utils/validation");

router.get("/overview", analyticsController.getOverview);
router.get("/registrations-by-event", analyticsController.getRegistrationsByEvent);
router.get("/registrations-by-department", analyticsController.getRegistrationsByDepartment);
router.get("/event-category-summary", analyticsController.getEventCategorySummary);
router.get("/status-distribution", analyticsController.getStatusDistribution);
router.get("/capacity-stats", analyticsController.getCapacityStats);
router.get("/recent-registrations", validate(recentRegistrationQuery, "query"), analyticsController.getRecentRegistrations);

module.exports = router;
