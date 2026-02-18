
export enum UserRole {
  ADMIN = 'Admin'
}

export type PaymentMethod = 'CASH' | 'TRANSFER';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string; // ISO Date
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  cost: number;
  quantity: number;
  unit: string;
  minStockThreshold: number;
}

export type TaskType = 'REPAIR' | 'INSTALLATION' | 'SYSTEM';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

export interface Customer {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  company?: string;
  taxId?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  brand?: string;
  model?: string;
  description?: string; 
  startDate: string; 
  endDate?: string; 
  location?: string;
  assignee?: string; 
  status: TaskStatus;
  customer?: Customer;
  estimatedCost?: number;
  deposit?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  website: string;
  logo?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  qrCode?: string;
}

export interface Warranty {
  id: string;
  purchaseDate: string;
  productName: string;
  modelCode: string;
  serialNumber: string;
  quantity: number;
  vendor: string;
  price: number;
  duration: string; // e.g., "1 ปี", "6 เดือน"
  startDate: string;
  expiryDate: string;
  conditions: string;
  hasDocuments: boolean;
}

export type QuotationStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  discount?: number;
  vatType: '7%' | 'Exempt' | '0%';
  total: number;
}

export interface Quotation {
  id: string;
  date: string;
  validityDays: number;
  customerName: string;
  customerCode?: string;
  customerTaxId?: string;
  customerAddress?: string;
  customerPhone: string;
  customerEmail?: string;
  items: QuotationItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  status: QuotationStatus;
}
