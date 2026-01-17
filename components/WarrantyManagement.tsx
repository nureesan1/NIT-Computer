
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Warranty } from '../types';
import { 
  ShieldCheck, Plus, Search, Filter, Calendar, 
  Trash2, Edit2, FileText, CheckCircle, AlertTriangle, 
  Clock, Store, Package, Tag, Save, X, Info
} from 'lucide-react';
import { format, addMonths, addYears, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale/th';

const WarrantyManagement = () => {
  const { warranties, addWarranty, updateWarranty, deleteWarranty } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Warranty>>({
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    productName: '',
    modelCode: '',
    serialNumber: '',
    quantity: 1,
    vendor: '',
    price: 0,
    duration: '1 ปี',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    conditions: '',
    hasDocuments: true
  });

  // Calculate Expiry Date automatically whenever startDate or duration changes
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const start = new Date(formData.startDate);
      let expiry = new Date(start);
      
      const durationStr = formData.duration.toLowerCase();
      if (durationStr.includes('ปี')) {
        const years = parseInt(durationStr) || 0;
        expiry = addYears(start, years);
      } else if (durationStr.includes('เดือน')) {
        const months = parseInt(durationStr) || 0;
        expiry = addMonths(start, months);
      }
      
      // Usually warranty ends 1 day before the anniversary
      expiry = addDays(expiry, -1);
      
      const expiryStr = format(expiry, 'yyyy-MM-dd');
      if (formData.expiryDate !== expiryStr) {
        setFormData(prev => ({ ...prev, expiryDate: expiryStr }));
      }
    }
  }, [formData.startDate, formData.duration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.startDate && formData.expiryDate) {
      if (editingId) {
        updateWarranty(editingId, formData);
      } else {
        addWarranty(formData as Omit<Warranty, 'id'>);
      }
      handleCloseForm();
    }
  };

  const handleEdit = (w: Warranty) => {
    setFormData({ ...w });
    setEditingId(w.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการรับประกันนี้?')) {
      deleteWarranty(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      productName: '',
      modelCode: '',
      serialNumber: '',
      quantity: 1,
      vendor: '',
      price: 0,
      duration: '1 ปี',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      conditions: '',
      hasDocuments: true
    });
  };

  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => 
      w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [warranties, searchQuery]);

  const getWarrantyStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = differenceInDays(expiry, today);

    if (isBefore(expiry, today)) {
      return { label: 'หมดประกัน', color: 'text-red-600 bg-red-50 border-red-100', icon: <X size={14} /> };
    } else if (diffDays <= 30) {
      return { label: 'ใกล้หมดประกัน', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: <Clock size={14} /> };
    } else {
      return { label: 'อยู่ในประกัน', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle size={14} /> };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">บันทึกประกันสินค้า</h2>
          <p className="text-slate-500 font-medium">จัดการและติดตามสถานะการรับประกันของสินค้า</p>
        </div>
        <button 
          onClick={() => showForm ? handleCloseForm() : setShowForm(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'ปิดหน้าต่าง' : 'บันทึกประกันใหม่'}
        </button>
      </div>

      {showForm && (
        <div className={`p-8 rounded-[2rem] border-2 shadow-2xl animate-fade-in relative ${editingId ? 'bg-amber-50 border-amber-100 shadow-amber-900/5' : 'bg-white border-blue-50 shadow-blue-900/5'}`}>
          <div className="absolute top-6 right-6">
             <button onClick={handleCloseForm} className="text-slate-300 hover:text-slate-500 transition-colors">
               <X size={24} />
             </button>
          </div>
          <h3 className="font-black text-xl mb-8 text-slate-800 flex items-center gap-3">
             <div className={`p-2 rounded-lg text-white shadow-lg ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`}>
                <ShieldCheck size={18}/>
             </div>
             {editingId ? 'แก้ไขข้อมูลประกันสินค้า' : 'เพิ่มข้อมูลประกันสินค้าใหม่'}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ซื้อสินค้า *</label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" required
                    value={formData.purchaseDate}
                    onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อสินค้า *</label>
                <div className="relative group">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required placeholder="เช่น Monitor Dell 24 นิ้ว"
                    value={formData.productName}
                    onChange={e => setFormData({...formData, productName: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รุ่น / รหัสสินค้า</label>
                <div className="relative group">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="เช่น U2419H"
                    value={formData.modelCode}
                    onChange={e => setFormData({...formData, modelCode: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">S/N (Serial Number) *</label>
                <div className="relative group">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required placeholder="ระบุหมายเลขเครื่อง"
                    value={formData.serialNumber}
                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนที่ซื้อ</label>
                <input 
                  type="number" min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:border-blue-500 outline-none transition-all font-bold"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อร้านค้า / ผู้ขาย *</label>
                <div className="relative group">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" required placeholder="ระบุชื่อร้านค้า"
                    value={formData.vendor}
                    onChange={e => setFormData({...formData, vendor: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 pl-12 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ราคาซื้อ (บาท)</label>
                <input 
                  type="number" step="0.01"
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:border-blue-500 outline-none transition-all font-bold"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ระยะเวลาประกัน *</label>
                <select 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:border-blue-500 outline-none transition-all font-bold bg-white cursor-pointer"
                >
                    <option value="6 เดือน">6 เดือน</option>
                    <option value="1 ปี">1 ปี</option>
                    <option value="2 ปี">2 ปี</option>
                    <option value="3 ปี">3 ปี</option>
                    <option value="5 ปี">5 ปี</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่เริ่มประกัน *</label>
                <input 
                  type="date" required
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:border-blue-500 outline-none transition-all font-bold"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่หมดประกัน (คำนวณอัตโนมัติ)</label>
                <input 
                  type="date" readOnly
                  value={formData.expiryDate}
                  className="w-full border-slate-100 border-2 rounded-2xl p-3.5 focus:outline-none transition-all font-bold bg-slate-50 text-blue-600"
                />
            </div>
            <div className="flex items-center space-x-3 pt-6">
                <input 
                  type="checkbox" id="hasDocs"
                  checked={formData.hasDocuments}
                  onChange={e => setFormData({...formData, hasDocuments: e.target.checked})}
                  className="w-6 h-6 rounded-lg text-blue-600 border-2 border-slate-200 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="hasDocs" className="font-bold text-slate-700 cursor-pointer">มีเอกสารประกัน / ใบเสร็จ</label>
            </div>
            <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เงื่อนไขประกันโดยย่อ</label>
                <textarea 
                  rows={2}
                  placeholder="ระบุเงื่อนไข เช่น เคลมที่ศูนย์, On-site service..."
                  value={formData.conditions}
                  onChange={e => setFormData({...formData, conditions: e.target.value})}
                  className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all font-medium resize-none shadow-sm"
                />
            </div>
            <div className="md:col-span-3 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={handleCloseForm} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-12 py-3.5 rounded-2xl text-white font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
                   <Save size={20} />
                   {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลประกัน'}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                  type="text" 
                  placeholder="ค้นหาชื่อสินค้า, S/N, หรือร้านค้า..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl p-4 pl-12 outline-none transition-all font-bold"
               />
            </div>
            <button className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-100 hover:text-blue-600 transition-all border border-slate-200">
               <Filter size={20} />
            </button>
         </div>
         
         <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-6 group">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ทั้งหมด</p>
               <h4 className="text-2xl font-black text-white">{warranties.length} <span className="text-xs opacity-60">รายการ</span></h4>
            </div>
         </div>
      </div>

      {/* Warranty Records Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                        <th className="p-6">ข้อมูลสินค้า</th>
                        <th className="p-6">S/N / รุ่น</th>
                        <th className="p-6">ร้านค้า / ราคา</th>
                        <th className="p-6">ระยะเวลาประกัน</th>
                        <th className="p-6">สถานะ</th>
                        <th className="p-6 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredWarranties.map(w => {
                        const status = getWarrantyStatus(w.expiryDate);
                        return (
                            <tr key={w.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-6">
                                   <div className="flex flex-col">
                                      <span className="font-black text-slate-800 text-base">{w.productName}</span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                         ซื้อเมื่อ: {format(new Date(w.purchaseDate), 'dd/MM/yyyy')}
                                      </span>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <div className="flex flex-col">
                                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs w-fit">{w.serialNumber}</span>
                                      <span className="text-xs text-slate-500 font-medium mt-1">{w.modelCode || '-'}</span>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <div className="flex flex-col">
                                      <span className="font-bold text-slate-700">{w.vendor}</span>
                                      <span className="text-xs text-slate-400 font-black">{w.price?.toLocaleString()} ฿</span>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <div className="flex flex-col">
                                      <span className="font-black text-slate-800">{w.duration}</span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                         หมดอายุ: {format(new Date(w.expiryDate), 'dd/MM/yyyy')}
                                      </span>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                                      {status.icon}
                                      {status.label}
                                   </span>
                                </td>
                                <td className="p-6">
                                   <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleEdit(w)}
                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="แก้ไข"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(w.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="ลบ"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                   </div>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredWarranties.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-28 text-center bg-slate-50/20">
                                <div className="flex flex-col items-center gap-4 opacity-30">
                                  <ShieldCheck size={64} className="text-slate-300" />
                                  <p className="font-black text-slate-400 uppercase tracking-widest">ไม่พบข้อมูลการรับประกันสินค้า</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
      {/* Informative Footer */}
      <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-[2rem] flex items-start gap-6">
         <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg">
            <Info size={28} />
         </div>
         <div className="space-y-2">
            <h5 className="font-black text-slate-800 text-lg uppercase tracking-tight">เกี่ยวกับระบบบันทึกประกัน</h5>
            <p className="text-blue-800 text-sm font-medium leading-relaxed">
               ระบบจะช่วยคำนวณวันหมดประกันอัตโนมัติจากวันที่เริ่มประกันและระยะเวลาที่คุณระบุ 
               สถานะ <span className="text-orange-600 font-bold">ใกล้หมดประกัน</span> จะแสดงขึ้นเมื่อเหลือเวลาอีกไม่เกิน 30 วัน 
               แนะนำให้ตรวจสอบเอกสารประกัน (ใบเสร็จ/ใบกำกับ) ให้พร้อมสำหรับการเคลม
            </p>
         </div>
      </div>
    </div>
  );
};

export default WarrantyManagement;
