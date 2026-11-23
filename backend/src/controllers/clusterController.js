const clusterService = require("../services/clusterService");

async function getOverview(req, res, next) {
  try {
    const [replication, sharding] = await Promise.all([
      clusterService.getReplicationOverview(),
      clusterService.getShardingOverview(),
    ]);
    res.json({ success: true, data: { replication, sharding } });
  } catch (error) { next(error); }
}

async function getReplication(req, res, next) {
  try { res.json({ success: true, data: await clusterService.getReplicationOverview() }); } catch (error) { next(error); }
}

async function probeReplication(req, res, next) {
  try { res.json({ success: true, data: await clusterService.probeReplication() }); } catch (error) { next(error); }
}

async function getSharding(req, res, next) {
  try { res.json({ success: true, data: await clusterService.getShardingOverview() }); } catch (error) { next(error); }
}

async function explainQuery(req, res, next) {
  try { res.json({ success: true, data: await clusterService.explainQuery(req.params.id) }); } catch (error) { next(error); }
}

module.exports = { getOverview, getReplication, probeReplication, getSharding, explainQuery };
