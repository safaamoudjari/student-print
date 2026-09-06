import { nextSequence } from '../models/Counter';

// Produces human-friendly, unique order numbers like "PR-2026-00001".
// The sequence resets each year because the counter key includes the year.
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`order-${year}`);
  return `PR-${year}-${String(seq).padStart(5, '0')}`;
}
