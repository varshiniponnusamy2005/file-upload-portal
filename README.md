# file-upload-portal
Full Stack File Upload Portal with Progress, Validation, Folder Management and Role-Based Access Control
# 📁 File Vault – File Upload Portal with Progress and Validation

## Overview

File Vault is a full-stack document management system inspired by Google Drive. It allows users to securely upload, organize, preview, search, download, and manage files using a modern web interface.

The application includes authentication, folder management, file validation, upload progress tracking, role-based access control, and file preview functionality.

---

## Features

### User Authentication

* User Registration
* User Login
* JWT Authentication
* Secure Protected Routes
* Logout Functionality

### File Upload

* Upload using Browse Button
* Drag and Drop Upload
* Multiple File Upload
* Upload Progress Indicator
* File Type Validation
* File Size Validation
* Success and Error Messages

### Supported File Types

* JPG
* PNG
* PDF
* DOCX
* XLSX

### File Management

* Preview Files
* Download Files
* Delete Files
* Search Files
* View File Size
* View Uploaded Date

### Folder Management

* Create Folder
* View Folders
* Open Folder
* Upload Files Inside Folder

### Permission Based Access

#### Admin

* View All Files
* Upload Files
* Delete Files
* Manage Folders

#### User

* Upload Files
* View Own Files
* Delete Own Files

Backend validation prevents unauthorized users from accessing or deleting files belonging to other users.

### UI Features

* Dark Purple Modern Theme
* Responsive Design
* Upload Progress Bar
* Loading States
* Empty Folder State
* Error Handling
* Attractive Dashboard

---

## Technology Stack

### Frontend

* React.js
* Axios
* CSS3

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

### Database

* PostgreSQL

---

## Database Schema

### Users Table

| Column   | Type    |
| -------- | ------- |
| id       | SERIAL  |
| name     | VARCHAR |
| email    | VARCHAR |
| password | VARCHAR |
| role     | VARCHAR |

### Folders Table

| Column      | Type      |
| ----------- | --------- |
| id          | SERIAL    |
| folder_name | VARCHAR   |
| owner_id    | INTEGER   |
| created_at  | TIMESTAMP |

### Files Table

| Column       | Type      |
| ------------ | --------- |
| id           | SERIAL    |
| filename     | VARCHAR   |
| filetype     | VARCHAR   |
| filesize     | BIGINT    |
| storage_path | TEXT      |
| folder_id    | INTEGER   |
| owner_id     | INTEGER   |
| uploaded_at  | TIMESTAMP |

---

## API Endpoints

### Authentication

POST /register

POST /login

---

### Folder Management

POST /folders

GET /folders

---

### File Management

POST /files/upload

GET /files

GET /files/search

GET /files/folder/:id

GET /files/:id/download

DELETE /files/:id

---

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```text
file-upload-portal
│
├── backend
│   ├── uploads
│   ├── routes
│   ├── middleware
│   ├── server.js
│   └── db.js
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── api.js
│   │   └── App.jsx
│
└── README.md
```

---

## Screenshots

* Login Page
* Register Page
* Dashboard
* Upload Zone
* Folder View
* All Files
* Preview Window

---

## Future Enhancements

* Rename Files
* Rename Folders
* Nested Folders
* Move Files Between Folders
* Breadcrumb Navigation
* Cloud Storage Integration (AWS S3)
* User Profile Management

---

## Author

Varshini P

BE-Computer Science and Engineering


