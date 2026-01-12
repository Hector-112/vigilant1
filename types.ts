
export type Category = 'Food' | 'Medicine' | 'Cosmetics' | 'Household' | 'Other';

export interface Product {
  id: string;
  name: string;
  category: Category;
  expiryDate: string; // YYYY-MM-DD
  reminderDays: number;
  status: 'Fresh' | 'Expiring Soon' | 'Expired';
  addedAt: string;
  userId?: string;
  lastNotifiedAt?: string;
}

export interface Statistics {
  total: number;
  fresh: number;
  soon: number;
  expired: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
}

export interface NotificationLog {
  id: string;
  productId: string;
  productName: string;
  type: 'sms';
  recipient: string;
  timestamp: string;
  content: string;
  status: 'Delivered' | 'Ready' | 'Failed';
}

export interface TransmissionConfig {
  enabled: boolean;
  smsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}
