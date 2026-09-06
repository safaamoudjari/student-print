import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  roomNumber: string;
  residence?: string;
  role: UserRole;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    residence: { type: String, trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never leak the hash even if `select` is bypassed somewhere.
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.failedLoginAttempts;
    delete ret.lockedUntil;
    return ret;
  },
});

export const User = model<IUser>('User', userSchema);
