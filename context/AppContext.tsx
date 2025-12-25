
import React, { createContext, useContext, useState, useEffect, ReactNode, ReactElement } from 'react';
import { Transaction, Product, Task, User, UserRole, CompanyProfile } from '../types';
import { api, fetchInitialData, isSheetsConfigured, saveApiUrl } from '../services/sheetsService';

const DEFAULT_COMPANY: CompanyProfile = {
  name: 'NIT Consulting Solution LTD.',
  address: '123 Tech Park, Bangkok 10250',
  phone: '02-123-4567',
  email: 'support@nit.co.th',
  taxId: '0105551234567',
  website: 'www.nit.co.th'
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-25', description: 'ซ่อมคอมพิวเตอร์', category: 'Service', amount: 1500, type: 'INCOME', paymentMethod: 'CASH' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', code: 'P001', name: 'สาย LAN CAT6', cost: 100, quantity: 50, unit: 'เมตร', minStockThreshold: 20 },
];

const MOCK_TASKS: Task[] = [
  { 
    id: '1', 
    type: 'REPAIR', 
    title: 'ซ่อม Notebook เปิดไม่ติด', 
    startDate: '2023-10-28', 
    status: 'IN_PROGRESS', 
    assignee: 'ช่างหนึ่ง',
    customer: { name: 'คุณสมชาย ใจดี', phone: '081-234-5678' }
  },
];

interface AppContextType {
  user: User;
  isAuthenticated: boolean;
  isDbConnected: boolean;
  isLoading: boolean;
  companyProfile: CompanyProfile;
  login: (password: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateCompanyProfile: (profile: CompanyProfile) => void;
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
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('company_profile');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
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
        
        // Load company profile from sheets if available
        if (data.companyprofile && data.companyprofile.length > 0) {
          const profile = data.companyprofile[0];
          setCompanyProfile(profile);
          localStorage.setItem('company_profile', JSON.stringify(profile));
        }
        
        setIsDbConnected(true);
      }
      setIsLoading(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateCompanyProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    localStorage.setItem('company_profile', JSON.stringify(profile));
    // Sync with Sheets
    api.updateCompanyProfile(profile);
  };

  const login = (password: string) => {
    if (password === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);
  const switchRole = (role: UserRole) => setUser(prev => ({ ...prev, role }));

  const configDatabase = async (url: string) => {
    saveApiUrl(url);
    if (!url) {
      setIsDbConnected(false);
      return true;
    }
    return await loadData();
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newT, ...prev]);
    api.addTransaction(newT as Transaction);
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newP = { ...p, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [...prev, newP]);
    api.addProduct(newP as Product);
  };

  const updateProduct = (id: string, p: Partial<Product>) => {
    setProducts(prev => prev.map(i => i.id === id ? { ...i, ...p } : i));
    api.updateProduct({ id, ...p });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(i => i.id !== id));
    api.deleteProduct(id);
  };

  const addTask = (t: Omit<Task, 'id'>) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTasks(prev => [...prev, newT]);
    api.addTask(newT as Task);
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    api.updateTaskStatus(id, status);
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, isDbConnected, isLoading, companyProfile, login, logout, switchRole, updateCompanyProfile,
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