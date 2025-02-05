import { MongoClient, GridFSBucket, Db } from 'mongodb';
import dotenv from 'dotenv';  // Import dotenv
import mongoose from 'mongoose';
import fs from 'fs';
import { logInfo } from '../utils/logger';
import { User } from '../models/userModel';
import { Photo } from '../models/photoModel';

dotenv.config();  // Load environment variables from .env file

let gridFSBucket: GridFSBucket | null = null;

export async function connectToMongoDB() {
  const SERVER_MONGO_USER = process.env.SERVER_MONGO_USER;
  const SERVER_MONGO_PASSWORD = process.env.SERVER_MONGO_PASSWORD;
  //logInfo(SERVER_MONGO_USER, SERVER_MONGO_PASSWORD);
  const uri = `mongodb://${SERVER_MONGO_USER}:${SERVER_MONGO_PASSWORD}@localhost:27017/bphotos?authSource=admin`;

  if (!SERVER_MONGO_USER || !SERVER_MONGO_PASSWORD) {
    console.error('MongoDB username or password not provided');
    return [false, 'MongoDB username or password not provided'];
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
    console.error('Error connecting to MongoDB: ', error);
    return [false, error];
  }
}

export async function disconnectMongoDB(db: mongoose.Connection) {
  try {
    const success = await mongoose.disconnect();
    logInfo('Database deleted successfully');
    return [true, success];
  } catch (error) {
    console.error('Error deleting database: ', error);
    return [false, error];
  }
}

export async function uploadFileToGridFS(filePath: string, filename: string) {
  try {
    if (!gridFSBucket) {
      throw new Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
    }

    const uploadStream = gridFSBucket.openUploadStream(filename);
    fs.createReadStream(filePath).pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        logInfo(`File uploaded successfully with ID: ${uploadStream.id}`);
        resolve(uploadStream.id); // This is the GridFS file ID
      });
      uploadStream.on('error', (err) => {
        console.error('Error uploading file to GridFS:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error in uploadFileToGridFS:', error);
    throw error;
  }
}
// #region workd
export async function downloadFileFromGridFS(fileId: string, outputPath: string) {
  try {
    if (!gridFSBucket) {
      throw new Error('GridFSBucket is not initialized. Call connectToMongoDB first.');
    }

    const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const fileStream = fs.createWriteStream(outputPath);

    downloadStream.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        logInfo(`File downloaded successfully to: ${outputPath}`);
        resolve(outputPath);
      });
      fileStream.on('error', (err) => {
        console.error('Error downloading file from GridFS:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error in downloadFileFromGridFS:', error);
    throw error;
  }
}

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
    return [false, error];
  }
}

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
    return [false, error];
  }
}

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
    return [false, error];
  }
}

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
    return [false, error];
  }
}

export async function getAllUsers() {
  try {
    const users = await User.find();
    logInfo('All users:', users);
    return [true, users];
  } catch (error) {
    logInfo('Error getting all users:', error);
    return [false, error];
  }
}
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
//     console.error('Error testing schemas:', error);
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

// testFindUser();
// testDownloadPictureGridFS();