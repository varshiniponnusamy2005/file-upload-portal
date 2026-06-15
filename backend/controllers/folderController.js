const pool = require("../db");

const createFolder = async (req, res) => {
  try {
    const { folder_name, parent_folder_id } = req.body;

    if (!folder_name) {
      return res.status(400).json({
        message: "Folder name is required",
      });
    }

    const folder = await pool.query(
      "INSERT INTO folders (folder_name, parent_folder_id, owner_id) VALUES ($1, $2, $3) RETURNING *",
      [folder_name, parent_folder_id || null, req.user.id]
    );

    res.status(201).json({
      message: "Folder created successfully",
      folder: folder.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFolders = async (req, res) => {
  try {
    let folders;

    if (req.user.role === "admin") {
      folders = await pool.query("SELECT * FROM folders ORDER BY created_at DESC");
    } else {
      folders = await pool.query(
        "SELECT * FROM folders WHERE owner_id = $1 ORDER BY created_at DESC",
        [req.user.id]
      );
    }

    res.status(200).json({
      message: "Folders fetched successfully",
      folders: folders.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFolder,
  getFolders,
};