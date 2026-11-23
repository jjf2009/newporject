const { MongoClient } = require("mongodb");
const { getDB, getClient } = require("../config/db");

function nodesFromEnv(name) {
  return (process.env[name] || "").split(",").map((value) => value.trim()).filter(Boolean);
}

async function directStatus(node, setName) {
  const client = new MongoClient(`mongodb://${node}/?directConnection=true`, {
    serverSelectionTimeoutMS: 1500,
  });
  try {
    await client.connect();
    const admin = client.db("admin");
    const hello = await admin.command({ hello: 1 });
    const status = await admin.command({ replSetGetStatus: 1 });
    const localMember = status.members.find((member) => member.name === hello.me)
      || status.members.find((member) => member.name.startsWith(node.split(":")[0]));
    return {
      node,
      setName: status.set || setName,
      state: localMember?.stateStr || (hello.isWritablePrimary ? "PRIMARY" : "SECONDARY"),
      health: localMember?.health ?? 1,
      uptime: localMember?.uptime,
      optimeDate: localMember?.optimeDate,
      term: status.term,
      electionTime: status.electionTime,
    };
  } catch (error) {
    return { node, setName, state: "DOWN", health: 0, error: error.message };
  } finally {
    await client.close().catch(() => {});
  }
}

async function replicationSet(name, nodes) {
  const members = await Promise.all(nodes.map((node) => directStatus(node, name)));
  const reachable = members.find((member) => member.state !== "DOWN");
  let oplog = null;
  if (reachable) {
    const client = new MongoClient(`mongodb://${reachable.node}/?directConnection=true`, { serverSelectionTimeoutMS: 1500 });
    try {
      await client.connect();
      const collection = client.db("local").collection("oplog.rs");
      const [first, last] = await Promise.all([
        collection.find().sort({ $natural: 1 }).limit(1).next(),
        collection.find().sort({ $natural: -1 }).limit(1).next(),
      ]);
      oplog = { first: first?.ts || null, last: last?.ts || null, firstDate: first?.wall || null, lastDate: last?.wall || null };
    } catch {
      oplog = null;
    } finally {
      await client.close().catch(() => {});
    }
  }
  return { name, members, primary: members.find((member) => member.state === "PRIMARY")?.node || null, oplog };
}

async function getReplicationOverview() {
  const sets = await Promise.all([
    replicationSet("configRS", nodesFromEnv("CONFIG_NODES")),
    replicationSet("shard1RS", nodesFromEnv("SHARD1_NODES")),
    replicationSet("shard2RS", nodesFromEnv("SHARD2_NODES")),
  ]);
  const majority = sets.length === 3 && sets.every((set) => {
    // The one-member config server is an intentional local deployment
    // simplification; shard replica sets still require two reachable votes.
    const required = set.name === "configRS" ? 1 : 2;
    return set.members.length > 0 && set.members.filter((member) => member.state !== "DOWN").length >= required;
  });
  return { sets, majority };
}

async function probeReplication() {
  const db = getDB();
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.collection("cluster_probes").deleteMany({ type: "replication" });
  const startedAt = Date.now();
  await db.collection("cluster_probes").insertOne(
    { type: "replication", nonce, at: new Date(), purpose: "cluster health verification" },
    { writeConcern: { w: "majority" } }
  );
  const results = [];
  for (const node of nodesFromEnv("SHARD1_NODES")) {
    const client = new MongoClient(`mongodb://${node}/?directConnection=true&readPreference=secondaryPreferred`, { serverSelectionTimeoutMS: 1500 });
    const result = { node, found: false, elapsedMs: null };
    try {
      await client.connect();
      const began = Date.now();
      const doc = await client.db(process.env.DB_NAME || "campus_events").collection("cluster_probes").findOne({ type: "replication", nonce });
      result.found = Boolean(doc);
      result.elapsedMs = Date.now() - began;
    } catch (error) {
      result.error = error.message;
    } finally {
      await client.close().catch(() => {});
    }
    results.push(result);
  }
  return { nonce, writeElapsedMs: Date.now() - startedAt, members: results };
}

async function getShardingOverview() {
  const db = getDB();
  const admin = db.admin();
  const hello = await admin.command({ hello: 1 });
  if (hello.msg !== "isdbgrid") throw new Error("The application connection is not routed through mongos.");
  const shardResult = await admin.command({ listShards: 1 });
  const configDb = getClient().db("config");
  const collectionDocs = await configDb.collection("collections").find({ _id: { $in: ["campus_events.events", "campus_events.registrations"] } }).toArray();
  const collections = [];
  for (const collection of collectionDocs) {
    const chunks = await configDb.collection("chunks").countDocuments({ uuid: collection.uuid });
    let distribution = [];
    try {
      distribution = await db.collection(collection._id.split(".")[1]).aggregate([{ $collStats: { count: {} } }]).toArray();
    } catch {
      distribution = [];
    }
    collections.push({ name: collection._id, key: collection.key, unique: collection.unique, chunks, distribution });
  }
  return { routedThrough: "mongos", shards: shardResult.shards, collections };
}

function explainSummary(plan) {
  const stages = [];
  const shards = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (value.stage) stages.push(value.stage);
    if (value.shardName) shards.push(value.shardName);
    for (const child of Object.values(value)) walk(child);
  }
  walk(plan.queryPlanner || plan);
  return { winningStage: stages.find((stage) => ["SINGLE_SHARD", "SHARD_MERGE", "SHARDING_FILTER"].includes(stage)) || stages[0] || "UNKNOWN", stages: [...new Set(stages)], shards: [...new Set(shards)] };
}

async function explainQuery(id) {
  const db = getDB();
  let collection; let filter;
  if (id === "registrations-by-studentId") {
    collection = "registrations";
    const sample = await db.collection(collection).findOne({}, { projection: { studentId: 1 } });
    filter = sample ? { studentId: sample.studentId } : { studentId: null };
  } else if (id === "registrations-by-eventId") {
    collection = "registrations";
    const sample = await db.collection(collection).findOne({}, { projection: { eventId: 1 } });
    filter = sample ? { eventId: sample.eventId } : { eventId: null };
  } else if (id === "events-by-id") {
    collection = "events";
    const sample = await db.collection(collection).findOne({}, { projection: { _id: 1 } });
    filter = sample ? { _id: sample._id } : { _id: null };
  } else if (id === "events-by-category") {
    collection = "events";
    filter = { category: "Technical" };
  } else {
    const error = new Error("Unknown explain example"); error.status = 400; throw error;
  }
  const plan = await db.collection(collection).find(filter).explain("queryPlanner");
  return { id, collection, filter, summary: explainSummary(plan) };
}

module.exports = { getReplicationOverview, probeReplication, getShardingOverview, explainQuery };
