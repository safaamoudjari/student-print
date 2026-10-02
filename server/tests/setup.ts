import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// الاختبارات ما تتصلش بـ Cloudinary الحقيقي
jest.mock('../src/config/cloudinary', () => ({
  uploadToCloudinary: jest.fn(async () => ({
    url: 'https://res.cloudinary.com/test/raw/upload/print-orders/fake.pdf',
    publicId: 'print-orders/fake',
    resourceType: 'raw',
  })),
  deleteFromCloudinary: jest.fn(async () => undefined),
}));

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});