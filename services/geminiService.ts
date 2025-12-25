import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, Task } from "../types";

export const generateBusinessInsight = async (
  transactions: Transaction[],
  products: Product[],
  tasks: Task[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "กรุณาตั้งค่า API_KEY ในระบบเพื่อใช้งาน AI Insight";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a summary of data to send to the model
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minStockThreshold).map(p => p.name).join(", ");
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;

  const prompt = `
    Analyze the following business data for "NIT Computer Solution LTD." and provide a short executive summary in Thai language (max 100 words).
    Focus on financial health, inventory warnings, and operational workload.

    Data:
    - Total Income: ${totalIncome.toLocaleString()} THB
    - Total Expense: ${totalExpense.toLocaleString()} THB
    - Net Profit: ${(totalIncome - totalExpense).toLocaleString()} THB
    - Low Stock Items: ${lowStockItems || "None"}
    - Pending Tasks: ${pendingTasks}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
  }
};