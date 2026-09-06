import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  // eslint-disable-next-line no-console
  console.log(`[db] connected to ${env.mongodbUri}`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
