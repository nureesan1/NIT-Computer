import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateBusinessInsight } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { transactions, products, tasks } = useApp();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Calcs
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const lowStockCount = products.filter(p => p.quantity <= p.minStockThreshold).length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const result = await generateBusinessInsight(transactions, products, tasks);
    setAiInsight(result);
    setIsLoadingAi(false);
  };

  // Chart Data Preparation
  const dataByType = [
    { name: 'รายรับ', value: totalIncome },
    { name: 'รายจ่าย', value: totalExpense },
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ (Dashboard)</h2>
          <p className="text-slate-500">สรุปข้อมูลสำคัญของ NIT Computer Solution</p>
        </div>
        <button 
          onClick={handleGenerateInsight}
          disabled={isLoadingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Sparkles size={18} />
          {isLoadingAi ? 'กำลังวิเคราะห์...' : 'ขอคำแนะนำจาก AI'}
        </button>
      </div>

      {/* AI Insight Box */}
      {aiInsight && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl animate-fade-in relative">
            <div className="absolute -top-3 -left-3 bg-white p-2 rounded-full shadow-sm border border-indigo-100">
                <Sparkles size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-indigo-900 mb-2 ml-4">AI Business Insight</h3>
            <p className="text-indigo-800 leading-relaxed whitespace-pre-line">{aiInsight}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">กำไรสุทธิ</p>
              <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit.toLocaleString()} ฿
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">งานที่ค้างอยู่</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800">{pendingTasks}</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">สินค้าใกล้หมด</p>
              <h3 className="text-2xl font-bold mt-1 text-orange-600">{lowStockCount}</h3>
            </div>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500">ยอดขายรวม</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-800">{totalIncome.toLocaleString()} ฿</h3>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <TrendingUp size={24} />
                </div>
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">สัดส่วนรายรับ / รายจ่าย</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ฿`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-6">ประสิทธิภาพทางการเงิน</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataByType}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={60} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} ฿`} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={40}>
                            {dataByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;