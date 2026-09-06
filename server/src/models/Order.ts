import { Schema, model, Document, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface IAdditionalService {
  serviceId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  studentId: Types.ObjectId;
  status: OrderStatus;
  colorMode: 'bw' | 'color';
  sides: 'single' | 'double';
  copies: number;
  additionalServices: IAdditionalService[];
  printingPrice: number;
  servicesPrice: number;
  totalPrice: number;
  priceBreakdown: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date | null;
  processingAt?: Date | null;
  readyAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  filesDeletedAt?: Date | null;
}

const additionalServiceSchema = new Schema<IAdditionalService>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    colorMode: { type: String, enum: ['bw', 'color'], required: true },
    sides: { type: String, enum: ['single', 'double'], required: true },
    copies: { type: Number, required: true, min: 1, default: 1 },
    additionalServices: { type: [additionalServiceSchema], default: [] },
    printingPrice: { type: Number, required: true, min: 0 },
    servicesPrice: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    priceBreakdown: { type: String, default: '' },
    notes: { type: String, maxlength: 500 },
    confirmedAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    readyAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    filesDeletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
