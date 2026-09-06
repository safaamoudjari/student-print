import { Schema, model, Document, Types } from 'mongoose';

interface ICounter extends Document<Types.ObjectId | string> {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<ICounter>('Counter', counterSchema);

// Atomically increments and returns the next sequence number for `key`.
// Using findOneAndUpdate with $inc avoids race conditions between concurrent
// order creations (two students confirming an order at the same time).
export async function nextSequence(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq;
}
