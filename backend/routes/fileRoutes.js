const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");
const {
  uploadFiles,
  getFiles,
  getFilesByFolder,
  searchFiles,
  renameFile,
  deleteFile,
  downloadFile,
} = require("../controllers/fileController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF, DOCX, and XLSX files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/upload", protect, upload.array("files", 5), uploadFiles);
router.get("/", protect, getFiles);
router.get("/search", protect, searchFiles);
router.get("/folder/:folderId", protect, getFilesByFolder);
router.get("/:id/download", protect, downloadFile);
router.put("/:id/rename", protect, renameFile);
router.delete("/:id", protect, deleteFile);

module.exports = router;