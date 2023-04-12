const express = require("express");
const WatchList = require("../controllers/watchList");
const router = express.Router();

router.get("/:currency/:numItemsPerPage/:currentPageNumber", WatchList.getWatchListForUser);
router.post("/", WatchList.addToWatchList);
router.put("/", WatchList.updateWatchListAddress);
router.delete("/", WatchList.deleteWatchListAddress);

module.exports = router;
