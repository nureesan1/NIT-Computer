
import { Transaction, Product, Task, CompanyProfile } from "../types";

const STORAGE_KEY = 'nit_sheet_api_url';
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxhmRRmS6EpW501tODiH0jSvf5Ebmaztj0aouVzxeTS4u20CmHXtasSHs7b_kusP-SnYg/exec';

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
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const json = await response.json();
    if (json.status === 'success') return json.data;
    return null;
  } catch (error) {
    console.error("Failed to fetch initial data", error);
    return null;
  }
};

const sendRequest = async (action: string, data: any): Promise<boolean> => {
  const url = getApiUrl();
  if (!url) return false;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // เปลี่ยนกลับเป็น cors เพื่อให้ได้รับ Response
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // ใช้ text/plain เพื่อเลี่ยง Preflight OPTIONS
      },
      body: JSON.stringify({ action, data }),
    });

    // เนื่องจาก GAS จะทำการ Redirect (302) ซึ่งเบราว์เซอร์จะติดตามให้โดยอัตโนมัติ
    // ถ้า fetch ไม่ throw error และได้ status 200 (หลังติดตาม redirect) แสดงว่าสำเร็จ
    if (response.ok) {
      const result = await response.json();
      return result.status === 'success';
    }
    return false;
  } catch (error) {
    // ในบางกรณี CORS อาจจะฟ้อง Error ทั้งที่ข้อมูลเข้าแล้ว 
    // แต่สำหรับการบันทึก Profile เราต้องการความมั่นใจ
    console.error(`Request failed: ${action}`, error);
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
