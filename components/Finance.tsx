import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { Plus, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const Finance = () => {
  const { transactions, addTransaction } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'INCOME',
    paymentMethod: 'CASH',
    category: 'General'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.description && formData.amount) {
      addTransaction(formData as Omit<Transaction, 'id'>);
      setShowForm(false);
      setFormData({ 
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'INCOME',
        paymentMethod: 'CASH', 
        category: 'General',
        description: '',
        amount: 0
      });
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'ALL') return true;
    return t.type === activeTab;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ระบบบันทึกรายรับ-รายจ่าย</h2>
          <p className="text-slate-500">จัดการธุรกรรมทางการเงิน</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                <Download size={18} />
                <span className="hidden sm:inline">Export Report</span>
            </button>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
                <Plus size={18} />
                บันทึกรายการ
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-slate-800">บันทึกรายการใหม่</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
                <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border bg-white"
                >
                    <option value="INCOME">รายรับ</option>
                    <option value="EXPENSE">รายจ่าย</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน</label>
                <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                <input 
                    type="text" 
                    required
                    placeholder="เช่น ค่าซ่อมคอมพิวเตอร์"
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ช่องทางชำระ</label>
                <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border bg-white"
                >
                    <option value="CASH">เงินสด</option>
                    <option value="TRANSFER">เงินโอน</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                <input 
                    type="text"
                    list="categories" 
                    value={formData.category || ''}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none border"
                />
                <datalist id="categories">
                    <option value="Service" />
                    <option value="Product Sales" />
                    <option value="Utility" />
                    <option value="Salary" />
                    <option value="General" />
                </datalist>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">บันทึก</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
                {tab === 'ALL' ? 'ทั้งหมด' : tab === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
            </button>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                        <th className="p-4">วันที่</th>
                        <th className="p-4">รายละเอียด</th>
                        <th className="p-4">หมวดหมู่</th>
                        <th className="p-4">ช่องทาง</th>
                        <th className="p-4 text-right">จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-500 whitespace-nowrap">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                            <td className="p-4 font-medium text-slate-800">{t.description}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{t.category}</span>
                            </td>
                            <td className="p-4 text-slate-500">
                                {t.paymentMethod === 'CASH' ? 'เงินสด' : 'เงินโอน'}
                            </td>
                            <td className="p-4 text-right">
                                <span className={`flex items-center justify-end gap-1 font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {t.amount.toLocaleString()} ฿
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                ไม่พบรายการ
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;