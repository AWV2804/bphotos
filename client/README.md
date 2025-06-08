# BPhotos – Client (Frontend)

This is the React frontend for BPhotos, a modern self-hosted photo management app.

## Features
- Photo upload (drag-and-drop or file picker)
- Grid and list views with zoom control
- Tagging, favorites, and metadata display
- Search and filter by tags, date, and favorites
- Bulk selection and actions
- Responsive design

## Getting Started

### 1. Install dependencies
```bash
cd client
npm install
```

### 2. Environment variables
Create a `.env` file in the `client` directory if needed. Example:
```
REACT_APP_API_URL=http://localhost:5000
```

### 3. Run the development server
```bash
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### 4. Build for production
```bash
npm run build
```
The production build will be in the `build/` directory.

## Project Structure
- `src/`
  - `components/` – Reusable UI components (PhotoUpload, PhotoDetails, ViewControls, BulkActions, etc.)
  - `pages/` – Main pages (PhotosPage, LandingPage, etc.)
  - `utils/` – Utility functions (e.g., backend URL construction)
  - `AuthContext.tsx` – Authentication context/provider
  - `index.tsx` – App entry point
- `public/` – Static assets

## Main Components
- **PhotoUpload**: Handles drag-and-drop and file picker uploads.
- **PhotoDetails**: Sidebar with photo preview, metadata, tags, and favorite button.
- **ViewControls**: Controls for view mode, sorting, searching, and zoom.
- **BulkActions**: Bar for bulk delete/download/tagging when photos are selected.

## How the UI Works
- The main page displays photos in a grid or list. You can zoom in/out, search, and sort.
- Click a photo to see details and metadata in a sidebar.
- Use the selection mode to select multiple photos for bulk actions.
- All actions interact with the backend API (see `server/`).

## Customization
- Tailwind CSS is used for styling. You can customize styles in `tailwind.config.js` and `index.css`.
- Environment variables can be set in `.env`.

---
See the root README for project-wide info, and `server/README.md` for backend details.