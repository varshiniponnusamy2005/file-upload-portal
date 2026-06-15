# Database Schema

## Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50)
);
```

## Folders Table

```sql
CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  folder_name VARCHAR(255),
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Files Table

```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  filetype VARCHAR(255),
  filesize BIGINT,
  storage_path TEXT,
  folder_id INTEGER REFERENCES folders(id),
  owner_id INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
