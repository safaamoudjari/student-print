export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomNumber: string;
  residence?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface OrderFileSummary {
  _id: string;
  originalFileName: string;
  fileSize: number;
  pageCount: number;
  pageCountStatus: 'exact' | 'estimated' | 'unknown';
  mimeType?: string;
}

export interface AdditionalServiceLine {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  studentId: string | User;
  status: OrderStatus;
  colorMode: 'bw' | 'color';
  sides: 'single' | 'double';
  copies: number;
  additionalServices: AdditionalServiceLine[];
  printingPrice: number;
  servicesPrice: number;
  totalPrice: number;
  priceBreakdown: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string | null;
  processingAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  files?: OrderFileSummary[];
}

export type ServiceType = 'per_page_bw' | 'per_page_color' | 'flat' | 'per_unit';

export interface Service {
  _id: string;
  name: string;
  type: ServiceType;
  price: number;
  unit: string;
  isActive: boolean;
  isCore: boolean;
}

export interface PublicSettings {
  maxFileSizeMb: number;
  maxFilesPerOrder: number;
  maxCopies: number;
  residenceName: string;
}

export interface AdminSettings extends PublicSettings {
  fileRetentionDays: number;
}

export interface Statistics {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  ready: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}
