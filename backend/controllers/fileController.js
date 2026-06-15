const pool = require("../db");
const fs = require("fs");

const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const newFile = await pool.query(
        `INSERT INTO files 
        (filename, filetype, filesize, storage_path, folder_id, owner_id) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          file.originalname,
          file.mimetype,
          file.size,
          file.path,
          req.body.folder_id || null,
          req.user.id,
        ]
      );

      uploadedFiles.push(newFile.rows[0]);
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    let files;

    if (req.user.role === "admin") {
      files = await pool.query("SELECT * FROM files ORDER BY uploaded_at DESC");
    } else {
      files = await pool.query(
        "SELECT * FROM files WHERE owner_id = $1 ORDER BY uploaded_at DESC",
        [req.user.id]
      );
    }

    res.status(200).json({
      message: "Files fetched successfully",
      files: files.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFilesByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    let files;

    if (req.user.role === "admin") {
      files = await pool.query(
        "SELECT * FROM files WHERE folder_id = $1 ORDER BY uploaded_at DESC",
        [folderId]
      );
    } else {
      files = await pool.query(
        "SELECT * FROM files WHERE folder_id = $1 AND owner_id = $2 ORDER BY uploaded_at DESC",
        [folderId, req.user.id]
      );
    }

    res.json({
      message: "Folder files fetched successfully",
      files: files.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchFiles = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Search keyword is required" });
    }

    let files;

    if (req.user.role === "admin") {
      files = await pool.query(
        "SELECT * FROM files WHERE filename ILIKE $1 ORDER BY uploaded_at DESC",
        [`%${keyword}%`]
      );
    } else {
      files = await pool.query(
        "SELECT * FROM files WHERE owner_id = $1 AND filename ILIKE $2 ORDER BY uploaded_at DESC",
        [req.user.id, `%${keyword}%`]
      );
    }

    res.json({
      message: "Search completed successfully",
      files: files.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ message: "New filename is required" });
    }

    const file = await pool.query("SELECT * FROM files WHERE id = $1", [id]);

    if (file.rows.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    if (req.user.role !== "admin" && file.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedFile = await pool.query(
      "UPDATE files SET filename = $1 WHERE id = $2 RETURNING *",
      [filename, id]
    );

    res.json({
      message: "File renamed successfully",
      file: updatedFile.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await pool.query("SELECT * FROM files WHERE id = $1", [id]);

    if (file.rows.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    if (req.user.role !== "admin" && file.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (fs.existsSync(file.rows[0].storage_path)) {
      fs.unlinkSync(file.rows[0].storage_path);
    }

    await pool.query("DELETE FROM files WHERE id = $1", [id]);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await pool.query("SELECT * FROM files WHERE id = $1", [id]);

    if (file.rows.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    if (req.user.role !== "admin" && file.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filePath = file.rows[0].storage_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing from uploads folder" });
    }

    res.download(filePath, file.rows[0].filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFiles,
  getFiles,
  getFilesByFolder,
  searchFiles,
  renameFile,
  deleteFile,
  downloadFile,
};