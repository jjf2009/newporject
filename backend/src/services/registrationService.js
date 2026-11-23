const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

async function listRegistrations({
  eventId,
  studentId,
  status,
  attendance,
  page = 1,
  limit = 10,
}) {
  const db = getDB();
  const matchStage = {};

  if (eventId && ObjectId.isValid(eventId)) {
    matchStage.eventId = new ObjectId(eventId);
  }
  if (studentId && ObjectId.isValid(studentId)) {
    matchStage.studentId = new ObjectId(studentId);
  }
  if (status) {
    matchStage.status = status;
  }
  if (attendance) {
    matchStage.attendance = attendance;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Real MongoDB Aggregation with $lookup, $unwind, $project, $sort
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        studentId: 1,
        eventId: 1,
        registeredAt: 1,
        status: 1,
        attendance: 1,
        notes: 1,
        studentName: "$student.name",
        studentCode: "$student.studentId",
        studentEmail: "$student.email",
        studentDepartment: "$student.departmentName",
        studentYear: "$student.year",
        eventTitle: "$event.title",
        eventCategory: "$event.category",
        eventVenue: "$event.venue",
        eventDate: "$event.eventDate",
        eventCapacity: "$event.capacity",
      },
    },
    { $sort: { registeredAt: -1 } },
  ];

  const countPipeline = [{ $match: matchStage }, { $count: "total" }];

  const [items, countResult] = await Promise.all([
    db
      .collection("registrations")
      .aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }])
      .toArray(),
    db.collection("registrations").aggregate(countPipeline).toArray(),
  ]);

  const total = countResult[0] ? countResult[0].total : 0;

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

async function getRegistrationById(id) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid registration ID format");
  }

  const pipeline = [
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
  ];

  const results = await db.collection("registrations").aggregate(pipeline).toArray();
  return results[0] || null;
}

async function createRegistration({ studentId, eventId, notes = "" }) {
  const db = getDB();

  if (!ObjectId.isValid(studentId) || !ObjectId.isValid(eventId)) {
    const error = new Error("Valid studentId and eventId are required");
    error.status = 400;
    throw error;
  }

  const studentObjId = new ObjectId(studentId);
  const eventObjId = new ObjectId(eventId);

  // 1. Verify student exists
  const student = await db.collection("students").findOne({ _id: studentObjId });
  if (!student) {
    const error = new Error("Referenced student not found");
    error.status = 404;
    throw error;
  }

  // 2. Verify event exists
  const event = await db.collection("events").findOne({ _id: eventObjId });
  if (!event) {
    const error = new Error("Referenced event not found");
    error.status = 404;
    throw error;
  }

  // 3. Check for existing duplicate registration
  const existing = await db
    .collection("registrations")
    .findOne({ studentId: studentObjId, eventId: eventObjId });
  if (existing) {
    const error = new Error("Student is already registered for this event");
    error.status = 409;
    throw error;
  }

  // 4. Check capacity to determine confirmed vs waitlisted status
  const confirmedCount = await db.collection("registrations").countDocuments({
    eventId: eventObjId,
    status: "confirmed",
  });

  const status = confirmedCount >= event.capacity ? "waitlisted" : "confirmed";

  const newDoc = {
    studentId: studentObjId,
    eventId: eventObjId,
    registeredAt: new Date(),
    status,
    attendance: "pending",
    notes: notes || (status === "waitlisted" ? "Auto-waitlisted due to capacity reached" : ""),
  };

  const result = await db.collection("registrations").insertOne(newDoc);
  return { ...newDoc, _id: result.insertedId, student, event };
}

async function updateRegistration(id, updateData) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid registration ID format");
  }

  const patch = {};
  if (updateData.status && ["confirmed", "waitlisted", "cancelled"].includes(updateData.status)) {
    patch.status = updateData.status;
  }
  if (updateData.attendance && ["pending", "present", "absent"].includes(updateData.attendance)) {
    patch.attendance = updateData.attendance;
  }
  if (updateData.notes !== undefined) {
    patch.notes = updateData.notes;
  }

  const result = await db.collection("registrations").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: patch },
    { returnDocument: "after" }
  );

  return result;
}

async function deleteRegistration(id) {
  const db = getDB();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid registration ID format");
  }

  const result = await db.collection("registrations").deleteOne({ _id: new ObjectId(id) });
  return { deleted: result.deletedCount > 0 };
}

module.exports = {
  listRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
