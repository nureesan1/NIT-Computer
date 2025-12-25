
import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Receipt, TrendingUp, Info } from 'lucide-react';

const PricingCalculator = () => {
  const [calcCost, setCalcCost] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(10); // Default 10%
  const [vatRate, setVatRate] = useState<number>(7); // Default 7%

  const profitAmount = calcCost * (profitMargin / 100);
  const sellingPriceBeforeVat = calcCost + profitAmount;
  const vatAmount = sellingPriceBeforeVat * (vatRate / 100);
  const netSellingPrice = sellingPriceBeforeVat + vatAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ระบบคำนวณราคาขาย</h2>
          <p className="text-slate-500">คำนวณราคาขายตามต้นทุน กำไร และภาษีมูลค่าเพิ่ม</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
               <DollarSign size={18} className="text-indigo-600" /> ตั้งค่าพื้นฐาน
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ต้นทุนสินค้า (Cost)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={calcCost || ''} 
                  onChange={(e) => setCalcCost(parseFloat(e.target.value) || 0)}
                  className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">อัตรากำไร (Profit %)</label>
              <div className="relative group">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  value={profitMargin} 
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-full border-slate-200 border-2 p-3.5 pl-12 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ภาษีมูลค่าเพิ่ม (VAT %)</label>
              <div className="relative group">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  value={vatRate} 
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="w-full border-slate-200 border-2 p-3.5 pl-12 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3">
             <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
             <p className="text-xs text-blue-800 leading-relaxed font-medium">
               ระบบคำนวณแบบมาตรฐาน (Cost Plus): ราคาขายจะคำนวณจากต้นทุน บวกด้วยเปอร์เซ็นต์กำไรที่ตั้งไว้ และบวกภาษีมูลค่าเพิ่มในขั้นตอนสุดท้าย
             </p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col h-full">
             <h3 className="font-bold text-slate-800 mb-8 border-b pb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" /> ผลการวิเคราะห์ราคา
             </h3>

             <div className="flex-1 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">ต้นทุนสินค้า</span>
                      <span className="text-2xl font-bold text-slate-700">{calcCost.toLocaleString()} ฿</span>
                   </div>
                   <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 block">กำไร ({profitMargin}%)</span>
                      <span className="text-2xl font-bold text-green-700">+{profitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                   </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Calculator size={120} />
                   </div>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                         <span className="text-sm font-bold text-slate-400">ราคาก่อนรวมภาษี (Subtotal)</span>
                         <span className="text-xl font-bold">{sellingPriceBeforeVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                         <span className="text-sm font-bold text-slate-400">ภาษีมูลค่าเพิ่ม (VAT {vatRate}%)</span>
                         <span className="text-xl font-bold">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Total Selling Price</span>
                            <span className="text-sm font-bold text-slate-300">ราคาขายสุทธิ</span>
                         </div>
                         <div className="text-right">
                            <span className="text-5xl font-black text-indigo-400 block tracking-tight">
                               {netSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-lg font-bold text-slate-400">THB</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-8 flex gap-4">
                <button className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]">
                   คัดลอกราคา
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                   พิมพ์รายงานสรุป
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
