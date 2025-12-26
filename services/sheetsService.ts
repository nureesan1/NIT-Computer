
import { Transaction, Product, Task, CompanyProfile } from "../types";

const STORAGE_KEY = 'nit_sheet_api_url';
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbzfWSTp3TkTlF4EJeOZz6RRLwuUQh9uWdBYBmB7wzFaOv1d3r2qdkoxvFolxsxdK53wYQ/exec';

export const getApiUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
};

export const saveApiUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY, url.trim());
};

export const isSheetsConfigured = () => {
  const url = getApiUrl();
  return url && url.startsWith('https://script.google.com');
};

export const fetchInitialData = async () => {
  const url = getApiUrl();
  if (!url) return null;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    if (json.status === 'success') return json.data;
    return null;
  } catch (error) {
    console.error("Failed to fetch data from Google Sheets:", error);
    return null;
  }
};

const sendRequest = async (action: string, data: any): Promise<boolean> => {
  const url = getApiUrl();
  if (!url) return false;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      redirect: 'follow', 
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({ action, data }),
    });

    // ในกรณีของ GAS Web App ที่มีการ Redirect ข้ามโดเมน
    // หากได้รับสถานะ OK หรือ Opaque มักหมายถึงข้อมูลถูกส่งไปถึงมือ Server แล้ว
    if (response.ok || response.type === 'opaque') {
      return true;
    }

    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error(`API Request Error [${action}]:`, error);
    // กรณีบันทึกสำเร็จแต่ติด CORS Error ตอนขากลับ มักจะยังบันทึกได้อยู่
    // ให้ตรวจสอบใน Sheets หากมั่นใจว่าเน็ตเวิร์กทำงานปกติ
    return false;
  }
};

export const api = {
  addTransaction: (t: Transaction) => sendRequest('ADD_TRANSACTION', t),
  addProduct: (p: Product) => sendRequest('ADD_PRODUCT', p),
  updateProduct: (p: Partial<Product> & { id: string }) => sendRequest('UPDATE_PRODUCT', p),
  deleteProduct: (id: string) => sendRequest('DELETE_PRODUCT', { id }),
  addTask: (t: Task) => sendRequest('ADD_TASK', t),
  updateTaskStatus: (id: string, status: string) => sendRequest('UPDATE_TASK_STATUS', { id, status }),
  deleteTask: (id: string) => sendRequest('DELETE_TASK', { id }),
  updateCompanyProfile: (profile: CompanyProfile) => sendRequest('UPDATE_COMPANY_PROFILE', profile),
};
