import { MongoClient, GridFSBucket, Db, PushOperator } from 'mongodb';
import dotenv from 'dotenv';  // Import dotenv
import mongoose from 'mongoose';
import fs from 'fs';
import { logInfo } from '../utils/logger';
import { User } from '../models/userModel';
import { Photo } from '../models/photoModel';
import { Readable } from 'stream';
import bcrypt from 'bcrypt';
import { PathToFileUrlOptions } from 'url';

dotenv.config();  // Load environment variables from .env file

let gridFSBucket: GridFSBucket | null = null;

// #region Mongo
/**
 * Connects to the MongoDB database using credentials from environment variables.
 * 
 * @returns {Promise<[boolean, mongoose.Connection | Error]>} A promise that resolves to a tuple.
 * The first element is a boolean indicating success or failure.
 * The second element is either the mongoose connection object on success, or an Error object on failure.
 * 
 * @throws {Error} If the database connection is undefined.
 * 
 * @remarks
 * - The MongoDB URI is constructed using the `SERVER_MONGO_USER` and `SERVER_MONGO_PASSWORD` environment variables.
 * - If either `SERVER_MONGO_USER` or `SERVER_MONGO_PASSWORD` is not provided, the function logs an error and returns a tuple with `false` and an Error object.
 * - On successful connection, a GridFSBucket is initialized with the name 'photos'.
 * - Any errors during the connection process are caught, logged, and returned as part of the tuple.
 */
export async function connectToMongoDB() {
    const SERVER_MONGO_USER = process.env.SERVER_MONGO_USER;
    const SERVER_MONGO_PASSWORD = process.env.SERVER_MONGO_PASSWORD;
    //logInfo(SERVER_MONGO_USER, SERVER_MONGO_PASSWORD);
    const uri = `mongodb://${SERVER_MONGO_USER}:${SERVER_MONGO_PASSWORD}@localhost:27017/bphotos?authSource=admin`;

    if (!SERVER_MONGO_USER || !SERVER_MONGO_PASSWORD) {
        logInfo('MongoDB username or password not provided');
        return [false, Error('MongoDB username or password not provided')];
    }
    try {
        const connection = await mongoose.connect(uri);
        logInfo('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (db) {
            gridFSBucket = new GridFSBucket(db, { bucketName: 'photos' });
        } else {
            throw new Error('Database connection is undefined');
        }

        return [true, connection];
    } catch (error) {
        logInfo('Error connecting to MongoDB: ', error);
        return [false, error as Error];
    }
}

/**
 * Disconnects from the MongoDB database.
 *
 * @param {mongoose.Connection} db - The mongoose connection instance to disconnect.
 * @returns {Promise<[boolean, any]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either the success result or an error.
 */
export async function disconnectMongoDB(db: mongoose.Connection) {
    try {
        const success = await mongoose.disconnect();
        logInfo('Database deleted successfully');
        return [true, success];
    } catch (error) {
        logInfo('Error deleting database: ', error);
        return [false, error as Error];
    }
}

// #endregion

// #region GridFS
/**
 * Uploads a file to GridFS.
 *
 * @param {string} filePath - The path to the file to be uploaded.
 * @param {string} filename - The name to be given to the file in GridFS.
 * @returns {Promise<ObjectId | Error>} - A promise that resolves with the GridFS file ID if the upload is successful, or an error if it fails.
 * @throws {Error} - Throws an error if GridFSBucket is not initialized.
 */
export async function uploadFileToGridFS(filePath: string, filename: string) {
    try {
        if (!mongoose.connection.db) {
            logInfo('Database connection is not established. Call connectToMongoDB first.');
            return Error('Database connection is not established. Call connectToMongoDB first.');
        }

        if (!gridFSBucket) {
            logInfo('GridFSBucket is not initialized. Call connectToMongoDB first.');
            return Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
        }

        const uploadStream = gridFSBucket.openUploadStream(filename);
        fs.createReadStream(filePath).pipe(uploadStream);

        return new Promise((resolve, reject) => {
            uploadStream.on('finish', () => {
                logInfo(`File uploaded successfully with ID: ${uploadStream.id}`);
                resolve(uploadStream.id); // This is the GridFS file ID
            });
            uploadStream.on('error', (err) => {
                logInfo('Error uploading file to GridFS:', err);
                reject(err);
            });
        });
    } catch (error) {
        logInfo('Error in uploadFileToGridFS:', error as Error);
        return error as Error;
    }
}

/**
 * Downloads a file from GridFS using the provided gridFSfile ID.
 *
 * @param {string} fileId - The ID of the file to download from GridFS.
 * @returns {Promise<NodeJS.ReadableStream>} - A promise that resolves to a readable stream of the file.
 * @throws {Error} - Throws an error if the database connection is not established or if any other error occurs during the download process.
 */
export async function downloadFileFromGridFS(gridFSfileId: string): Promise<NodeJS.ReadableStream | Error> {
    try {
        if (!mongoose.connection.db) {
            logInfo('Database connection is not established. Call connectToMongoDB first.');
            return Error('Database connection is not established. Call connectToMongoDB first.');
        }

        if (!gridFSBucket) {
            logInfo('GridFSBucket is not initialized. Call connectToMongoDB first.');
            return Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
        }

        const objectId = new mongoose.Types.ObjectId(gridFSfileId);
        const fileStream = gridFSBucket.openDownloadStream(objectId);

        return fileStream;
    } catch (error) {
        logInfo('Error in downloadFileFromGridFS:', error);
        return error as Error;
    }
}

/**
 * Clears all files from the GridFSBucket.
 *
 * This function deletes all files stored in the GridFSBucket. It first checks if the
 * GridFSBucket is initialized. If not, it returns an error. Otherwise, it retrieves
 * all files from the bucket and deletes each one.
 *
 * @returns {Promise<true | Error>} - Returns `true` if all files are successfully deleted,
 * or an `Error` if the GridFSBucket is not initialized.
 *
 * @throws {Error} - Throws an error if there is an issue deleting the files.
 */
export async function clearGridFSBucket() {
    try {
        if (!gridFSBucket) {
            return Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
        }

        const files = await gridFSBucket.find().toArray();
        for (const file of files) {
            const deletedFile = await gridFSBucket.delete(file._id);
            logInfo(deletedFile);
        }

        logInfo('All GridFS files deleted');
        return true
    } catch (error) {
        logInfo('Error deleting all GridFS files:', error);
        return false;
    }
}

/**
 * Deletes a file from GridFS using the provided file ID.
 *
 * @param {mongoose.Types.ObjectId} gridFSFileId - The ID of the file to delete from GridFS.
 * @returns {Promise<boolean>} - Returns true if the file was successfully deleted, otherwise returns false.
 * @throws {Error} - Throws an error if GridFSBucket is not initialized.
 */
export async function deletePhotofromGridFS(gridFSFileId: mongoose.Types.ObjectId) {
    try {
        if (!gridFSBucket) {
            return Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
        }
        const file = await gridFSBucket.find({ _id: gridFSFileId });
        if (!file) {
            logInfo('File not found in GridFS');
            return false;
        }
        const deletedFile = await gridFSBucket.delete(gridFSFileId);
        logInfo(`File deleted from GridFS with GridFSId: ${gridFSFileId.toString()}`, deletedFile);
        return true;
    } catch (error) {
        logInfo(`Error deleting file from GridFS with GridFSId: ${gridFSFileId.toString()}`, error);
        return false;
    }
}

/**
 * Renames a file in GridFS.
 *
 * @param {string} gridFSfileId - The ID of the file in GridFS to be renamed.
 * @param {string} newFilename - The new name for the file.
 * @returns {Promise<true | Error>} - Returns true if the file was successfully renamed, or an Error if an error occurred.
 *
 * @throws {Error} If GridFSBucket is not initialized.
 * @throws {Error} If the file is not found in GridFS.
 *
 * @example
 * ```typescript
 * const result = await renamePhotoinGridFS('60d5ec49f1e7f2a5c8b5e4d2', 'newFilename.jpg');
 * if (result instanceof Error) {
 *     console.error(result.message);
 * } else {
 *     console.log('File renamed successfully');
 * }
 * ```
 */
export async function renamePhotoinGridFS(gridFSfileId: string, newFilename: string) {
    try {
        if (!gridFSBucket) {
            return Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
        }
        const gridFSObjectId = new mongoose.Types.ObjectId(gridFSfileId);
        const file = await gridFSBucket.find({ _id: gridFSObjectId });
        if (!file) {
            logInfo('File not found in GridFS');
            return Error('File not found in GridFS');
        }
        await gridFSBucket.rename(gridFSObjectId, newFilename);
        logInfo(`File renamed in GridFS with GridFSId: ${gridFSfileId.toString()}`);
        return true;
    } catch (error) {
        logInfo(`Error renaming file in GridFS with GridFSId: ${gridFSfileId.toString()}`, error);
        return error as Error;
    }
}
// #endregion

// #region User
/**
 * Retrieves a user by their email address.
 *
 * @param email - The email address of the user to retrieve.
 * @returns A promise that resolves to a tuple. The first element is a boolean indicating success or failure.
 *          The second element is either the user object if found, or an Error object if not found or if an error occurred.
 *
 * @throws Will throw an error if there is an issue with the database query.
 */
export async function getUserByEmail(email: string) {
    try {
        const user = await User.findOne({ email: email });
        if (user == null) {
            logInfo('User email not found');
            return [false, Error('User email not found')];
        }
        logInfo('User found by email:', user);
        return [true, user];
    } catch (error) {
        logInfo('Error getting user by email:', error);
        return [false, error as Error];
    }
}

/**
 * Retrieves a user by their username from the database.
 *
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<[boolean, User | Error]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either the user object or an error.
 *
 * @throws {Error} If there is an error during the database query.
 */
export async function getUserByUsername(username: string) {
    try {
        const user = await User.findOne({ username: username });
        if (user == null) {
            logInfo('User username not found');
            return [false, Error('User username not found')];
        }
        logInfo('User found by username:', user);
        return [true, user];
    } catch (error) {
        logInfo('Error getting user by username:', error);
        return [false, error as Error];
    }
}

/**
 * Adds a new user to the database.
 *
 * @param name - The name of the user.
 * @param email - The email address of the user.
 * @param username - The username of the user.
 * @param passwordHash - The hashed password of the user.
 * @returns A promise that resolves to a tuple. The first element is a boolean indicating success or failure.
 *          The second element is either the newly created user object or an error object.
 *
 * @throws Will throw an error if there is an issue with adding the user to the database.
 */
export async function addUser(name: string, email: string, username: string, passwordHash: string) {
    try {
        const checkUserEmail = await getUserByEmail(email);
        if (checkUserEmail[0] == true) {
            logInfo('User email already exists');
            return [false, Error('User email already exists')];
        }
        const checkUserName = await getUserByUsername(username);
        if (checkUserName[0] == true) {
            logInfo('User username already exists');
            return [false, Error('User username already exists')];
        }
        const newUser = new User({
            name: name,
            email: email,
            username: username,
            passwordHash: passwordHash
        });
        const result = await newUser.save();
        logInfo('User added:', result);
        return [true, result];
    } catch (error) {
        logInfo('Error adding user:', error);
        return [false, error as Error];
    }
}

/**
 * Removes a user by their username.
 *
 * This function attempts to delete a user from the database based on the provided username.
 * If the user does not exist, it logs an informational message and returns an error.
 * If the user is successfully deleted, it logs the result and returns it.
 *
 * @param {string} username - The username of the user to be removed.
 * @returns {Promise<[boolean, any]>} A promise that resolves to a tuple where the first element is a boolean indicating success or failure, and the second element is either the result of the deletion or an error.
 */
export async function removeUserByName(username: string) {
    try {
        const checkUserName = await getUserByUsername(username);
        if (checkUserName[0] == false) {
            logInfo('User username does not exist');
            return [false, Error('User username does not exist')];
        }
        const result = await User.deleteOne({ username: username });
        logInfo('User deleted:', result);
        return [true, result];
    } catch (error) {
        logInfo('Error deleting user:', error);
        return [false, error as Error];
    }
}

/**
 * Retrieves all users from the database.
 *
 * @returns {Promise<[boolean, User[] | Error]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either an array of users or an error.
 */
export async function getAllUsers() {
    try {
        const users = await User.find();
        logInfo('All users:', users);
        return [true, users];
    } catch (error) {
        logInfo('Error getting all users:', error);
        return [false, error as Error];
    }
}

/**
 * Creates an admin user if one does not already exist.
 * 
 * This function checks if an admin user with the username 'admin' already exists in the database.
 * If the admin user does not exist, it creates a new admin user with the username 'admin', 
 * email 'admin@admin.com', and a hashed password from the environment variable `ADMIN_PASSWORD`.
 * 
 * @returns {Promise<[boolean, Error | any]>} A promise that resolves to a tuple. The first element 
 * is a boolean indicating success or failure. The second element is either the created user object 
 * or an error object.
 * 
 * @throws {Error} If there is an error during the creation of the admin user, it will be caught and logged.
 */
export async function createAdminUser() {
    try {
        const adminUser = await User.findOne({ username: 'admin' });
        if (adminUser) {
            logInfo('Admin user already exists');
            return [false, Error('Admin user already exists')];
        }
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10);
        const [success, result] = await addUser("admin", "admin@admin.com", (process.env.ADMIN_USER as string), hashedPassword);
        if (success) {
            logInfo('Admin user created:', result);
            return [true, result];
        }
    } catch (error) {
        logInfo('Error creating admin user:', error);
        return [false, error as Error];
    }
}
// #endregion

// #region Photo
/**
 * Retrieves a photo by its ID from the database.
 *
 * @param {string} photoId - The ID of the photo to retrieve.
 * @returns {Promise<[boolean, Photo | Error]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either the retrieved photo or an error.
 *
 * @throws {Error} If there is an error during the database query.
 */
export async function getPhotoById(photoId: string) {
    try {
        const photo = await Photo.findOne({ _id: photoId });
        if (photo == null) {
            logInfo('Photo not found');
            return [false, Error('Photo not found')];
        }
        logInfo('Photo found:', photo);
        return [true, photo];
    } catch (error) {
        logInfo('Error getting photo by ID:', error);
        return [false, error as Error];
    }
}

/**
 * Retrieves all photos from the database.
 *
 * @returns {Promise<[boolean, Photo[] | Error]>} A promise that resolves to a tuple where the first element is a boolean indicating success, and the second element is either an array of photos or an error.
 */
export async function getAllPhotos() {
    try {
        const photos = await Photo.find();
        logInfo('All photos:', photos);
        return [true, photos];
    } catch (error) {
        logInfo('Error getting all photos:', error);
        return [false, error as Error];
    }
}

/**
 * Deletes a photo from the photos collection in the database.
 *
 * @param {mongoose.Types.ObjectId} photoId - The ID of the photo to delete.
 * @returns {Promise<[boolean, any]>} A promise that resolves to a tuple where the first element is a boolean indicating success or failure, and the second element is either the result of the deletion or an error.
 *
 * @throws {Error} If there is an error during the deletion process.
 *
 * @example
 * const [success, result] = await deletePhotofromPhotosCollection(photoId);
 * if (success) {
 *   console.log('Photo deleted successfully:', result);
 * } else {
 *   console.error('Failed to delete photo:', result);
 * }
 */
export async function deletePhotofromPhotosCollection(photoId: mongoose.Types.ObjectId) {
    try {
        // Check if db connection is initialized
        const db = mongoose.connection.db;
        if (!db) {
            logInfo('Database connection is undefined. Call connectToMongoDB first.');
            return [false, Error('Database connection is undefined. Call connectToMongoDB first.')];
        }

        // Check if entry is in photos collection
        const photo = await Photo.findOne({ _id: photoId });
        if (!photo) {
            logInfo('Photo not found');
            return [false, Error('Photo not found')];
        }

        // Delete from photos collection
        const result = await Photo.deleteOne({ _id: photoId });
        if (result.deletedCount == 0) {
            logInfo('Error deleting photo');
            return [false, Error('Error deleting photo')];
        }
        logInfo(`Photo deleted from photos collection with id ${photoId.toString()}:`, result);
        return [true, result];
    } catch (error) {
        logInfo(`Error deleting photo from photos collection with idL ${photoId.toString()}:`, error);
        return [false, error as Error];
    }
}

/**
 * Renames a photo in the photos collection.
 *
 * @param {string} photoId - The ID of the photo to rename.
 * @param {string} newFilename - The new filename for the photo.
 * @returns {Promise<true | Error>} - Returns true if the photo was successfully renamed, or an Error if there was an issue.
 *
 * @throws {Error} - Throws an error if the database connection is undefined or if the photo is not found.
 *
 * @example
 * ```typescript
 * const result = await renamePhotoinPhotosCollection('photoId123', 'newFilename.jpg');
 * if (result instanceof Error) {
 *     console.error(result.message);
 * } else {
 *     console.log('Photo renamed successfully');
 * }
 * ```
 */
export async function renamePhotoinPhotosCollection(photoId: string, newFilename: string) {
    try {
        // Check if db connection is initialized
        const db = mongoose.connection.db;
        if (!db) {
            logInfo('Database connection is undefined. Call connectToMongoDB first.');
            return Error('Database connection is undefined. Call connectToMongoDB first.');
        }

        // Check if entry is in photos collection
        const photo = await Photo.findOne({ _id: photoId });
        if (!photo) {
            logInfo('Photo not found');
            return Error('Photo not found');
        }

        // Rename file in photos collection
        const result = await Photo.updateOne({ _id: photoId }, { filename: newFilename });
        if (result.modifiedCount == 0) {
            logInfo('Error renaming photo');
            return Error('Error renaming photo');
        }
        logInfo(`Photo renamed in photos collection with id ${photoId.toString()}:`, result);
        return true;
    } catch (error) {
        logInfo(`Error renaming photo in photos collection with idL ${photoId.toString()}:`, error);
        return error as Error;
    }
}
// #endregion

// #region Mixed

/**
 * Deletes a photo from the database and GridFS storage.
 *
 * @param {string} photoId - The ID of the photo to delete.
 * @returns {Promise<[boolean, Error | null]>} - A promise that resolves to a tuple where the first element is a boolean indicating success or failure, and the second element is an error object if an error occurred, otherwise null.
 *
 * @throws {Error} - Throws an error if the database connection is not initialized.
 * @throws {Error} - Throws an error if the photo is not found in the database.
 * @throws {Error} - Throws an error if there is an issue deleting the file from GridFS.
 * @throws {Error} - Throws an error if there is an issue deleting the photo from the photos collection.
 */
export async function deletePhoto(photoId: string) {
    try {

        //Check if db connection is initialized
        const db = mongoose.connection.db;
        if (!db) {
            logInfo('Database connection is undefined. Call connectToMongoDB first.');
            return [false, Error('Database connection is undefined. Call connectToMongoDB first.')];
        }

        const objectId = new mongoose.Types.ObjectId(photoId);
        // Check if entry is in photos collection
        const photo = await Photo.findOne({ _id: photoId });
        if (!photo) {
            logInfo('Photo not found');
            return [false, Error('Photo not found')];
        }

        // Delete file from GridFS
        const gridFSFileId = new mongoose.Types.ObjectId(photo.gridFSFileId.toString());
        const success_gridfs = await deletePhotofromGridFS(gridFSFileId);
        if (!success_gridfs) {
            logInfo('Error deleting file from GridFS');
            return [false, Error('Error deleting file from GridFS')];
        }

        // Delete from photos collection
        const result = await Photo.deleteOne({ _id: objectId });
        if (result.deletedCount == 0) {
            logInfo('Error deleting photo');
            return [false, Error('Error deleting photo')];
        }
        return [true, null];
    } catch (error) {
        logInfo('Error deleting photo:', error);
        return [false, error as Error];
    }
}

/**
 * Renames a photo in both the Photos collection and GridFS.
 *
 * @param {string} photoId - The ID of the photo to rename.
 * @param {string} newFilename - The new filename for the photo.
 * @returns {Promise<true | Error>} - Returns true if the rename operation is successful, otherwise returns an Error.
 *
 * @throws {Error} - Throws an error if the database connection is undefined or if the photo is not found.
 *
 * The function performs the following steps:
 * 1. Checks if the database connection is defined.
 * 2. Finds the photo in the Photos collection using the provided photoId.
 * 3. Renames the photo in the Photos collection.
 * 4. Renames the photo in GridFS.
 * 5. If renaming in GridFS fails, rolls back the rename operation in the Photos collection.
 * 6. Logs appropriate messages at each step.
 */
export async function renamePhoto(photoId: string, newFilename: string) {
    const db = mongoose.connection.db;
    try {
        if (!db) {
            logInfo('Database connection is undefined. Call connectToMongoDB first.');
            return Error('Database connection is undefined. Call connectToMongoDB first.');
        }
        const photo = await Photo.findOne({ _id: photoId });
        if (!photo) {
            logInfo('Photo not found in Photos collection');
            return Error('Photo not found in Photos collection');
        }

        const originalFilename = photo.filename;
        const gridFSFileId = photo.gridFSFileId.toString();

        const renamePhotoCollectionResult = await renamePhotoinPhotosCollection(photoId, newFilename);
        if (renamePhotoCollectionResult instanceof Error) {
            logInfo("Error renaming in Photos collection, aborting rename operation.");
            return renamePhotoCollectionResult;
        }

        const renameGridFSResult = await renamePhotoinGridFS(gridFSFileId, newFilename);
        if (renameGridFSResult instanceof Error) {
            logInfo("Error renaming in GridFS, rolling back Photos collection rename.");
            await renamePhotoinPhotosCollection(photoId, originalFilename);
            logInfo("Rollback completed in Photos collection.");
            return renameGridFSResult;
        }

        logInfo(`Successfully renamed photo with ID ${photoId} from ${originalFilename} to ${newFilename}`);
        return true;
    } catch (error) {
        logInfo("Error renaming photos:", error);
        return error as Error;
    }
}
// #endregion














/*
Temp Tests
*/

// async function testSchemas() {
//   try {
//     // Create and save a new user
//     const newUser = new User({
//       name: 'John Doe',
//       email: 'john@example.com',
//       username: 'johndoe',
//       passwordHash: 'hashed_password_here',
//     });
//     await newUser.save();
//     console.log('User saved:', newUser);

//     // Create and save a new photo
//     const newPhoto = new Photo({
//       userId: newUser._id,
//       filename: 'example.jpg',
//       gridFSFileId: '64bcd9f0e2c9f1b7c9e7b812', // Example GridFS file ID
//       dateTaken: new Date(),
//       size: 1024,
//       tags: ['example', 'test'],
//       importantMetadata: {
//         Make: 'Canon',
//         Model: 'EOS 70D',
//         Location: {
//           Latitude: 34.0522,
//           Longitude: -118.2437,
//         },
//         Dimensions: {
//           width: 1920,
//           height: 1080,
//         },
//       },
//       fullMetadata: {
//         Make: 'Canon',
//         Model: 'EOS 70D',
//         ISO: 100,
//       },
//     });
//     await newPhoto.save();
//     console.log('Photo saved:', newPhoto);
//   } catch (error) {
//     logInfo('Error testing schemas:', error);
//   }
// }

// async function testUploadPictureGridFS() {
//   await connectToMongoDB();
//   const fileId = await uploadFileToGridFS('/home/athar/Documents/bphotos/SamplePhotos/Yellowstone Day 1 016.JPG', 'Yellowstone Day 1 016.jpg');
//   console.log('File uploaded with ID:', fileId);
// }

// async function testDownloadPictureGridFS() {
//   await connectToMongoDB();
//   await downloadFileFromGridFS('6798019dac0952c94cdaab77', '/home/athar/Documents/bphotos/server/tests/DownloadedTestPhotos/Yellowstone Day 1 016_downloaded.jpg');
// }

// async function testFindUser() {
//   await connectToMongoDB();
//   const [success, user] = await getUserByEmail('john@example.com');
//   if (success) {
//     logInfo('Users found:', (user as any)._id.toString());
//   }
// }
// async function deleteGridFS() {
//   await connectToMongoDB();
//   await deleteAllGridFS();
// }
// deleteGridFS();
// testFindUser();
// testDownloadPictureGridFS();