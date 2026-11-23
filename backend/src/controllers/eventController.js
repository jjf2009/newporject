const eventService = require("../services/eventService");

async function listEvents(req, res, next) {
  try {
    const data = await eventService.listEvents(req.query);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ success: false, message: "Event title is required" });
    }
    const created = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: created, message: "Event created successfully" });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const updated = await eventService.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: updated, message: "Event updated successfully" });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const force = req.query.force === "true";
    const result = await eventService.deleteEvent(req.params.id, force);
    res.json({ success: true, message: "Event deleted successfully", ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
