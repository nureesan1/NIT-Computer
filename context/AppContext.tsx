import React, { createContext, useContext, useState, useEffect, ReactNode, ReactElement } from 'react';
import { Transaction, Product, Task, User, UserRole } from '../types';
import { api, fetchInitialData, isSheetsConfigured, saveApiUrl, getApiUrl } from '../services/sheetsService';

// Mock Data (Fallback)
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-25', description: 'ซ่อมคอมพิวเตอร์', category: 'Service', amount: 1500, type: 'INCOME', paymentMethod: 'CASH' },
  { id: '2', date: '2023-10-26', description: 'ค่าอินเทอร์เน็ต', category: 'Utility', amount: 590, type: 'EXPENSE', paymentMethod: 'TRANSFER' },
  { id: '3', date: '2023-10-27', description: 'ติดตั้งกล้องวงจรปิด', category: 'Service', amount: 8500, type: 'INCOME', paymentMethod: 'TRANSFER' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'P001', name: 'สาย LAN CAT6', cost: 100, quantity: 50, unit: 'เมตร', minStockThreshold: 20 },
  { id: '2', code: 'P002', name: 'Router WiFi 6', cost: 1200, quantity: 5, unit: 'เครื่อง', minStockThreshold: 5 },
  { id: '3', code: 'P003', name: 'หัว RJ45', cost: 5, quantity: 100, unit: 'หัว', minStockThreshold: 50 },
];

const MOCK_TASKS: Task[] = [
  { 
    id: '1', 
    type: 'REPAIR', 
    title: 'ซ่อม Notebook เปิดไม่ติด', 
    description: 'เครื่องเปิดไม่ติด ไฟเข้าแต่ภาพไม่ขึ้น',
    startDate: '2023-10-28', 
    endDate: '2023-10-30', 
    status: 'IN_PROGRESS', 
    assignee: 'ช่างหนึ่ง',
    customer: {
      name: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      address: '123 ถ.สุขุมวิท'
    },
    estimatedCost: 1500
  },
  { 
    id: '2', 
    type: 'INSTALLATION', 
    title: 'ติดตั้งระบบ Network', 
    description: 'เดินสาย LAN 10 จุด และติดตั้ง Access Point',
    startDate: '2023-11-01', 
    location: 'ตึก ABC ชั้น 5', 
    assignee: 'ทีม A', 
    status: 'PENDING',
    customer: {
      name: 'บริษัท ABC จำกัด',
      phone: '02-999-9999',
      company: 'ABC Co., Ltd.'
    },
    estimatedCost: 12000
  },
];

interface AppContextType {
  user: User;
  isAuthenticated: boolean;
  isDbConnected: boolean;
  isLoading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  tasks: Task[];
  addTask: (t: Omit<Task, 'id'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  configDatabase: (url: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }): ReactElement => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>({ id: 'u1', name: 'Demo User', role: UserRole.ADMIN });
  
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  // System States
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (isSheetsConfigured()) {
      setIsLoading(true);
      const data = await fetchInitialData();
      if (data) {
        setTransactions(data.transactions || []);
        setProducts(data.products || []);
        setTasks(data.tasks || []);
        setIsDbConnected(true);
      } else {
        // Fallback to mock if fetch fails
        setIsDbConnected(false); 
      }
      setIsLoading(false);
      return true;
    } else {
      setIsDbConnected(false);
      return false;
    }
  };

  // Initialize Data
  useEffect(() => {
    loadData();
  }, []);

  const configDatabase = async (url: string) => {
    saveApiUrl(url);
    if (!url) {
      setIsDbConnected(false);
      return true;
    }
    return await loadData();
  };

  const login = (password: string) => {
    if (password === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  // Optimistic Updates

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
    api.addTransaction(newTransaction as Transaction);
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [...prev, newProduct]);
    api.addProduct(newProduct as Product);
  };

  const updateProduct = (id: string, p: Partial<Product>) => {
    setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
    api.updateProduct({ id, ...p });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
    api.deleteProduct(id);
  };

  const addTask = (t: Omit<Task, 'id'>) => {
    const newTask = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTasks(prev => [...prev, newTask]);
    api.addTask(newTask as Task);
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    api.updateTaskStatus(id, status);
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, isDbConnected, isLoading, login, logout, switchRole,
      transactions, addTransaction,
      products, addProduct, updateProduct, deleteProduct,
      tasks, addTask, updateTaskStatus,
      configDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};