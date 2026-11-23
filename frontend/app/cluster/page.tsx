"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/page-header";
import { LoadingState } from "../../components/loading-state";
import { explainClusterQuery, getClusterReplication, getClusterSharding, probeClusterReplication } from "../../lib/api";

type ReplicationData = NonNullable<Awaited<ReturnType<typeof getClusterReplication>>["data"]>;
type ShardingData = NonNullable<Awaited<ReturnType<typeof getClusterSharding>>["data"]>;
type ProbeData = NonNullable<Awaited<ReturnType<typeof probeClusterReplication>>["data"]>;

const explainIds = [
  ["registrations-by-studentId", "Registrations by studentId"],
  ["registrations-by-eventId", "Registrations by eventId"],
  ["events-by-id", "Events by _id"],
  ["events-by-category", "Events by category"],
];

export default function ClusterPage() {
  const [replication, setReplication] = useState<ReplicationData | null>(null);
  const [sharding, setSharding] = useState<ShardingData | null>(null);
  const [probe, setProbe] = useState<ProbeData | null>(null);
  const [explain, setExplain] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [replicationResponse, shardingResponse] = await Promise.all([getClusterReplication(), getClusterSharding()]);
      setReplication(replicationResponse.data || null);
      setSharding(shardingResponse.data || null);
      setError(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Cluster is not running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 2500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function runProbe() {
    try {
      const response = await probeClusterReplication();
      setProbe(response.data || null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Replication probe failed.");
    }
  }

  async function runExplain(id: string) {
    try {
      const response = await explainClusterQuery(id);
      const result = response.data?.summary;
      setExplain((current) => ({ ...current, [id]: result ? `${result.winningStage} • ${result.shards.join(", ") || "router plan"}` : "No plan returned" }));
    } catch (reason: unknown) {
      setExplain((current) => ({ ...current, [id]: reason instanceof Error ? reason.message : "Explain failed" }));
    }
  }

  if (loading) return <LoadingState message="Reading replica-set and sharding topology..." />;

  return (
    <div className="space-y-8">
      <PageHeader title="MongoDB Cluster" subtitle="Live replication and sharding evidence for the database serving this application" />
      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}<div className="mt-2 font-mono text-xs">Start infrastructure/cluster and wait for CLUSTER READY.</div></div>}

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="text-lg font-bold">Replication topology</h2><p className="text-xs text-slate-500">Each shard has a three-member replica set.</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${replication?.majority ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{replication?.majority ? "Majority healthy" : "Cluster not ready"}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(replication?.sets || []).map((set) => (
            <div key={set.name} className="rounded-lg border border-slate-200 p-4">
              <div className="font-bold text-slate-900">{set.name}</div>
              <div className="text-xs text-slate-500 mb-3">Primary: {set.primary || "none"}</div>
              {set.members.map((member) => <div key={member.node} className="flex justify-between text-xs border-t border-slate-100 py-2"><span>{member.node}</span><span className={member.state === "DOWN" ? "text-rose-600" : member.state === "PRIMARY" ? "text-emerald-600" : "text-blue-600"}>{member.state}</span></div>)}
              {set.oplog && <div className="mt-3 text-[11px] text-slate-500">Oplog: {String(set.oplog.firstDate || "—")} → {String(set.oplog.lastDate || "—")}</div>}
            </div>
          ))}
        </div>
        <button onClick={runProbe} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Run majority replication probe</button>
        {probe && <div className="mt-4 rounded-lg bg-slate-950 p-4 text-xs text-emerald-300">Write: {probe.writeElapsedMs} ms{probe.members.map((member) => <div key={member.node}>{member.node}: {member.found ? "found" : "not found"} {member.elapsedMs == null ? "" : `(${member.elapsedMs} ms)`}</div>)}</div>}
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-bold">Sharding topology</h2><p className="text-xs text-slate-500">The backend reaches the application database through mongos.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{sharding?.routedThrough || "unavailable"}</span></div>
        <div className="flex flex-wrap gap-3 mb-5">{(sharding?.shards || []).map((shard) => <div key={shard._id} className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm"><div className="font-bold text-indigo-900">{shard._id}</div><div className="text-xs text-indigo-700">{shard.host}</div></div>)}</div>
        <div className="space-y-3">{(sharding?.collections || []).map((collection) => <div key={collection.name} className="rounded-lg border border-slate-200 p-4"><div className="flex justify-between"><span className="font-semibold">{collection.name}</span><span className="text-xs text-slate-500">{collection.chunks} chunks</span></div><div className="mt-2 font-mono text-xs text-slate-600">Shard key: {JSON.stringify(collection.key)}</div></div>)}</div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6"><h2 className="text-lg font-bold">Targeted versus scatter-gather queries</h2><p className="text-xs text-slate-500 mt-1 mb-4">These fixed explain examples show how shard keys affect routing.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{explainIds.map(([id, label]) => <button key={id} onClick={() => runExplain(id)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-indigo-300"><div className="text-sm font-semibold">{label}</div><div className="mt-2 text-xs font-mono text-indigo-700">{explain[id] || "Run explain"}</div></button>)}</div></section>

      <p className="text-xs text-slate-500">Local deployment simplification: configRS has one member to reduce resource use; production deployments use three config-server members.</p>
    </div>
  );
}
