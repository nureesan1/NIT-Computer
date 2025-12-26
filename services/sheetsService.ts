
import { Transaction, Product, Task, CompanyProfile } from "../types";

const STORAGE_KEY = 'nit_sheet_api_url';
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbz4qDcwNjTI549s645lW2PVwmPDgALww70yewsdkRJAEFmsBMJpxWEWEHw5HqaOiMlW2A/exec';

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

const sendRequest = async (action: string, data: any) => {
  const url = getApiUrl();
  if (!url) return;
  
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action, data }),
    });
  } catch (error) {
    console.error(`Failed to execute ${action}`, error);
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
