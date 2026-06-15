const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createFolder,
  getFolders,
} = require("../controllers/folderController");

const router = express.Router();

router.post("/", protect, createFolder);
router.get("/", protect, getFolders);

module.exports = router;