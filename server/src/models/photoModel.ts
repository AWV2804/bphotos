import mongoose from "mongoose";

export interface IPhoto extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    filename: string;
    gridFSFileId: mongoose.Schema.Types.ObjectId;
    contentType: string;
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
    contentType: { type: String, required: true },
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

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);
