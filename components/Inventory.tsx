
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/sheetsService';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  User, 
  Calendar, 
  FileText, 
  Banknote, 
  ArrowLeft,
  PlusCircle,
  FileSpreadsheet,
  Info,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptLineItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

const Inventory = () => {
  const { companyProfile, addTransaction } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [payerName, setPayerName] = useState('');
  const [receiptDate, setReceiptDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    { id: '1', name: '', quantity: 1, pricePerUnit: 0 }
  ]);
  
  const [issuedReceipt, setIssuedReceipt] = useState<{
    id: string;
    payerName: string;
    date: string;
    items: ReceiptLineItem[];
    total: number;
    notes: string;
  } | null>(null);

  // Helper: Convert Number to Thai Baht Text
  const toThaiBaht = (amount: number): string => {
    const numberText = [ "ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า" ];
    const positionText = [ "", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน" ];
    
    const amountStr = amount.toFixed(2).split(".");
    const integerPart = amountStr[0];
    const decimalPart = amountStr[1];
    
    if (amount === 0) return "ศูนย์บาทถ้วน";
    
    let bahtStr = "";
    for (let i = 0; i < integerPart.length; i++) {
      const n = parseInt(integerPart[i]);
      if (n !== 0) {
        if (i === integerPart.length - 1 && n === 1 && integerPart.length > 1) {
          bahtStr += "เอ็ด";
        } else if (i === integerPart.length - 2 && n === 2) {
          bahtStr += "ยี่";
        } else if (i === integerPart.length - 2 && n === 1) {
          bahtStr += "";
        } else {
          bahtStr += numberText[n];
        }
        bahtStr += positionText[integerPart.length - i - 1];
      }
    }
    bahtStr += "บาท";
    
    if (parseInt(decimalPart) === 0) {
      bahtStr += "ถ้วน";
    } else {
      if (parseInt(decimalPart[0]) !== 0) {
        bahtStr += numberText[parseInt(decimalPart[0])] + (decimalPart[0] === '1' ? "" : "สิบ");
      }
      if (parseInt(decimalPart[1]) !== 0) {
        bahtStr += numberText[parseInt(decimalPart[1])];
      }
      bahtStr += "สตางค์";
    }
    return bahtStr;
  };

  const handleAddItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), name: '', quantity: 1, pricePerUnit: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ReceiptLineItem, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  }, [lineItems]);

  const handleProcessReceipt = async () => {
    if (!payerName || lineItems.some(i => !i.name || i.pricePerUnit <= 0)) {
      alert('กรุณากรอกชื่อผู้ชำระและรายการสินค้าให้ครบถ้วน');
      return;
    }

    setIsProcessing(true);
    const receiptId = `CSH-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      /**
       * 1. บันทึกลงชีต Receipts (ตารางประวัติใบเสร็จ)
       * ลำดับตามชีต: วันที่ | เลขที่ใบเสร็จ | ชื่อผู้ชำระ | ยอดเงิน | วิธีชำระ
       */
      const receiptData = {
        date: receiptDate,
        receiptId: receiptId,
        payerName: payerName,
        amount: totalAmount,
        paymentMethod: 'CASH',
        notes: notes
      };
      await api.addReceipt(receiptData);

      /**
       * 2. บันทึกลงชีต Transactions (ตารางรายรับ-จ่ายหลัก)
       * เพื่อให้ยอดเงินไปปรากฏใน Dashboard และรายงานการเงิน
       */
      addTransaction({
        date: receiptDate,
        description: `ใบเสร็จเลขที่ ${receiptId} - ${payerName}`,
        category: 'ขายสินค้า/บริการ',
        amount: totalAmount,
        type: 'INCOME',
        paymentMethod: 'CASH'
      });

      setIssuedReceipt({
        id: receiptId,
        payerName,
        date: receiptDate,
        items: [...lineItems],
        total: totalAmount,
        notes
      });
    } catch (error) {
      console.error("Save Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPayerName('');
    setReceiptDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setLineItems([{ id: '1', name: '', quantity: 1, pricePerUnit: 0 }]);
    setIssuedReceipt(null);
  };

  if (issuedReceipt) {
    return (
      <div className="bg-slate-50 min-h-screen animate-fade-in p-4 lg:p-10">
        <div className="print:hidden max-w-3xl mx-auto mb-8 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                 <h2 className="font-black text-slate-800">ออกใบเสร็จสำเร็จ</h2>
                 <p className="text-slate-500 text-sm font-bold">บันทึกลงชีต 'Receipts' และ 'รายรับ' เรียบร้อยแล้ว</p>
              </div>
           </div>
           <div className="flex gap-3">
              <button onClick={resetForm} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2">
                <ArrowLeft size={18} /> เขียนใบใหม่
              </button>
              <button onClick={() => window.print()} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                 <Printer size={18} /> พิมพ์ใบเสร็จ
              </button>
           </div>
        </div>

        {/* Professional Document Layout */}
        <div className="max-w-3xl mx-auto bg-white p-12 border-2 border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden" id="receipt-print">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
          
          <div className="flex justify-between items-start mb-10">
             <div className="flex gap-5">
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                   <Receipt size={40} />
                </div>
                <div>
                   <h1 className="text-2xl font-black text-slate-900 leading-tight">{companyProfile.name}</h1>
                   <p className="text-xs text-slate-500 mt-2 max-w-[300px] leading-relaxed font-semibold">{companyProfile.address}</p>
                   <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">โทร: {companyProfile.phone}</p>
                </div>
             </div>
             <div className="text-right">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">ใบเสร็จรับเงิน</h2>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mb-4">Cash Receipt</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase">เลขที่ใบเสร็จ / No.</p>
                   <p className="font-mono font-black text-blue-600 text-lg">{issuedReceipt.id}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 border-t border-b border-slate-100 py-8">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ได้รับเงินจาก / Payer Name</p>
                <p className="font-black text-slate-800 text-xl border-b-2 border-slate-50 pb-1">{issuedReceipt.payerName}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">วันที่ออกใบเสร็จ / Date</p>
                <p className="font-black text-slate-800 text-xl border-b-2 border-slate-50 pb-1">{format(new Date(issuedReceipt.date), 'dd/MM/yyyy')}</p>
             </div>
          </div>

          <table className="w-full mb-10">
             <thead className="bg-slate-900 text-white">
                <tr className="text-[10px] uppercase font-black tracking-widest">
                   <th className="py-4 px-6 text-left rounded-l-2xl">ลำดับ / รายการสินค้า / บริการ</th>
                   <th className="py-4 px-6 text-center">จำนวน / Qty</th>
                   <th className="py-4 px-6 text-right">หน่วยละ</th>
                   <th className="py-4 px-6 text-right rounded-r-2xl">รวมเงิน / Total</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {issuedReceipt.items.map((item, idx) => (
                   <tr key={idx} className="text-sm">
                      <td className="py-5 px-6 font-bold text-slate-700">
                        <span className="text-slate-300 mr-4 font-black">{idx + 1}</span>
                        {item.name}
                      </td>
                      <td className="py-5 px-6 text-center font-black text-slate-500">{item.quantity}</td>
                      <td className="py-5 px-6 text-right font-bold text-slate-600">{item.pricePerUnit.toLocaleString()}</td>
                      <td className="py-5 px-6 text-right font-black text-slate-900">{(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                   </tr>
                ))}
             </tbody>
          </table>

          <div className="flex justify-between items-start gap-10">
             <div className="flex-1 space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">จำนวนเงิน (ตัวอักษร) / Total in Words</p>
                   <p className="font-black text-slate-800 text-lg">({toThaiBaht(issuedReceipt.total)})</p>
                </div>
                <div className="px-6 flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                      <Banknote size={20} />
                   </div>
                   <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">ชำระด้วยเงินสด (Paid by Cash)</p>
                </div>
                {issuedReceipt.notes && (
                   <div className="px-6 mt-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">หมายเหตุ / Notes</p>
                      <p className="text-sm text-slate-500 italic font-medium">{issuedReceipt.notes}</p>
                   </div>
                )}
             </div>

             <div className="w-64 space-y-3">
                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10">
                   <span className="font-black text-xs uppercase tracking-widest opacity-60">ยอดรวมสุทธิ</span>
                   <span className="text-3xl font-black">{issuedReceipt.total.toLocaleString()} <span className="text-sm">฿</span></span>
                </div>
                <div className="pt-20 text-center space-y-4">
                   <div className="border-b-2 border-slate-200 w-full pb-2"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ผู้รับเงิน / Authorized Signature</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ระบบออกใบเสร็จรับเงินสด</h2>
          <p className="text-slate-500 font-medium">จัดการเอกสารใบเสร็จและบันทึกรายรับลงระบบบัญชีอัตโนมัติ</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
           <Banknote size={16} /> บันทึก 2 ต่อ (ใบเสร็จ + รายรับ)
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 lg:p-10 space-y-10">
          
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900 font-medium">
               เมื่อกดปุ่มบันทึก ระบบจะส่งข้อมูลไปที่ชีต <strong>Receipts</strong> (สำหรับดูประวัติใบเสร็จ) และชีต <strong>Transactions</strong> (สำหรับสรุปรายรับร้าน) โดยอัตโนมัติ
            </div>
          </div>

          {/* Section 1: Customer Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                   <User size={14} className="text-blue-500" /> ชื่อผู้ชำระเงิน *
                </label>
                <input 
                  type="text" 
                  placeholder="ระบุชื่อลูกค้า หรือ ชื่อบริษัท..."
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                  disabled={isProcessing}
                />
             </div>
             <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                   <Calendar size={14} className="text-blue-500" /> วันที่ออกใบเสร็จ *
                </label>
                <input 
                  type="date" 
                  value={receiptDate}
                  onChange={e => setReceiptDate(e.target.value)}
                  className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg bg-white"
                  disabled={isProcessing}
                />
             </div>
          </section>

          {/* Section 2: Items List */}
          <section className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest">
                   <FileText size={16} className="text-blue-500" /> รายการสินค้า / บริการ
                </h3>
                <button 
                  onClick={handleAddItem}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 font-black text-xs hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                   <PlusCircle size={16} /> เพิ่มรายการใหม่
                </button>
             </div>

             <div className="space-y-3">
                {lineItems.map((item, index) => (
                   <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100 group animate-slide-in hover:border-blue-200 transition-colors">
                      <div className="md:col-span-1 flex items-center justify-center font-black text-slate-300 text-lg">
                         {index + 1}
                      </div>
                      <div className="md:col-span-5 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อรายการ</label>
                         <input 
                           type="text" 
                           placeholder="เช่น ค่าซ่อมคอมพิวเตอร์..."
                           value={item.name}
                           onChange={e => updateItem(item.id, 'name', e.target.value)}
                           className="w-full border-slate-200 border-2 rounded-xl p-3 focus:border-blue-500 outline-none font-bold shadow-sm"
                           disabled={isProcessing}
                         />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">จำนวน</label>
                         <input 
                           type="number" 
                           value={item.quantity}
                           onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                           className="w-full border-slate-200 border-2 rounded-xl p-3 focus:border-blue-500 outline-none font-black text-center shadow-sm"
                           disabled={isProcessing}
                         />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right block">ราคาต่อหน่วย</label>
                         <div className="relative">
                            <input 
                              type="number" 
                              value={item.pricePerUnit || ''}
                              onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                              className="w-full border-slate-200 border-2 rounded-xl p-3 focus:border-blue-500 outline-none font-black text-right pr-8 shadow-sm"
                              disabled={isProcessing}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">฿</span>
                         </div>
                      </div>
                      <div className="md:col-span-1 flex justify-center pb-1">
                         <button 
                           onClick={() => handleRemoveItem(item.id)}
                           disabled={isProcessing}
                           className="text-slate-300 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 transition-all border border-transparent hover:border-red-100 disabled:opacity-30"
                         >
                            <Trash2 size={22} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* Section 3: Summary & Footer */}
          <section className="pt-8 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">หมายเหตุ (Notes)</label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ระบุข้อมูลเพิ่มเติม..."
                  className="w-full border-slate-200 border-2 rounded-3xl p-5 focus:border-blue-500 outline-none transition-all font-medium resize-none shadow-sm"
                  disabled={isProcessing}
                />
             </div>
             
             <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl border border-slate-800">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">ยอดรวมสุทธิ</p>
                   <p className="text-5xl font-black text-blue-400 leading-tight">
                     {totalAmount.toLocaleString()} 
                     <span className="text-lg font-bold ml-2 text-slate-500">฿</span>
                   </p>
                   <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      <p className="text-xs font-bold text-blue-100">({toThaiBaht(totalAmount)})</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-xs font-black text-emerald-400 bg-emerald-950/30 px-5 py-3 rounded-2xl border border-emerald-900/50">
                      <Banknote size={20} /> ชำระด้วยเงินสด (Cash)
                   </div>
                   <button 
                     onClick={handleProcessReceipt}
                     disabled={isProcessing}
                     className="w-full bg-blue-600 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                   >
                      {isProcessing ? (
                        <><Loader2 className="animate-spin" size={24} /> กำลังบันทึก...</>
                      ) : (
                        <><Receipt size={24} /> ออกใบเสร็จและบันทึก</>
                      )}
                   </button>
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Inventory;
