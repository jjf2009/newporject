const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

async function listEvents({
  search,
  category,
  status,
  sortBy = "eventDate",
  order = "asc",
  page = 1,
  limit = 10,
  minCapacity,
  maxCapacity,
}) {
  const db = getDB();
  const filter = {};

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
      { venue: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (minCapacity !== undefined || maxCapacity !== undefined) {
    filter.capacity = {};
    if (minCapacity !== undefined) filter.capacity.$gte = Number(minCapacity);
    if (maxCapacity !== undefined) filter.capacity.$lte = Number(maxCapacity);
  }

  const allowedSortFields = ["eventDate", "capacity", "title", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "eventDate";
  const sortDirection = order === "desc" ? -1 : 1;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    db
      .collection("events")
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .toArray(),
    db.collection("events").countDocuments(filter),
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

async function getEventById(id) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid event ID format");
  }
  const event = await db.collection("events").findOne({ _id: new ObjectId(id) });
  return event;
}

async function createEvent(data) {
  const db = getDB();
  const newEvent = {
    title: data.title,
    description: data.description || "",
    category: data.category || "Technical",
    venue: data.venue || "Campus Auditorium",
    eventDate: new Date(data.eventDate),
    registrationDeadline: new Date(data.registrationDeadline || data.eventDate),
    capacity: Number(data.capacity) || 50,
    status: data.status || "upcoming",
    tags: Array.isArray(data.tags) ? data.tags : [],
    organizer: data.organizer || "Campus Event Committee",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("events").insertOne(newEvent);
  return { ...newEvent, _id: result.insertedId };
}

async function updateEvent(id, updateData) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid event ID format");
  }

  const patch = { ...updateData, updatedAt: new Date() };
  if (patch.eventDate) patch.eventDate = new Date(patch.eventDate);
  if (patch.registrationDeadline) patch.registrationDeadline = new Date(patch.registrationDeadline);
  if (patch.capacity) patch.capacity = Number(patch.capacity);
  delete patch._id;

  const result = await db.collection("events").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  return result;
}

async function deleteEvent(id, force = false) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid event ID format");
  }

  const eventObjectId = new ObjectId(id);
  const regCount = await db.collection("registrations").countDocuments({ eventId: eventObjectId });

  if (regCount > 0 && !force) {
    const error = new Error(
      `Cannot delete event: ${regCount} student registration(s) exist for this event. Confirm cascade delete if intended.`
    );
    error.status = 400;
    error.registrationsCount = regCount;
    throw error;
  }

  if (regCount > 0 && force) {
    await db.collection("registrations").deleteMany({ eventId: eventObjectId });
  }

  const result = await db.collection("events").deleteOne({ _id: eventObjectId });
  return { deleted: result.deletedCount > 0, deletedRegistrations: regCount };
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
