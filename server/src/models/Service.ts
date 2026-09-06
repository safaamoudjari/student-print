import { Schema, model, Document, Types } from 'mongoose';

export type ServiceType = 'per_page_bw' | 'per_page_color' | 'flat' | 'per_unit';

export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  type: ServiceType;
  price: number;
  unit: string;
  isActive: boolean;
  isCore: boolean; // core = black & white / color printing, cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['per_page_bw', 'per_page_color', 'flat', 'per_unit'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'DA' },
    isActive: { type: Boolean, default: true },
    isCore: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Service = model<IService>('Service', serviceSchema);
