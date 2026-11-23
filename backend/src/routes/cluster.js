const express = require("express");
const router = express.Router();
const clusterController = require("../controllers/clusterController");

router.get("/overview", clusterController.getOverview);
router.get("/replication", clusterController.getReplication);
router.post("/replication/probe", clusterController.probeReplication);
router.get("/sharding", clusterController.getSharding);
router.get("/sharding/explain/:id", clusterController.explainQuery);

module.exports = router;
