const analyticsService = require("../services/analyticsService");

async function getOverview(req, res, next) {
  try {
    const data = await analyticsService.getOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getRegistrationsByEvent(req, res, next) {
  try {
    const data = await analyticsService.getRegistrationsByEvent();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getRegistrationsByDepartment(req, res, next) {
  try {
    const data = await analyticsService.getRegistrationsByDepartment();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getEventCategorySummary(req, res, next) {
  try {
    const data = await analyticsService.getEventCategorySummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getRecentRegistrations(req, res, next) {
  try {
    const limit = req.query.limit || 10;
    const data = await analyticsService.getRecentRegistrations(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getStatusDistribution(req, res, next) { try { res.json({ success: true, data: await analyticsService.getStatusDistribution() }); } catch (error) { next(error); } }
async function getCapacityStats(req, res, next) { try { res.json({ success: true, data: await analyticsService.getCapacityStats() }); } catch (error) { next(error); } }

module.exports = {
  getOverview,
  getRegistrationsByEvent,
  getRegistrationsByDepartment,
  getEventCategorySummary,
  getRecentRegistrations,
  getStatusDistribution,
  getCapacityStats,
};
