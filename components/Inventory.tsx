import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Plus, Minus, Search, AlertTriangle, Calculator, X, Edit2, Trash2, Save } from 'lucide-react';

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5
  });

  // Calculator State
  const [calcCost, setCalcCost] = useState<number>(0);
  const profitMargin = 0.10; // 10%
  const vatRate = 0.07; // 7%

  const sellingPriceBeforeVat = calcCost * (1 + profitMargin);
  const vatAmount = sellingPriceBeforeVat * vatRate;
  const netSellingPrice = sellingPriceBeforeVat + vatAmount;

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
    setShowCalculator(false);
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
        <div className="flex gap-2">
            <button 
                onClick={() => { setShowCalculator(true); setShowForm(false); setEditingId(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
                <Calculator size={18} />
                <span className="hidden sm:inline">คำนวณราคาขาย</span>
            </button>
            <button 
                onClick={() => { 
                  if (showForm && !editingId) setShowForm(false);
                  else {
                    setEditingId(null);
                    setFormData({ code: '', name: '', cost: 0, quantity: 0, unit: 'ชิ้น', minStockThreshold: 5 });
                    setShowForm(true);
                  }
                  setShowCalculator(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
                <Plus size={18} />
                {showForm && !editingId ? 'ยกเลิก' : 'เพิ่มสินค้า'}
            </button>
        </div>
      </div>

      {/* Pricing Calculator Panel */}
      {showCalculator && (
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 animate-fade-in mb-6 relative">
            <button onClick={() => setShowCalculator(false)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
                <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4 text-indigo-900 flex items-center gap-2">
                <Calculator size={20} />
                ระบบคำนวณราคาขาย (Cost + 10% Profit + 7% VAT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                    <label className="block text-sm font-medium text-indigo-800 mb-1">ต้นทุนสินค้า (บาท)</label>
                    <input 
                        type="number" 
                        value={calcCost || ''} 
                        onChange={(e) => setCalcCost(parseFloat(e.target.value))}
                        className="w-full border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ระบุต้นทุน"
                    />
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="text-xs text-slate-500 block">ราคาก่อนภาษี (กำไร 10%)</span>
                    <span className="font-bold text-slate-800 text-lg">{sellingPriceBeforeVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <span className="text-xs text-slate-500 block">ภาษีมูลค่าเพิ่ม (7%)</span>
                    <span className="font-bold text-slate-800 text-lg">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-lg text-white shadow-md">
                    <span className="text-xs text-indigo-100 block">ราคาขายสุทธิ</span>
                    <span className="font-bold text-xl">{netSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                </div>
            </div>
        </div>
      )}

      {/* Product Form (Add/Edit) */}
      {showForm && (
        <div className={`bg-white p-6 rounded-xl border-2 ${editingId ? 'border-amber-200' : 'border-blue-200'} shadow-md animate-fade-in`}>
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
           </div>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">รหัสสินค้า</label>
               <input type="text" placeholder="SKU-001" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
             </div>
             <div className="space-y-1 md:col-span-2">
               <label className="text-xs font-semibold text-slate-500 uppercase">ชื่อสินค้า</label>
               <input type="text" placeholder="ระบุชื่อสินค้า..." className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">ต้นทุน</label>
               <input type="number" placeholder="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} required />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">จำนวนในสต็อก</label>
               <input type="number" placeholder="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})} required />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">หน่วยนับ</label>
               <input type="text" placeholder="เช่น ชิ้น, เมตร, กล่อง" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">จุดสั่งซื้อขั้นต่ำ</label>
               <input type="number" placeholder="5" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.minStockThreshold || ''} onChange={e => setFormData({...formData, minStockThreshold: parseFloat(e.target.value)})} />
             </div>
             <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                <button type="button" onClick={cancelEdit} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-6 py-2 rounded text-white shadow-sm flex items-center gap-2 transition-all ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                   {editingId ? <Save size={18} /> : <Plus size={18} />}
                   {editingId ? 'บันทึกการแก้ไข' : 'บันทึกสินค้าใหม่'}
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
            type="text" 
            placeholder="ค้นหาสินค้า (ชื่อ, รหัส)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                        <th className="p-4">รหัส</th>
                        <th className="p-4">ชื่อสินค้า</th>
                        <th className="p-4 text-right">ต้นทุน</th>
                        <th className="p-4 text-center">คงเหลือ (เพิ่ม/ลด)</th>
                        <th className="p-4 text-center">สถานะ</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map(p => (
                        <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${editingId === p.id ? 'bg-amber-50' : ''}`}>
                            <td className="p-4 text-slate-500 font-mono text-xs">{p.code}</td>
                            <td className="p-4 font-medium text-slate-800">{p.name}</td>
                            <td className="p-4 text-right">{p.cost.toLocaleString()} ฿</td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleQuickAdjust(p.id, p.quantity, -1)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                                        title="ลดจำนวน"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <div className="flex flex-col items-center min-w-[60px]">
                                        <span className="font-bold text-lg text-slate-800 leading-none">{p.quantity}</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">{p.unit}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleQuickAdjust(p.id, p.quantity, 1)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-green-100 text-slate-400 hover:text-green-600 flex items-center justify-center transition-colors"
                                        title="เพิ่มจำนวน"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex justify-center">
                                    {p.quantity <= p.minStockThreshold ? (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-1 bg-red-100 text-red-600 rounded-full font-bold uppercase">
                                            <AlertTriangle size={12} /> ต่ำกว่าเกณฑ์
                                        </span>
                                    ) : (
                                        <span className="text-[10px] px-2 py-1 bg-green-100 text-green-600 rounded-full font-bold uppercase">ปกติ</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center justify-center gap-4">
                                    <button 
                                        onClick={() => startEdit(p)}
                                        className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                        title="แก้ไขข้อมูล"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('ยืนยันการลบสินค้าชิ้นนี้?')) {
                                                deleteProduct(p.id);
                                            }
                                        }}
                                        className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        title="ลบสินค้า"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic">ไม่พบข้อมูลสินค้าที่ค้นหา</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;