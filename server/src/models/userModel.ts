import mongoose from 'mongoose';

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

export const User = mongoose.model<IUser>('User', userSchema);
