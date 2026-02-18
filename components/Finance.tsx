
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType, PaymentMethod, CustomerRecord } from '../types';
import { 
  Plus, Download, TrendingUp, TrendingDown, 
  Calendar, ChevronLeft, ChevronRight, PieChart, 
  ArrowUpRight, ArrowDownRight, Wallet, Filter, X, Edit2, Trash2, Save, User, UserPlus, CheckCircle2
} from 'lucide-react';
import { format, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { th } from 'date-fns/locale/th';

const Finance = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, customers, addCustomer } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Date Filtering State
  const [periodMode, setPeriodMode] = useState<'ALL' | 'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'INCOME',
    paymentMethod: 'TRANSFER',
    category: 'งานซ่อม',
    customerName: '',
    customerId: '',
    description: '',
    amount: 0
  });

  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.description && formData.amount) {
      if (editingId) {
        updateTransaction(editingId, formData);
      } else {
        addTransaction(formData as Omit<Transaction, 'id'>);
      }
      handleCloseForm();
    }
  };

  const handleEdit = (t: Transaction) => {
    setFormData({
      date: t.date,
      type: t.type,
      paymentMethod: t.paymentMethod,
      category: t.category,
      description: t.description,
      amount: t.amount,
      customerName: t.customerName,
      customerId: t.customerId
    });
    setEditingId(t.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      deleteTransaction(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ 
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'INCOME',
      paymentMethod: 'TRANSFER', 
      category: 'งานซ่อม',
      description: '',
      amount: 0,
      customerName: '',
      customerId: ''
    });
    setIsNewCustomer(false);
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const existingCustomer = customers.find(c => c.name === name);
    
    if (existingCustomer) {
      setFormData({ ...formData, customerName: name, customerId: existingCustomer.id });
      setIsNewCustomer(false);
    } else {
      setFormData({ ...formData, customerName: name, customerId: '' });
      setIsNewCustomer(name.length > 0);
    }
  };

  const handleQuickAddCustomer = () => {
    if (formData.customerName) {
      addCustomer({
        name: formData.customerName,
        phone: '-', // Placeholder
        notes: 'เพิ่มอัตโนมัติจากหน้าการเงิน'
      });
      setIsNewCustomer(false);
      alert(`บันทึกข้อมูลลูกค้า "${formData.customerName}" เรียบร้อยแล้ว`);
    }
  };

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      
      // Period Filter
      let matchesPeriod = true;
      if (periodMode === 'DAY') matchesPeriod = isSameDay(tDate, selectedDate);
      else if (periodMode === 'MONTH') matchesPeriod = isSameMonth(tDate, selectedDate);
      else if (periodMode === 'YEAR') matchesPeriod = isSameYear(tDate, selectedDate);

      // Type Filter (Income/Expense/All)
      const matchesType = activeTab === 'ALL' ? true : t.type === activeTab;

      return matchesPeriod && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeTab, periodMode, selectedDate]);

  // Summary Calculations for the current filtered view
  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const categories = ['ขายสินค้า/บริการ', 'งานซ่อม', 'งานติดตั้ง', 'งานระบบ', 'ค่าใช้จ่ายทั่วไป', 'ค่าไฟ', 'ค่าอินเตอร์เน็ต', 'ค่าน้ำ', 'ค่าเช่า', 'เงินเดือน/ค่าแรง', 'ซื้ออุปกรณ์/สต็อก'];

  const changePeriod = (delta: number) => {
    const newDate = new Date(selectedDate);
    if (periodMode === 'DAY') newDate.setDate(newDate.getDate() + delta);
    else if (periodMode === 'MONTH') newDate.setMonth(newDate.getMonth() + delta);
    else if (periodMode === 'YEAR') newDate.setFullYear(newDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  const getPeriodLabel = () => {
    if (periodMode === 'ALL') return 'ข้อมูลทั้งหมด';
    if (periodMode === 'DAY') return format(selectedDate, 'd MMMM yyyy', { locale: th });
    if (periodMode === 'MONTH') return format(selectedDate, 'MMMM yyyy', { locale: th });
    return format(selectedDate, 'yyyy', { locale: th });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ระบบบันทึกรายรับ-รายจ่าย</h2>
          <p className="text-slate-500">จัดการและสรุปธุรกรรมทางการเงิน</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-100 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition-all shadow-sm">
                <Download size={18} />
                <span className="hidden sm:inline text-xs uppercase tracking-widest">Export Report</span>
            </button>
            <button 
                onClick={() => showForm ? handleCloseForm() : setShowForm(true)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
            >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'ปิดหน้าต่าง' : 'บันทึกรายการ'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-8 rounded-[2rem] border-2 shadow-2xl animate-fade-in relative transition-all duration-300 ${editingId ? 'bg-amber-50 border-amber-200 shadow-amber-900/5' : 'bg-white border-blue-100 shadow-blue-900/5'}`}>
          <div className="absolute top-6 right-6">
             <button onClick={handleCloseForm} className="text-slate-300 hover:text-slate-500 transition-colors">
               <X size={24} />
             </button>
          </div>
          <h3 className="font-black text-xl mb-8 text-slate-800 flex items-center gap-3">
             <div className={`p-2 rounded-lg text-white shadow-lg ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`}>
                {editingId ? <Edit2 size={18}/> : <Plus size={18}/>}
             </div>
             {editingId ? 'แก้ไขข้อมูลธุรกรรม' : 'บันทึกธุรกรรมใหม่'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Row 1: Date, Type, Amount */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่รายการ *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                      type="date" required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทธุรกรรม</label>
                <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold bg-white cursor-pointer"
                >
                    <option value="INCOME">รายรับ (+)</option>
                    <option value="EXPENSE">รายจ่าย (-)</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนเงิน (บาท) *</label>
                <div className="relative">
                  <input 
                      type="number" required min="0" step="0.01" placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-black text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                </div>
            </div>

            {/* Row 2: Description (long) & Payment Method (short) */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รายละเอียดรายการ *</label>
                <input 
                    type="text" required placeholder="ระบุรายละเอียด เช่น ค่าแรงติดตั้งกล้อง, ซื้อสายไฟ..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ช่องทางชำระ</label>
                <select 
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold bg-white cursor-pointer"
                >
                    <option value="TRANSFER">เงินโอน</option>
                    <option value="CASH">เงินสด</option>
                </select>
            </div>

            {/* Row 3: Category (short) & Customer (long) */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หมวดหมู่</label>
                <select 
                    value={formData.category || 'งานซ่อม'}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold bg-white cursor-pointer"
                >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อลูกค้า (ถ้ามี)</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    list="customer-list"
                    placeholder="พิมพ์ชื่อลูกค้า..."
                    value={formData.customerName || ''}
                    onChange={handleCustomerNameChange}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                  <datalist id="customer-list">
                    {customers.map(c => (
                        <option key={c.id} value={c.name}>{c.company ? `(${c.company})` : ''}</option>
                    ))}
                  </datalist>
                  {isNewCustomer && (
                    <button 
                      type="button"
                      onClick={handleQuickAddCustomer}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="เพิ่มเป็นลูกค้าใหม่ทันที"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                </div>
                {isNewCustomer && (
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-tight mt-1 animate-pulse flex items-center gap-1">
                    <CheckCircle2 size={12} /> สามารถพิมพ์ชื่อ และจัดเก็บข้อมูลลูกค้าได้เลย
                  </p>
                )}
            </div>

            <div className="md:col-span-3 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={handleCloseForm} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-12 py-3.5 rounded-2xl text-white font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center gap-3 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
                   {editingId ? <Save size={20} /> : <Plus size={20} />}
                   {editingId ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Date Filter & Period Control */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm space-y-6">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
               {(['DAY', 'MONTH', 'YEAR', 'ALL'] as const).map(mode => (
                  <button
                     key={mode}
                     onClick={() => setPeriodMode(mode)}
                     className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        periodMode === mode 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                     }`}
                  >
                     {mode === 'DAY' ? 'รายวัน' : mode === 'MONTH' ? 'รายเดือน' : mode === 'YEAR' ? 'รายปี' : 'ทั้งหมด'}
                  </button>
               ))}
            </div>

            {periodMode !== 'ALL' && (
               <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                  <button 
                    onClick={() => changePeriod(-1)}
                    className="p-2 rounded-xl border-2 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3 text-slate-800 px-6">
                     <Calendar size={18} className="text-blue-600" />
                     <span className="font-black text-lg min-w-[140px] text-center">{getPeriodLabel()}</span>
                  </div>
                  <button 
                    onClick={() => changePeriod(1)}
                    className="p-2 rounded-xl border-2 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>
            )}
         </div>

         {/* Filter Tabs for Income/Expense */}
         <div className="flex gap-4 border-b border-slate-100 pb-1">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-black text-xs transition-all border-b-4 tracking-widest uppercase ${
                        activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
               >
                  {tab === 'ALL' ? 'ธุรกรรมทั้งหมด' : tab === 'INCOME' ? 'รายรับ (+)' : 'รายจ่าย (-)'}
               </button>
            ))}
         </div>
      </div>

      {/* Summary Cards for Period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-50 flex items-center gap-6 group hover:border-emerald-100 transition-all">
             <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl group-hover:scale-110 transition-transform">
                <ArrowUpRight size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รายรับรวม</p>
                <h4 className="text-2xl font-black text-emerald-600">+{summary.income.toLocaleString()} <span className="text-xs">฿</span></h4>
             </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-50 flex items-center gap-6 group hover:border-red-100 transition-all">
             <div className="p-4 bg-red-100 text-red-600 rounded-3xl group-hover:scale-110 transition-transform">
                <ArrowDownRight size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รายจ่ายรวม</p>
                <h4 className="text-2xl font-black text-red-600">-{summary.expense.toLocaleString()} <span className="text-xs">฿</span></h4>
             </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PieChart size={100} />
             </div>
             <div className={`p-4 rounded-3xl shadow-lg ${summary.net >= 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                <Wallet size={28} />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">กำไรสุทธิ</p>
                <h4 className={`text-2xl font-black ${summary.net >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                   {summary.net >= 0 ? '+' : ''}{summary.net.toLocaleString()} <span className="text-xs">฿</span>
                </h4>
             </div>
          </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                        <th className="p-6">วันที่</th>
                        <th className="p-6">รายละเอียด / ลูกค้า</th>
                        <th className="p-6">หมวดหมู่</th>
                        <th className="p-6">ช่องทาง</th>
                        <th className="p-6 text-right">จำนวนเงิน (THB)</th>
                        <th className="p-6 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-6">
                               <div className="flex flex-col">
                                  <span className="font-black text-slate-700">{format(new Date(t.date), 'dd/MM/yyyy')}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{format(new Date(t.date), 'EEEE', { locale: th })}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-base">{t.description}</span>
                                    {t.customerName && (
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                            <User size={10} /> {t.customerName}
                                        </span>
                                    )}
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">{t.category}</span>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                  {t.paymentMethod === 'CASH' ? '💰 เงินสด' : '🏦 เงินโอน'}
                               </div>
                            </td>
                            <td className="p-6 text-right">
                                <span className={`flex items-center justify-end gap-1.5 font-black text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {t.type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {t.amount.toLocaleString()}
                                    <span className="text-xs font-bold text-slate-400 ml-1">฿</span>
                                </span>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleEdit(t)}
                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="แก้ไข"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="ลบ"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                        </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-28 text-center bg-slate-50/20">
                                <div className="flex flex-col items-center gap-4 opacity-30">
                                  <Filter size={64} className="text-slate-300" />
                                  <p className="font-black text-slate-400 uppercase tracking-widest">ไม่พบรายการธุรกรรมในช่วงเวลานี้</p>
                                </div>
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
