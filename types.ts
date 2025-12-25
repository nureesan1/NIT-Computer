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

export type TaskType = 'REPAIR' | 'INSTALLATION';
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
  description?: string; // Detailed description of the job/issue
  startDate: string; // ISO - Intake Date or Start Date
  endDate?: string; // ISO - Return Date or Install Date
  location?: string;
  assignee?: string; // Technician Name
  status: TaskStatus;
  customer?: Customer;
  estimatedCost?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}