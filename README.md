# BPhotos

**Status:** This project is not complete. Development is ongoing.

---

## Overview
BPhotos is a self-hosted photo storage system built with MongoDB and GridFS. It allows users to store and manage photos and their metadata in a flexible and efficient way.

## Features
- **File Storage**: Stores large photo files using MongoDB GridFS.
- **Metadata Management**: Stores photo metadata (e.g., camera make, model, date taken) as JSON for flexible querying.
- **Efficient Retrieval**: Indexes key metadata fields like `Make`, `Model`, and `DateTimeOriginal` for fast searches.
- **Secure Database Connection**: Supports MongoDB authentication with username and password.

## Prerequisites
- Node.js (v16 or later recommended)
- MongoDB (v5 or later)
- `npm` or `yarn`

---

<!--
This section provides setup instructions for testing the current state of the repository.
Note: There is no release version available yet, so these steps are for testing purposes only.
-->
## Setup
**Note:** There is no release version available yet, so these steps are for testing purposes only.

### 1. Clone the Repository
```bash
git clone https://github.com/AWV2804/bphotos
cd bphotos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory with the following content:
```
SERVER_MONGO_USER=admin
SERVER_MONGO_PASSWORD=[Enter a secure password here]
```
Replace `yourUsername` and `yourPassword` with your MongoDB credentials.

### 4. Run the Application
Connect to the MongoDB database and initialize the application:
```bash
node db.ts
```
If the connection is successful, you will see:
```
Connected to MongoDB
```

---

<!-- ## Usage
### Uploading Files
Photos and their metadata can be uploaded using the `connectDB` and `GridFSBucket` APIs. Example code snippets for uploading and querying files are available in `db.ts`.

### Querying Metadata
Metadata can be queried using MongoDB’s query operators. Indexed fields like `Make`, `Model`, and `Tags` provide fast lookup capabilities.

---

## Future Features
- Web-based user interface for uploading and managing photos.
- Integration with cloud storage for backups.
- Advanced search filters (e.g., date ranges, tags).

---

## Contributing
This project is in its early stages. Contributions are welcome! Please open an issue or submit a pull request if you’d like to contribute.

--- -->

## License
This project is licensed under the MIT License. See `LICENSE` for more details.

