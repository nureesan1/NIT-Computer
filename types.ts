
export enum UserRole {
  ADMIN = 'Admin',
  ACCOUNTING = 'Accounting',
  STOCK = 'Stock',
  TECHNICIAN = 'Technician',
  MANAGER = 'Manager'
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

export interface Task {
  id: string;
  type: TaskType;
  title: string;
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
}