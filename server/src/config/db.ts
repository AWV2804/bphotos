import { MongoClient, GridFSBucket, Db } from 'mongodb';
import dotenv from 'dotenv';  // Import dotenv
import mongoose from 'mongoose';

dotenv.config({ path: '../../.env' });  // Load environment variables from .env file

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
}

export const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
});

export interface IPhoto extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  filename: string;
  gridFSFileId: mongoose.Schema.Types.ObjectId;
  dateTaken?: Date;
  size?: number;
  tags?: string[];
  importantMetadata: {
    Make?: string;
    Model?: string;
    Location?: {
      Latitude: number;
      Longitude: number;
    };
    Dimensions?: {
      width: number;
      height: number
    };
  };
  fullMetadata: any;
  uploadedAt: Date;
} 

export const photoSchema = new mongoose.Schema<IPhoto>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  filename: { type: String, required: true },
  gridFSFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  dateTaken: { type: Date },
  size: { type: Number },
  tags: { type: [String] },
  importantMetadata: {
    Make: { type: String },
    Model: { type: String },
    Location: {
      Latitude: { type: Number },
      Longitude: { type: Number },
    },
    Dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
  },
  fullMetadata: { type: mongoose.Schema.Types.Mixed },
  uploadedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);

let gridFSBucket: GridFSBucket | null = null;

export async function connectToMongoDB() {
  const SERVER_MONGO_USER = process.env.SERVER_MONGO_USER;
  const SERVER_MONGO_PASSWORD = process.env.SERVER_MONGO_PASSWORD;
  console.log(SERVER_MONGO_USER, SERVER_MONGO_PASSWORD);
  const uri = `mongodb://${SERVER_MONGO_USER}:${SERVER_MONGO_PASSWORD}@localhost:27017/bphotos?authSource=admin`;

  if (!SERVER_MONGO_USER || !SERVER_MONGO_PASSWORD) {
    console.error('MongoDB username or password not provided');
    return [false, 'MongoDB username or password not provided'];
  }
  try {
    const connection = await mongoose.connect(uri);
    console.info('Connected to MongoDB');

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
    console.info('Database deleted successfully');
    return [true, success];
  } catch (error) {
    console.error('Error deleting database: ', error);
    return [false, error];
  }
}


connectToMongoDB();

async function testSchemas() {
  try {
    // Create and save a new user
    const newUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      passwordHash: 'hashed_password_here',
    });
    await newUser.save();
    console.log('User saved:', newUser);

    // Create and save a new photo
    const newPhoto = new Photo({
      userId: newUser._id,
      filename: 'example.jpg',
      gridFSFileId: '64bcd9f0e2c9f1b7c9e7b812', // Example GridFS file ID
      dateTaken: new Date(),
      size: 1024,
      tags: ['example', 'test'],
      importantMetadata: {
        Make: 'Canon',
        Model: 'EOS 70D',
        Location: {
          Latitude: 34.0522,
          Longitude: -118.2437,
        },
        Dimensions: {
          width: 1920,
          height: 1080,
        },
      },
      fullMetadata: {
        Make: 'Canon',
        Model: 'EOS 70D',
        ISO: 100,
      },
    });
    await newPhoto.save();
    console.log('Photo saved:', newPhoto);
  } catch (error) {
    console.error('Error testing schemas:', error);
  }
}

testSchemas();