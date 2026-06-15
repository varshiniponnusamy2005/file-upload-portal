import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [openedFolder, setOpenedFolder] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + " MB";

  const formatDate = (date) => new Date(date).toLocaleString();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await API.get("/files");
      setFiles(res.data.files);
      setOpenedFolder(null);
    } catch {
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await API.get("/folders");
      setFolders(res.data.folders);
    } catch {
      setError("Failed to load folders");
    }
  };

  const goDashboard = async () => {
    setView("dashboard");
    setOpenedFolder(null);
    setSearch("");
    setMessage("");
    setError("");
    await fetchFiles();
    await fetchFolders();
  };

  const openAllFiles = async () => {
    setView("files");
    setOpenedFolder(null);
    await fetchFiles();
  };

  const openFolders = async () => {
    setView("folders");
    setOpenedFolder(null);
    await fetchFolders();
  };

  const openUpload = () => {
    setView("upload");
    setOpenedFolder(null);
  };

  const openFolder = async (folder) => {
    setLoading(true);
    try {
      const res = await API.get(`/files/folder/${folder.id}`);
      setFiles(res.data.files);
      setOpenedFolder(folder);
      setSelectedFolder(folder.id);
      setView("folder");
    } catch {
      setError("Unable to open folder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Enter folder name");
      return;
    }

    try {
      await API.post("/folders", { folder_name: folderName });
      setFolderName("");
      setMessage("Folder created successfully");
      setError("");
      fetchFolders();
    } catch {
      setError("Folder creation failed");
    }
  };

  const validateFiles = (fileList) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    for (let file of fileList) {
      if (!allowed.includes(file.type)) {
        setError("Only JPG, PNG, PDF, DOCX and XLSX files are allowed");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be below 5MB");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleFileSelect = (fileList) => {
    if (validateFiles(fileList)) {
      setSelectedFiles(fileList);
      setMessage(`${fileList.length} file selected`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please choose a file first");
      return;
    }

    const formData = new FormData();

    for (let file of selectedFiles) {
      formData.append("files", file);
    }

    if (openedFolder) {
      formData.append("folder_id", openedFolder.id);
    } else if (selectedFolder) {
      formData.append("folder_id", selectedFolder);
    }

    try {
      setUploadProgress(0);
      setMessage("");
      setError("");

      await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        },
      });

      setSelectedFiles(null);
      setMessage("File uploaded successfully");

      if (openedFolder) openFolder(openedFolder);
      else fetchFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchFiles();
      return;
    }

    try {
      const res = await API.get(`/files/search?keyword=${search}`);
      setFiles(res.data.files);
    } catch {
      setError("Search failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/files/${id}`);
      setMessage("File deleted successfully");

      if (openedFolder) openFolder(openedFolder);
      else fetchFiles();
    } catch {
      setError("Delete failed or restricted access");
    }
  };

  const handleDownload = async (id, filename) => {
    const res = await API.get(`/files/${id}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handlePreview = (file) => {
    window.location.href = `http://localhost:5000/${file.storage_path.replace(
      /\\/g,
      "/"
    )}`;
  };

  const renderBackButton = () => {
    if (view === "dashboard") return null;

    return (
      <button className="back-btn" onClick={goDashboard}>
        ← Back to Dashboard
      </button>
    );
  };

  const renderFiles = () => (
    <div className="panel full-panel">
      <div className="file-header">
        <h2>{openedFolder ? `📁 ${openedFolder.folder_name}` : "All Files"}</h2>

        <div className="search-wrap">
          <span>🔍</span>
          <input
            placeholder="Search your files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="empty-folder-box">
          <h3>📂 No files found</h3>
          <p>Upload files from Upload Zone.</p>
        </div>
      ) : (
        files.map((file) => (
          <div className="file-row" key={file.id}>
            <div>
              <strong>{file.filename}</strong>
              <br />
              <small>Uploaded: {formatDate(file.uploaded_at)}</small>
            </div>

            <div>
              {file.filetype.includes("pdf")
                ? "PDF"
                : file.filetype.includes("image")
                ? "IMAGE"
                : "FILE"}
              <br />
              <small>{formatSize(file.filesize)}</small>
            </div>

            <div>
              <button className="small-btn" onClick={() => handlePreview(file)}>
                Preview
              </button>

              <button
                className="small-btn"
                onClick={() => handleDownload(file.id, file.filename)}
              >
                Download
              </button>

              <button
                className="small-btn danger"
                onClick={() => handleDelete(file.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderFolders = () => (
    <div className="panel full-panel">
      <h2>Folders</h2>

      <div className="folder-grid">
        {folders.length === 0 ? (
          <p className="message">No folders created yet</p>
        ) : (
          folders.map((folder) => (
            <div
              className="folder-card"
              key={folder.id}
              onClick={() => openFolder(folder)}
            >
              <div className="folder-icon">📁</div>
              <h3>{folder.folder_name}</h3>
              <p>Click to open</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderUpload = () => (
  <div className="upload-page">
    <div className="upload-hero">
      <h2>
        {openedFolder
          ? `Upload files to ${openedFolder.folder_name}`
          : "Upload Zone"}
      </h2>
      <p>
        Drag and drop your files here or browse from your device.
        Supported: JPG, PNG, PDF, DOCX, XLSX
      </p>
    </div>

    <div
      className="upload-drop-area"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="upload-cloud">☁️</div>

      <h3>Drop your files here</h3>
      <p>Maximum file size: 5MB</p>

      {!openedFolder && (
        <select
          className="select-box upload-select"
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
        >
          <option value="">Upload without folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.folder_name}
            </option>
          ))}
        </select>
      )}

      {openedFolder && (
        <p className="message">
          Selected Folder: 📁 {openedFolder.folder_name}
        </p>
      )}

      <label className="file-picker big-picker">
        Browse Files
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </label>

      <p className="message">
        {selectedFiles?.length > 0
          ? `${selectedFiles.length} file selected`
          : "No file selected"}
      </p>

      {uploadProgress > 0 && (
        <div className="progress-bar large-progress">
          <div style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      <button className="btn upload-main-btn" onClick={handleUpload}>
        Upload Files
      </button>
    </div>
  </div>
)
           
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div>
          <div className="logo">📁 File Vault</div>

          <div className={`menu-item ${view === "dashboard" ? "active" : ""}`} onClick={goDashboard}>
            Dashboard
          </div>

          <div className={`menu-item ${view === "files" ? "active" : ""}`} onClick={openAllFiles}>
            All Files
          </div>

          <div className={`menu-item ${view === "folders" ? "active" : ""}`} onClick={openFolders}>
            Folders
          </div>

          <div className={`menu-item ${view === "upload" ? "active" : ""}`} onClick={openUpload}>
            Upload Zone
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="main">
        <div className="back-row">{renderBackButton()}</div>

        <div className="topbar">
          <div>
            <h1>
              {view === "dashboard"
                ? "Command Center 🚀"
                : view === "files"
                ? "All Files"
                : view === "folders"
                ? "Folders"
                : view === "upload"
                ? "Upload Zone"
                : `📁 ${openedFolder?.folder_name}`}
            </h1>
            <p style={{ color: "#a1a1aa" }}>Welcome, {user?.name}</p>
          </div>
        </div>

        {view === "dashboard" && (
          <>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Files</h3>
                <p>{files.length}</p>
              </div>

              <div className="stat-card">
                <h3>Total Folders</h3>
                <p>{folders.length}</p>
              </div>

              <div className="stat-card">
                <h3>Role</h3>
                <p>{user?.role}</p>
              </div>

              <div className="stat-card">
                <h3>Storage</h3>
                <p>
                  {(
                    files.reduce((t, f) => t + Number(f.filesize), 0) /
                    1024 /
                    1024
                  ).toFixed(2)}
                  MB
                </p>
              </div>
            </div>

            <div className="panel dashboard-create">
              <h2>Create Folder</h2>

              <div className="input-box">
                <input
                  type="text"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>

              <button className="btn" onClick={handleCreateFolder}>
                Create Folder
              </button>
            </div>
          </>
        )}

        {view === "files" && renderFiles()}
        {view === "folders" && renderFolders()}
        {view === "upload" && renderUpload()}
        {view === "folder" && (
          <>
            {renderFiles()}
            {renderUpload()}
          </>
        )}

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}

export default Dashboard;