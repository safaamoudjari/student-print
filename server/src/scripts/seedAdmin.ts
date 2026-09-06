import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';

// Creates (or updates) the first admin account from environment variables.
// Run with: npm run seed:admin
// This intentionally never hard-codes a password in source code — it must
// be supplied via ADMIN_EMAIL / ADMIN_PASSWORD in your .env file.
async function run() {
  if (!env.adminEmail || !env.adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.');
    process.exit(1);
  }
  if (env.adminPassword.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  const email = env.adminEmail.toLowerCase();

  const admin = await User.findOneAndUpdate(
    { email },
    {
      firstName: env.adminFirstName,
      lastName: env.adminLastName,
      email,
      passwordHash,
      phone: '0000000000',
      roomNumber: 'N/A',
      role: 'admin',
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready: ${admin.email}`);
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
