# BPhotos – Server (Backend)

This is the Node.js/Express backend for BPhotos, a modern self-hosted photo management app.

## Features
- REST API for photo upload, download, deletion, and metadata
- Tagging, favorites, and search/filter support
- Stores photos in MongoDB using GridFS
- Extracts and stores photo metadata (EXIF, camera info, date taken, etc.)
- User authentication and authorization

## Getting Started

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Environment variables
Create a `.env` file in the `server` directory. Example:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bphotos
JWT_SECRET=your_jwt_secret
```

### 3. Run the server
```bash
npm start
```
The server will run on [http://localhost:5000](http://localhost:5000).

## Project Structure
- `src/`
  - `controllers/` – Route handlers for photos, users, etc.
  - `models/` – Mongoose models (Photo, User)
  - `routes/` – Express route definitions (photoRoutes, userRoutes)
  - `middleware/` – Auth, error handling, etc.
  - `utils/` – Utility functions (e.g., metadata extraction)
  - `app.ts` – Express app setup
  - `server.ts` – Entry point

## API Endpoints
- `POST /photos/upload` – Upload a photo (with metadata extraction)
- `GET /photos` – List photos (with filters: tags, favorites, date, etc.)
- `GET /photos/download/:id` – Download a photo
- `PATCH /photos/updateMetadata/:id` – Update tags, description, etc.
- `PATCH /photos/toggleFavorite/:id` – Toggle favorite status
- `DELETE /photos/:id` – Delete a photo
- `POST /users/register` – Register a new user
- `POST /users/login` – Log in

## Authentication
- Uses JWT for authentication. Include the token in the `Authorization` header for protected routes.

## Storage & Metadata
- Photos are stored in MongoDB GridFS.
- Metadata (EXIF, camera info, date taken, etc.) is extracted on upload and stored with each photo.
- Tags, favorites, and other fields are supported for organization and search.

## Customization
- Configure environment variables in `.env`.
- Add/modify routes and models in `src/` as needed.

---
See the root README for project-wide info, and `client/README.md` for frontend details. 