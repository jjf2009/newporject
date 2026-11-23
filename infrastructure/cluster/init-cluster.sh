#!/usr/bin/env bash
set -euo pipefail

wait_for_member() {
  local host="$1"
  until mongosh --quiet --host "$host" --eval 'db.adminCommand({ ping: 1 }).ok' 2>/dev/null | grep -q 1; do
    sleep 2
  done
}

wait_for_primary() {
  local host="$1"
  until mongosh --quiet --host "$host" --eval 'try { rs.status().members.some(m => m.stateStr === "PRIMARY") } catch (e) { false }' 2>/dev/null | grep -q true; do
    sleep 2
  done
}

init_set() {
  local host="$1"; local name="$2"; shift 2
  local members=()
  local member
  for member in "$@"; do
    members+=("{_id:${member%%:*},host:\"${member#*:}\"}")
  done
  local member_config
  member_config=$(IFS=,; echo "${members[*]}")
  wait_for_member "$host"
  mongosh --quiet --host "$host" --eval "try { rs.status(); print('$name already initialized'); } catch (e) { printjson(rs.initiate({_id:'$name', members:[$member_config]})); }"
  wait_for_primary "$host"
}

init_set "cfg1:27017" "configRS" "0:cfg1:27017"
init_set "s1a:27017" "shard1RS" "0:s1a:27017" "1:s1b:27017" "2:s1c:27017"
init_set "s2a:27017" "shard2RS" "0:s2a:27017" "1:s2b:27017" "2:s2c:27017"

until mongosh --quiet --host mongos:27017 --eval 'db.adminCommand({ ping: 1 }).ok' 2>/dev/null | grep -q 1; do
  sleep 2
done

mongosh --quiet --host mongos:27017 <<'MONGO'
const admin = db.getSiblingDB("admin");
for (const shard of [
  "shard1RS/s1a:27017,s1b:27017,s1c:27017",
  "shard2RS/s2a:27017,s2b:27017,s2c:27017",
]) {
  try { admin.runCommand({ addShard: shard }); } catch (e) { print(e); }
}

try { admin.runCommand({ enableSharding: "campus_events", primaryShard: "shard1RS" }); } catch (e) { print(e); }
const app = db.getSiblingDB("campus_events");
app.registrations.createIndex({ studentId: 1, eventId: 1 }, { unique: true });
app.events.createIndex({ _id: "hashed" });
try { sh.shardCollection("campus_events.registrations", { studentId: 1, eventId: 1 }); } catch (e) { print(e); }
try { sh.shardCollection("campus_events.events", { _id: "hashed" }); } catch (e) { print(e); }
try { db.getSiblingDB("config").settings.updateOne({ _id: "chunksize" }, { $set: { value: 1 } }, { upsert: true }); } catch (e) { print(e); }

const listed = admin.runCommand({ listShards: 1 }).shards || [];
const collections = db.getSiblingDB("config").collections.find({ _id: { $in: ["campus_events.registrations", "campus_events.events"] } }).toArray();
if (listed.length === 2 && collections.length === 2) print("CLUSTER READY");
else { print("CLUSTER NOT READY"); quit(1); }
MONGO
