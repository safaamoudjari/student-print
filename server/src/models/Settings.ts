import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  maxFileSizeMb: number;
  maxFilesPerOrder: number;
  maxCopies: number;
  fileRetentionDays: number;
  residenceName: string;
}

const settingsSchema = new Schema<ISettings>({
  maxFileSizeMb: { type: Number, default: 20, min: 1 },
  maxFilesPerOrder: { type: Number, default: 10, min: 1 },
  maxCopies: { type: Number, default: 20, min: 1 },
  fileRetentionDays: { type: Number, default: 7, min: 0 },
  residenceName: { type: String, default: 'Student Residence' },
});

// There should only ever be one Settings document. Use this helper to fetch
// it, creating sensible defaults the first time the app runs.
export async function getSettings(): Promise<ISettings> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

export const Settings = model<ISettings>('Settings', settingsSchema);
