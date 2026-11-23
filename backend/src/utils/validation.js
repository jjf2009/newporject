const { ObjectId } = require("mongodb");
const { z } = require("zod");

const objectId = z.string().refine((value) => ObjectId.isValid(value), {
  message: "Must be a valid MongoDB ObjectId",
});

const eventCategory = z.enum([
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Other",
]);
const eventStatus = z.enum(["upcoming", "ongoing", "completed", "cancelled"]);
const registrationStatus = z.enum(["confirmed", "waitlisted", "cancelled"]);
const attendanceStatus = z.enum(["pending", "present", "absent"]);
const dateValue = z.coerce.date({ invalid_type_error: "Must be a valid date" });
const positiveInteger = z.coerce.number().int().positive();

const eventFields = {
  title: z.string().trim().min(1, "Event title is required"),
  description: z.string().trim().optional(),
  category: eventCategory.optional(),
  venue: z.string().trim().min(1).optional(),
  eventDate: dateValue,
  registrationDeadline: dateValue.optional(),
  capacity: positiveInteger,
  status: eventStatus.optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  organizer: z.string().trim().min(1).optional(),
};

const studentFields = {
  studentId: z.string().trim().min(1, "Student ID is required"),
  name: z.string().trim().min(1, "Student name is required"),
  email: z.string().trim().email("Must be a valid email address"),
  departmentId: objectId.optional(),
  departmentName: z.string().trim().min(1).optional(),
  year: z.coerce.number().int().min(1).max(4),
  phone: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
};

const pagination = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

const eventListQuery = z.object({
  search: z.string().trim().optional(),
  category: eventCategory.optional(),
  status: eventStatus.optional(),
  sortBy: z.enum(["eventDate", "capacity", "title", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  minCapacity: z.coerce.number().int().nonnegative().optional(),
  maxCapacity: z.coerce.number().int().nonnegative().optional(),
  ...pagination,
});

const studentListQuery = z.object({
  search: z.string().trim().optional(),
  departmentId: objectId.optional(),
  year: z.coerce.number().int().min(1).max(4).optional(),
  sortBy: z.enum(["studentId", "name", "year", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  ...pagination,
});

const registrationListQuery = z.object({
  eventId: objectId.optional(),
  studentId: objectId.optional(),
  status: registrationStatus.optional(),
  attendance: attendanceStatus.optional(),
  ...pagination,
});

const recentRegistrationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const eventCreate = z.object(eventFields);
const eventUpdate = z.object(eventFields).partial();
const studentCreate = z.object(studentFields);
const studentUpdate = z.object(studentFields).partial();
const registrationCreate = z.object({
  studentId: objectId,
  eventId: objectId,
  notes: z.string().trim().max(500).optional(),
});
const registrationUpdate = z
  .object({
    status: registrationStatus.optional(),
    attendance: attendanceStatus.optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one registration field is required",
  });
const departmentCreate = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1).max(10),
  coordinator: z.string().trim().optional(),
});
const departmentUpdate = departmentCreate.partial();

function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req[source] = result.data;
    next();
  };
}

function validateObjectIdParam(paramName) {
  return validate(z.object({ [paramName]: objectId }), "params");
}

module.exports = {
  eventCreate,
  eventUpdate,
  eventListQuery,
  studentCreate,
  studentUpdate,
  studentListQuery,
  registrationCreate,
  registrationUpdate,
  departmentCreate,
  departmentUpdate,
  registrationListQuery,
  recentRegistrationQuery,
  validate,
  validateObjectIdParam,
};
