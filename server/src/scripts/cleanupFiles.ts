import fs from 'fs/promises';
import { connectDB, disconnectDB } from '../config/db';
import { Order } from '../models/Order';
import { OrderFile } from '../models/OrderFile';
import { getSettings } from '../models/Settings';

// Deletes uploaded files for orders that have been "completed" for longer
// than the configured retention period. Order metadata (order number,
// prices, dates, status) is always kept — only the files on disk and their
// database records are removed, and only for orders that reached a final
// state, so an active order can never be affected by this job.
//
// This is intentionally a script rather than an in-process timer, so you
// can schedule it safely and predictably with your OS's own scheduler:
//   Linux/macOS (cron), run once a day:
//     0 3 * * * cd /path/to/server && npm run cleanup:files >> cleanup.log 2>&1
// Run manually with: npm run cleanup:files
async function run() {
  await connectDB();

  const settings = await getSettings();
  if (settings.fileRetentionDays <= 0) {
    console.log('File retention is disabled (fileRetentionDays = 0). Nothing to do.');
    await disconnectDB();
    process.exit(0);
  }

  const cutoff = new Date(Date.now() - settings.fileRetentionDays * 24 * 60 * 60 * 1000);

  const eligibleOrders = await Order.find({
    status: 'completed',
    completedAt: { $lte: cutoff },
    filesDeletedAt: null,
  });

  let deletedFiles = 0;

  for (const order of eligibleOrders) {
    const files = await OrderFile.find({ orderId: order._id }).select('+storagePath');
    for (const file of files) {
      await fs.unlink(file.storagePath).catch(() => undefined);
      await file.deleteOne();
      deletedFiles += 1;
    }
    order.filesDeletedAt = new Date();
    await order.save();
  }

  console.log(
    `Cleanup complete: removed ${deletedFiles} file(s) from ${eligibleOrders.length} completed order(s) older than ${settings.fileRetentionDays} day(s).`
  );

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
