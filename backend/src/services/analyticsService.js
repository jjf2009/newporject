const { getAnalyticsDB } = require("../config/db");

async function getOverview() {
  const db = getAnalyticsDB();

  const [
    studentCount,
    eventCount,
    confirmedRegistrations,
    upcomingEvents,
    capacityStats,
    statusBreakdown,
  ] = await Promise.all([
    db.collection("students").countDocuments(),
    db.collection("events").countDocuments(),
    db.collection("registrations").countDocuments({ status: "confirmed" }),
    db.collection("events").countDocuments({ status: "upcoming" }),
    db
      .collection("events")
      .aggregate([
        {
          $group: {
            _id: null,
            averageCapacity: { $avg: "$capacity" },
            minCapacity: { $min: "$capacity" },
            maxCapacity: { $max: "$capacity" },
            totalCapacity: { $sum: "$capacity" },
          },
        },
      ])
      .toArray(),
    db
      .collection("registrations")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  const stats = capacityStats[0] || {
    averageCapacity: 0,
    minCapacity: 0,
    maxCapacity: 0,
    totalCapacity: 0,
  };

  return {
    studentCount,
    eventCount,
    confirmedRegistrations,
    upcomingEvents,
    averageCapacity: Math.round(stats.averageCapacity || 0),
    minCapacity: stats.minCapacity || 0,
    maxCapacity: stats.maxCapacity || 0,
    totalCapacity: stats.totalCapacity || 0,
    statusBreakdown,
  };
}

async function getRegistrationsByEvent() {
  const db = getAnalyticsDB();

  // Aggregate: count registrations per event with $match, $group, $lookup, $project, $sort
  const pipeline = [
    {
      $group: {
        _id: "$eventId",
        totalRegistrations: { $sum: 1 },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        waitlistedCount: {
          $sum: { $cond: [{ $eq: ["$status", "waitlisted"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $project: {
        _id: 1,
        eventId: "$_id",
        title: "$event.title",
        category: "$event.category",
        capacity: "$event.capacity",
        status: "$event.status",
        totalRegistrations: 1,
        confirmedCount: 1,
        waitlistedCount: 1,
        utilizationPercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ["$confirmedCount", { $max: ["$event.capacity", 1] }] },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
    { $sort: { confirmedCount: -1 } },
  ];

  const results = await db.collection("registrations").aggregate(pipeline).toArray();
  return results;
}

async function getRegistrationsByDepartment() {
  const db = getAnalyticsDB();

  const pipeline = [
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $group: {
        _id: "$student.departmentName",
        registrationCount: { $sum: 1 },
        uniqueStudents: { $addToSet: "$student._id" },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        registrations: "$registrationCount",
        uniqueStudentsCount: { $size: "$uniqueStudents" },
      },
    },
    { $sort: { registrations: -1 } },
  ];

  const results = await db.collection("registrations").aggregate(pipeline).toArray();
  return results;
}

async function getEventCategorySummary() {
  const db = getAnalyticsDB();

  const pipeline = [
    {
      $group: {
        _id: "$category",
        eventCount: { $sum: 1 },
        totalCapacity: { $sum: "$capacity" },
        avgCapacity: { $avg: "$capacity" },
      },
    },
    { $set: { avgCapacity: { $round: ["$avgCapacity", 0] } } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        eventCount: 1,
        totalCapacity: 1,
        avgCapacity: 1,
      },
    },
    { $sort: { eventCount: -1 } },
  ];

  const results = await db.collection("events").aggregate(pipeline).toArray();
  return results;
}

async function getRecentRegistrations(limit = 10) {
  const db = getAnalyticsDB();
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

  const pipeline = [
    { $sort: { registeredAt: -1 } },
    { $limit: safeLimit },
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
        registeredAt: 1,
        status: 1,
        attendance: 1,
        studentName: "$student.name",
        studentId: "$student.studentId",
        departmentName: "$student.departmentName",
        eventTitle: "$event.title",
        eventCategory: "$event.category",
        eventDate: "$event.eventDate",
      },
    },
  ];

  const results = await db.collection("registrations").aggregate(pipeline).toArray();
  return results;
}

async function getStatusDistribution() {
  const db = getAnalyticsDB();
  return db.collection("registrations").aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray();
}

async function getCapacityStats() {
  const db = getAnalyticsDB();
  return db.collection("events").aggregate([{ $group: { _id: null, averageCapacity: { $avg: "$capacity" }, minCapacity: { $min: "$capacity" }, maxCapacity: { $max: "$capacity" }, totalCapacity: { $sum: "$capacity" } } }]).next();
}

module.exports = {
  getOverview,
  getRegistrationsByEvent,
  getRegistrationsByDepartment,
  getEventCategorySummary,
  getRecentRegistrations,
  getStatusDistribution,
  getCapacityStats,
};
