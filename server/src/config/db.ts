import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

dns.setServers(['8.8.8.8']);

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log('[db] connected successfully');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}