import { Schema, model, Document, Types } from 'mongoose';

export type PageCountStatus = 'exact' | 'estimated' | 'unknown';

export interface IOrderFile extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  pageCountStatus: PageCountStatus;
  createdAt: Date;
}

const orderFileSchema = new Schema<IOrderFile>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    originalFileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    storagePath: { type: String, required: true, select: false },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    pageCount: { type: Number, required: true, default: 1 },
    pageCountStatus: {
      type: String,
      enum: ['exact', 'estimated', 'unknown'],
      default: 'estimated',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OrderFile = model<IOrderFile>('OrderFile', orderFileSchema);
