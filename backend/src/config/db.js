const { MongoClient, ReadPreference } = require("mongodb");

let client = null;
let database = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27020";
  const dbName = process.env.DB_NAME || "campus_events";

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment");
  }

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      writeConcern: { w: "majority" },
    });
  }

  await client.connect();
  database = client.db(dbName);

  await createIndexes(database);

  console.log(`Connected to MongoDB database: ${dbName}`);
  return database;
}

function getDB() {
  if (!database) {
    throw new Error("MongoDB has not been initialized. Call connectDB() first.");
  }
  return database;
}

function getClient() {
  if (!client) throw new Error("MongoDB has not been initialized. Call connectDB() first.");
  return client;
}

function getAnalyticsDB() {
  if (!database || !client) {
    throw new Error("MongoDB has not been initialized. Call connectDB() first.");
  }
  return client.db(database.databaseName, {
    readPreference: new ReadPreference("secondaryPreferred"),
  });
}

async function createIndexes(db) {
  // Students indexes
  await db.collection("students").createIndex({ studentId: 1 }, { unique: true });
  await db.collection("students").createIndex({ email: 1 }, { unique: true });
  await db.collection("students").createIndex({ departmentId: 1 });
  await db.collection("students").createIndex({ year: 1 });

  // Departments indexes
  await db.collection("departments").createIndex({ code: 1 }, { unique: true });
  await db.collection("departments").createIndex({ name: 1 }, { unique: true });

  // Events indexes
  await db.collection("events").createIndex({ status: 1, eventDate: 1 });
  await db.collection("events").createIndex({ category: 1 });
  await db.collection("events").createIndex({ capacity: 1 });

  // Registrations indexes (compound unique: studentId + eventId)
  await db.collection("registrations").createIndex(
    { studentId: 1, eventId: 1 },
    { unique: true }
  );
  await db.collection("registrations").createIndex({ eventId: 1, status: 1 });
  await db.collection("registrations").createIndex({ studentId: 1, status: 1 });

  console.log("Database indexes verified/created successfully.");
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    database = null;
    console.log("MongoDB connection closed.");
  }
}

module.exports = { connectDB, getDB, getClient, getAnalyticsDB, closeDB };
