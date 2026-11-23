const assert = require("node:assert/strict");
const test = require("node:test");

const {
  eventCreate,
  eventListQuery,
  registrationUpdate,
  studentCreate,
} = require("../src/utils/validation");

test("accepts a valid event payload", () => {
  const result = eventCreate.safeParse({
    title: "MongoDB Workshop",
    eventDate: "2026-12-10T09:00:00.000Z",
    registrationDeadline: "2026-12-05T18:00:00.000Z",
    capacity: 50,
    category: "Workshop",
  });
  assert.equal(result.success, true);
});

test("rejects invalid event capacity and date", () => {
  const result = eventCreate.safeParse({
    title: "Invalid Event",
    eventDate: "not-a-date",
    capacity: 0,
  });
  assert.equal(result.success, false);
});

test("enforces student year and email validation", () => {
  const result = studentCreate.safeParse({
    studentId: "GEC-001",
    name: "Student",
    email: "not-an-email",
    year: 5,
  });
  assert.equal(result.success, false);
});

test("coerces and bounds query pagination", () => {
  const result = eventListQuery.safeParse({ page: "2", limit: "25" });
  assert.equal(result.success, true);
  assert.deepEqual(result.data, { page: 2, limit: 25 });
});

test("requires at least one registration update field", () => {
  assert.equal(registrationUpdate.safeParse({}).success, false);
  assert.equal(registrationUpdate.safeParse({ attendance: "present" }).success, true);
});
