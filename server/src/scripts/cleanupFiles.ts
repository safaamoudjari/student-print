import { connectDB, disconnectDB } from '../config/db';
import { deleteFromCloudinary } from '../config/cloudinary';
import { Order } from '../models/Order';
import { OrderFile } from '../models/OrderFile';
import { getSettings } from '../models/Settings';

// Deletes uploaded files (from Cloudinary + their DB records) for orders that
// reached a final state (completed / cancelled) longer ago than the retention
// period. Order metadata (number, prices, dates, status) is always kept.
//
// If a Cloudinary deletion fails, the file record and the order are left
// untouched so the next run retries them (nothing is silently lost/leaked).
//
// Run manually:  npm run cleanup:files
// Schedule it on Render (Cron Job) or GitHub Actions - see notes.
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
    filesDeletedAt: null,
    $or: [
      { status: 'completed', completedAt: { $lte: cutoff } },
      { status: 'cancelled', cancelledAt: { $lte: cutoff } },
    ],
  });

  let deletedFiles = 0;
  let failedFiles = 0;

  for (const order of eligibleOrders) {
    const files = await OrderFile.find({ orderId: order._id }).select('+filePublicId +resourceType');
    let allDeleted = true;

    for (const file of files) {
      try {
        await deleteFromCloudinary(file.filePublicId, file.resourceType);
        await file.deleteOne();
        deletedFiles += 1;
      } catch (err) {
        allDeleted = false;
        failedFiles += 1;
        console.error(`Failed to delete file ${file._id} from Cloudinary:`, (err as Error).message);
      }
    }

    if (allDeleted) {
      order.filesDeletedAt = new Date();
      await order.save();
    }
  }

  console.log(
    `Cleanup complete: removed ${deletedFiles} file(s), ${failedFiles} failed (will retry), ` +
      `from ${eligibleOrders.length} order(s) older than ${settings.fileRetentionDays} day(s).`
  );

  await disconnectDB();
  process.exit(failedFiles > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});