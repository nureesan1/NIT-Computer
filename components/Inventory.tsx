
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Plus, Minus, Search, AlertTriangle, X, Edit2, Trash2, Save, Package, FileText } from 'lucide-react';

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.cost !== undefined) {
      if (editingId) {
        updateProduct(editingId, formData);
        setEditingId(null);
      } else {
        addProduct(formData as Omit<Product, 'id'>);
      }
      setShowForm(false);
      setFormData({ code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5 });
    }
  };

  const startEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5 });
  };

  const handleQuickAdjust = (id: string, currentQty: number, delta: number) => {
    updateProduct(id, { quantity: Math.max(0, currentQty + delta) });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ระบบสต๊อกสินค้า</h2>
          <p className="text-slate-500">จัดการสินค้าและคำนวณราคา</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => { 
                  if (showForm && !editingId) setShowForm(false);
                  else {
                    setEditingId(null);
                    setFormData({ code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5 });
                    setShowForm(true);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${showForm && !editingId ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
            >
                {showForm && !editingId ? <X size={20} /> : <Plus size={20} />}
                {showForm && !editingId ? 'ยกเลิก' : 'เพิ่มสินค้า'}
            </button>
        </div>
      </div>

      {/* Product Form (Add/Edit) */}
      {showForm && (
        <div className={`p-8 rounded-2xl border-2 shadow-2xl animate-fade-in relative transition-all duration-300 ${editingId ? 'bg-amber-50/50 border-amber-200 shadow-amber-900/10' : 'bg-white border-blue-100 shadow-slate-900/5'}`}>
           <div className="flex justify-between items-center mb-8">
              <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-3 ${editingId ? 'bg-white border-amber-400 text-slate-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                {editingId ? <Edit2 className="text-amber-600" size={20} /> : <Package className="text-blue-600" size={20} />}
                <h3 className="font-bold text-lg">
                  {editingId ? `แก้ไขข้อมูลสินค้า: ${formData.code}` : 'เพิ่มสินค้าใหม่ลงในสต๊อก'}
                </h3>
              </div>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-colors">
                <X size={28} />
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">รหัสสินค้า (SKU)</label>
               <input type="text" placeholder="SKU-001" className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ชื่อสินค้า *</label>
               <div className="relative group">
                 <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={20} />
                 <input type="text" placeholder="ระบุชื่อสินค้า..." className="w-full border-slate-200 border-2 p-3.5 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ต้นทุน (บาท)</label>
               <input type="number" placeholder="0" className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} required />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">จำนวนตั้งต้น</label>
               <input type="number" placeholder="0" className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})} required />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">หน่วยนับ</label>
               <input type="text" placeholder="ชิ้น, เมตร..." className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">จุดสั่งซื้อขั้นต่ำ</label>
               <input type="number" placeholder="5" className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.minStockThreshold || ''} onChange={e => setFormData({...formData, minStockThreshold: parseFloat(e.target.value)})} />
             </div>
             <div className="md:col-span-3 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={cancelEdit} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-10 py-3 rounded-2xl text-white shadow-xl transition-all active:scale-95 font-black flex items-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
                   {editingId ? <Save size={18} /> : <Plus size={18} />}
                   {editingId ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสินค้า'}
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
        <input 
            type="text" 
            placeholder="ค้นหาสินค้า (ชื่อ, รหัส)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all font-medium"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                        <th className="p-6">รหัส</th>
                        <th className="p-6">ชื่อสินค้า</th>
                        <th className="p-6">ต้นทุน</th>
                        <th className="p-6 text-center">คงเหลือ (เพิ่ม/ลด)</th>
                        <th className="p-6 text-center">สถานะ</th>
                        <th className="p-6 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p, idx) => (
                        <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${editingId === p.id ? 'bg-amber-50/50' : ''}`}>
                            <td className="p-6 text-slate-400 font-black text-xs">
                              {p.code || idx + 1}
                            </td>
                            <td className="p-6 font-bold text-slate-800 text-lg">{p.name}</td>
                            <td className="p-6 font-black text-slate-700">{p.cost.toLocaleString()} ฿</td>
                            <td className="p-6">
                                <div className="flex items-center justify-center gap-4">
                                    <button 
                                        onClick={() => handleQuickAdjust(p.id, p.quantity, -1)}
                                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-red-200 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all active:scale-90"
                                        title="ลดจำนวน"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="font-black text-2xl text-slate-800 leading-none">{p.quantity}</span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{p.unit}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleQuickAdjust(p.id, p.quantity, 1)}
                                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-green-200 text-slate-400 hover:text-green-600 flex items-center justify-center transition-all active:scale-90"
                                        title="เพิ่มจำนวน"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex justify-center">
                                    {p.quantity <= p.minStockThreshold ? (
                                        <span className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 bg-red-100 text-red-600 rounded-xl font-black uppercase tracking-widest animate-pulse border border-red-200">
                                            <AlertTriangle size={14} /> ต่ำกว่าเกณฑ์
                                        </span>
                                    ) : (
                                        <span className="text-[10px] px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase tracking-widest border border-emerald-100">ปกติ</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => startEdit(p)}
                                        className="p-3 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all active:scale-90 shadow-sm"
                                        title="แก้ไขข้อมูล"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('ยืนยันการลบสินค้าชิ้นนี้ออกจากระบบถาวร?')) {
                                                deleteProduct(p.id);
                                            }
                                        }}
                                        className="p-3 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-100 rounded-2xl transition-all active:scale-90 shadow-sm"
                                        title="ลบสินค้า"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr><td colSpan={6} className="p-20 text-center">
                            <Package size={64} className="mx-auto text-slate-100 mb-6" />
                            <p className="text-slate-400 font-bold text-xl italic uppercase tracking-widest">ไม่พบสินค้าในสต็อก</p>
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
      {/* Stock Summary Info Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl">
                  <Package size={24} />
              </div>
              <div>
                  <h5 className="font-black text-sm uppercase tracking-widest">สรุปสต๊อกทั้งหมด</h5>
                  <p className="text-slate-400 text-xs mt-0.5">รวมสินค้า {products.length} รายการ | สินค้าใกล้หมด {products.filter(p => p.quantity <= p.minStockThreshold).length} รายการ</p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">มูลค่าสต๊อกรวม (ต้นทุน)</p>
                  <p className="text-blue-400 font-black text-xl leading-none mt-1">
                    {products.reduce((acc, p) => acc + (p.cost * p.quantity), 0).toLocaleString()} ฿
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Inventory;
