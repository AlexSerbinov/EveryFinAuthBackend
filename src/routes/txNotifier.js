

const express = require("express");
const TxNotifier = require("../controllers/txNotifier");
const router = express.Router();

router.get("/:currency", TxNotifier.getLastNotification);
router.delete("/", TxNotifier.deleteOnetNotification);
// // router.post("/", WatchList.addToWatchList);
// // router.put("/", WatchList.updateWatchListAddress);
// // router.delete("/", WatchList.deleteWatchListAddress);

module.exports = router;
