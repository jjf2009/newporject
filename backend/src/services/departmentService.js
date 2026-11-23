const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

async function listDepartments() {
  return getDB().collection("departments").find().sort({ name: 1 }).toArray();
}

async function createDepartment(data) {
  const doc = { name: data.name.trim(), code: data.code.trim().toUpperCase(), coordinator: data.coordinator || "", createdAt: new Date() };
  const result = await getDB().collection("departments").insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function updateDepartment(id, data) {
  const result = await getDB().collection("departments").findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  return result;
}

async function deleteDepartment(id) {
  const result = await getDB().collection("departments").deleteOne({ _id: new ObjectId(id) });
  return { deleted: result.deletedCount > 0 };
}

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };
