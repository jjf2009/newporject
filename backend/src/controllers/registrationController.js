const registrationService = require("../services/registrationService");

async function listRegistrations(req, res, next) {
  try {
    const data = await registrationService.listRegistrations(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

async function getRegistrationById(req, res, next) {
  try {
    const registration = await registrationService.getRegistrationById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
}

async function createRegistration(req, res, next) {
  try {
    const { studentId, eventId, notes } = req.body;
    if (!studentId || !eventId) {
      return res.status(400).json({
        success: false,
        message: "studentId and eventId are required",
      });
    }

    const created = await registrationService.createRegistration({ studentId, eventId, notes });
    res.status(201).json({
      success: true,
      data: created,
      message:
        created.status === "waitlisted"
          ? "Event is at capacity; student was placed on the waitlist."
          : "Registration confirmed successfully.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This student is already registered for this event.",
      });
    }
    next(error);
  }
}

async function updateRegistration(req, res, next) {
  try {
    const updated = await registrationService.updateRegistration(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }
    res.json({ success: true, data: updated, message: "Registration updated successfully" });
  } catch (error) {
    next(error);
  }
}

async function deleteRegistration(req, res, next) {
  try {
    const result = await registrationService.deleteRegistration(req.params.id);
    res.json({ success: true, message: "Registration removed successfully", ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
