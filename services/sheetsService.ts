
import { Transaction, Product, Task, CompanyProfile } from "../types";

const STORAGE_KEY = 'nit_sheet_api_url';
// Default URL สำหรับตัวอย่าง (ควรเปลี่ยนเป็น URL ของตัวเองในหน้า Settings)
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxhmRRmS6EpW501tODiH0jSvf5Ebmaztj0aouVzxeTS4u20CmHXtasSHs7b_kusP-SnYg/exec';

export const getApiUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
};

export const saveApiUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY, url.trim());
};

export const isSheetsConfigured = () => {
  return getApiUrl().length > 0;
};

export const fetchInitialData = async () => {
  const url = getApiUrl();
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    if (json.status === 'success') {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch from Google Sheets", error);
    return null;
  }
};

const sendRequest = async (action: string, data: any): Promise<boolean> => {
  const url = getApiUrl();
  if (!url) return false;
  
  try {
    // ใช้ text/plain เพื่อเลี่ยงปัญหา CORS Preflight ใน GAS Web App
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // สำคัญ: ใช้ no-cors สำหรับการส่งข้อมูลไปยัง GAS ที่มักจะ Redirect
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, data }),
    });
    
    // ในโหมด no-cors เราจะไม่สามารถอ่าน response ได้ แต่ถ้าไม่มี error ขว้างออกมา
    // มักจะหมายความว่าข้อมูลถูกส่งออกไปถึง server แล้ว
    return true;
  } catch (error) {
    console.error(`Failed to execute ${action}`, error);
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
