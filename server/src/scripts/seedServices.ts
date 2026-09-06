import { connectDB, disconnectDB } from '../config/db';
import { Service } from '../models/Service';

// Seeds the default price list described in the project brief. Safe to run
// more than once — it will not duplicate services that already exist.
// Run with: npm run seed:services
const DEFAULT_SERVICES = [
  { name: 'Black & White Printing', type: 'per_page_bw', price: 5, unit: 'DA/page', isCore: true },
  { name: 'Color Printing', type: 'per_page_color', price: 25, unit: 'DA/page', isCore: true },
  { name: 'Scanning', type: 'flat', price: 10, unit: 'DA', isCore: false },
  { name: 'Binding', type: 'flat', price: 75, unit: 'DA', isCore: false },
  { name: 'Stapling', type: 'flat', price: 20, unit: 'DA', isCore: false },
] as const;

async function run() {
  await connectDB();

  for (const s of DEFAULT_SERVICES) {
    const existing = await Service.findOne({ name: s.name });
    if (!existing) {
      await Service.create(s);
      console.log(`Created service: ${s.name}`);
    } else {
      console.log(`Service already exists, skipping: ${s.name}`);
    }
  }

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
