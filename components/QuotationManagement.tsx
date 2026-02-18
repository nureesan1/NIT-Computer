
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Quotation, QuotationItem, QuotationStatus } from '../types';
import { 
  FileText, Plus, Search, Trash2, Printer, 
  CheckCircle, Clock, X, Save, PlusCircle, 
  User, MapPin, Phone, Calendar, Info, 
  ArrowLeft, FileSpreadsheet, Tag, AlertTriangle, Hash, Percent
} from 'lucide-react';
import { format, addDays } from 'date-fns';

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

const QuotationManagement = () => {
  const { quotations, addQuotation, deleteQuotation, updateQuotationStatus, companyProfile } = useApp();
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'VIEW'>('LIST');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerCode: '',
    customerTaxId: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    validityDays: 30,
    notes: '',
    items: [{ id: '1', code: '', name: '', description: '', quantity: 1, unit: 'ชิ้น', pricePerUnit: 0, discount: 0, vatType: '7%' as '7%' | 'Exempt' | '0%', total: 0 }]
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now().toString(), code: '', name: '', description: '', quantity: 1, unit: 'ชิ้น', pricePerUnit: 0, discount: 0, vatType: '7%', total: 0 }]
    });
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter(i => i.id !== id) });
    }
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const lineTotal = updated.quantity * updated.pricePerUnit;
          updated.total = lineTotal - (updated.discount || 0);
          return updated;
        }
        return item;
      })
    });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let exemptTotal = 0;
    let vat7Total = 0;
    let vatAmount = 0;

    formData.items.forEach(item => {
      subtotal += item.total;
      if (item.vatType === '7%') {
        const taxable = item.total / 1.07;
        vat7Total += taxable;
        vatAmount += (item.total - taxable);
      } else {
        exemptTotal += item.total;
      }
    });

    return { subtotal, exemptTotal, vat7Total, vatAmount, total: subtotal };
  }, [formData.items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || formData.items.some(i => !i.name)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const qId = `QSMP2W/${format(new Date(), 'yyyy')}/${Math.floor(10000 + Math.random() * 90000)}`;
    const newQuotation: Quotation = {
      id: qId,
      date: format(new Date(), 'yyyy-MM-dd'),
      validityDays: formData.validityDays,
      customerName: formData.customerName,
      customerCode: formData.customerCode,
      customerTaxId: formData.customerTaxId,
      customerAddress: formData.customerAddress,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      items: formData.items as QuotationItem[],
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      notes: formData.notes,
      status: 'PENDING'
    };

    addQuotation(newQuotation);
    setSelectedQuotation(newQuotation);
    setViewMode('VIEW');
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบใบเสนอราคานี้?')) {
      deleteQuotation(id);
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SENT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'EXPIRED': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100';
    }
  };

  if (viewMode === 'VIEW' && selectedQuotation) {
    const validUntil = format(addDays(new Date(selectedQuotation.date), selectedQuotation.validityDays), 'dd/MM/yyyy');
    
    // Recalculate breakdown for view
    let exemptTotal = 0;
    let vat7Base = 0;
    let vat7Amount = 0;
    selectedQuotation.items.forEach(item => {
        if (item.vatType === '7%') {
            const base = item.total / 1.07;
            vat7Base += base;
            vat7Amount += (item.total - base);
        } else {
            exemptTotal += item.total;
        }
    });

    return (
      <div className="bg-slate-50 min-h-screen animate-fade-in p-4 lg:p-10">
        <div className="print:hidden max-w-4xl mx-auto mb-8 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-blue-100 shadow-xl shadow-blue-900/5">
           <div className="flex items-center gap-4">
              <button onClick={() => setViewMode('LIST')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                 <ArrowLeft size={24} className="text-slate-400" />
              </button>
              <div>
                 <h2 className="font-black text-slate-800">มุมมองใบเสนอราคา</h2>
                 <p className="text-slate-500 text-sm font-bold">เลขที่: {selectedQuotation.id}</p>
              </div>
           </div>
           <div className="flex gap-3">
              <button onClick={() => window.print()} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                 <Printer size={18} /> พิมพ์เอกสาร
              </button>
           </div>
        </div>

        {/* Professional Quotation Template */}
        <div className="max-w-[210mm] mx-auto bg-white p-8 lg:p-12 border rounded shadow-sm relative text-[13px] leading-relaxed text-slate-800 font-sans" id="quotation-print">
          
          <div className="flex justify-between items-start mb-6">
             <div className="flex gap-4">
                {companyProfile.logo ? (
                  <img src={companyProfile.logo} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center text-white">
                    <FileText size={32} />
                  </div>
                )}
                <div className="space-y-0.5">
                   <h1 className="text-lg font-bold text-slate-900 leading-tight">{companyProfile.name}</h1>
                   <p className="text-[11px] font-medium">เลขผู้เสียภาษี : {companyProfile.taxId} สาขา : 00000</p>
                   <p className="text-[11px] max-w-[400px]">{companyProfile.address}</p>
                   <div className="flex gap-4 text-[11px] mt-1">
                      <p><span className="font-bold">โทรศัพท์ :</span> {companyProfile.phone}</p>
                      <p><span className="font-bold">อีเมล :</span> {companyProfile.email}</p>
                   </div>
                </div>
             </div>
             <div className="text-right">
                <h2 className="text-4xl font-bold text-emerald-500 mb-1">ใบเสนอราคา</h2>
                <p className="text-emerald-600 text-sm font-bold">สำเนา</p>
                <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-left">
                   <p className="font-bold text-[11px]"><span className="text-slate-500">วันที่ :</span> {format(new Date(selectedQuotation.date), 'dd/MM/yyyy')}</p>
                   <p className="font-bold text-[11px] mt-1"><span className="text-slate-500">เลขที่เอกสาร :</span> {selectedQuotation.id}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-200 pt-4">
             <div className="space-y-0.5">
                <p className="font-bold"><span className="text-slate-500 w-24 inline-block">รหัสลูกค้า :</span> {selectedQuotation.customerCode || '-'}</p>
                <p className="font-bold text-base">{selectedQuotation.customerName}</p>
                <p className="font-bold"><span className="text-slate-500 w-24 inline-block">เลขผู้เสียภาษี :</span> {selectedQuotation.customerTaxId || '-'} <span className="text-slate-500 ml-2">สาขา 00000</span></p>
                <div className="flex gap-4">
                   <p><span className="text-slate-500 font-bold">โทรศัพท์ :</span> {selectedQuotation.customerPhone || '-'}</p>
                   <p><span className="text-slate-500 font-bold">อีเมล :</span> {selectedQuotation.customerEmail || '-'}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="font-bold text-slate-500">ยืนราคาถึงวันที่ : <span className="text-slate-900">{validUntil}</span></p>
             </div>
          </div>

          <table className="w-full mb-6 table-fixed">
             <thead className="bg-emerald-500 text-white">
                <tr className="text-[11px] font-bold">
                   <th className="py-2 px-2 text-center w-10">ลำดับ</th>
                   <th className="py-2 px-2 text-center w-24">รหัส</th>
                   <th className="py-2 px-2 text-left">รายละเอียด</th>
                   <th className="py-2 px-2 text-center w-16">จำนวน</th>
                   <th className="py-2 px-2 text-center w-16">หน่วยนับ</th>
                   <th className="py-2 px-2 text-center w-16">VAT</th>
                   <th className="py-2 px-2 text-right w-24">ราคา/หน่วยขาย</th>
                   <th className="py-2 px-2 text-right w-20">ส่วนลด</th>
                   <th className="py-2 px-2 text-right w-24">จำนวนเงิน</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 border-b">
                {selectedQuotation.items.map((item, idx) => (
                   <tr key={idx} className="text-[11px]">
                      <td className="py-2 px-2 text-center align-top">{idx + 1}</td>
                      <td className="py-2 px-2 text-center align-top font-mono">{item.code || '-'}</td>
                      <td className="py-2 px-2 align-top">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.description}</div>
                      </td>
                      <td className="py-2 px-2 text-center align-top">{item.quantity.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center align-top">{item.unit}</td>
                      <td className="py-2 px-2 text-center align-top">{item.vatType === '7%' ? '7.0%' : 'ไม่มีVat'}</td>
                      <td className="py-2 px-2 text-right align-top">{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right align-top">{(item.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right align-top font-bold">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                   </tr>
                ))}
             </tbody>
          </table>

          <div className="flex justify-between gap-10">
             <div className="flex-1 space-y-4">
                <div className="space-y-1 text-[11px]">
                   <p><span className="text-slate-500 font-bold">เลขที่บัญชี :</span> <span className="font-bold">{companyProfile.accountNumber || '-'}</span></p>
                   <p><span className="text-slate-500 font-bold">ชื่อบัญชี :</span> <span className="font-bold">{companyProfile.accountName || '-'}</span></p>
                   <p><span className="text-slate-500 font-bold">ชื่อธนาคาร :</span> <span className="font-bold">{companyProfile.bankName || '-'}</span></p>
                   <p><span className="text-slate-500 font-bold">สาขา :</span> {companyProfile.taxId?.substring(0,4)} Swift Code :</p>
                </div>
                
                <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-10">
                   <p className="text-[11px] font-bold mb-1">ตัวอักษร : {toThaiBaht(selectedQuotation.total)}</p>
                   <div className="flex items-start gap-2">
                      <span className="text-slate-500 font-bold text-[10px]">หมายเหตุ :</span>
                      <p className="text-[10px] text-slate-600 whitespace-pre-line">{selectedQuotation.notes || '-'}</p>
                   </div>
                </div>
             </div>

             <div className="w-72 text-[11px]">
                <div className="space-y-1 border-b pb-2">
                   <div className="flex justify-between"><span className="text-slate-500 font-bold">มูลค่ารวม</span><span>{selectedQuotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500 font-bold">มูลค่าเงินยกเว้นหรือ ภาษีมูลค่าเพิ่ม 0.00%</span><span>{exemptTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500 font-bold">มูลค่าก่อนภาษีมูลค่าเพิ่ม 7 %</span><span>{vat7Base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500 font-bold">ภาษีมูลค่าเพิ่ม 7 %</span><span>{vat7Amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>
                <div className="flex justify-between py-2 text-[13px] font-bold">
                   <span className="text-slate-900">มูลค่าสุทธิ</span>
                   <span className="text-slate-900">{selectedQuotation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 border-t text-[13px] font-bold">
                   <span className="text-slate-900">ยอดชำระ</span>
                   <span className="text-slate-900">{selectedQuotation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
             </div>
          </div>

          <div className="mt-20 flex justify-between items-end px-4">
             <div className="text-center w-48">
                <div className="border-b border-dotted border-slate-400 h-10 mb-2"></div>
                <p className="text-[10px] font-bold">ผู้สั่งซื้อ</p>
                <p className="text-[9px] text-slate-400 mt-1">วันที่ ...............................</p>
             </div>

             <div className="text-center flex flex-col items-center">
                {companyProfile.logo ? (
                  <img src={companyProfile.logo} alt="Small Logo" className="w-10 h-10 object-contain mb-1 opacity-50 grayscale" />
                ) : (
                   <div className="w-10 h-10 bg-slate-100 mb-1"></div>
                )}
                <p className="text-[8px] font-bold uppercase text-slate-400">{companyProfile.name}</p>
             </div>

             <div className="text-center w-48">
                <div className="border-b border-dotted border-slate-400 h-10 mb-2"></div>
                <p className="text-[10px] font-bold">ผู้ออกเอกสาร</p>
                <p className="text-[9px] text-slate-400 mt-1">วันที่ ...............................</p>
             </div>

             <div className="text-center w-48">
                <div className="border-b border-dotted border-slate-400 h-10 mb-2"></div>
                <p className="text-[10px] font-bold">ผู้อนุมัติ</p>
                <p className="text-[9px] text-slate-400 mt-1">วันที่ ...............................</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ระบบใบเสนอราคา (Quotation)</h2>
          <p className="text-slate-500">สร้างและติดตามสถานะใบเสนอราคาสำหรับลูกค้า</p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'FORM' ? 'LIST' : 'FORM')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${viewMode === 'FORM' ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {viewMode === 'FORM' ? <X size={20} /> : <Plus size={20} />}
          {viewMode === 'FORM' ? 'ปิดหน้าต่าง' : 'ออกใบเสนอราคาใหม่'}
        </button>
      </div>

      {viewMode === 'FORM' ? (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-10 animate-fade-in">
           {/* Section 1: Customer Info */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2 space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อลูกค้า / บริษัท *</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required placeholder="ระบุชื่อลูกค้า..." value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">รหัสลูกค้า</label>
                 <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="ระบุรหัส..." value={formData.customerCode} onChange={e => setFormData({...formData, customerCode: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลขผู้เสียภาษี</label>
                 <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="ระบุเลขภาษี..." value={formData.customerTaxId} onChange={e => setFormData({...formData, customerTaxId: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold" />
                 </div>
              </div>
              <div className="lg:col-span-2 space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="tel" placeholder="08x-xxx-xxxx" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold" />
                 </div>
              </div>
              <div className="lg:col-span-2 space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ระยะเวลาที่ยืนราคา (วัน)</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" value={formData.validityDays} onChange={e => setFormData({...formData, validityDays: parseInt(e.target.value) || 0})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold" />
                 </div>
              </div>
              <div className="lg:col-span-4 space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ที่อยู่ลูกค้า</label>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-5 text-slate-400" size={18} />
                    <textarea rows={2} value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-medium" placeholder="ระบุที่อยู่ละเอียด..." />
                 </div>
              </div>
           </div>

           {/* Section 2: Items List */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-blue-600" /> รายการสินค้า / บริการ
                 </h3>
                 <button type="button" onClick={handleAddItem} className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-blue-100 transition-all flex items-center gap-2">
                    <PlusCircle size={16} /> เพิ่มรายการ
                 </button>
              </div>

              <div className="space-y-4">
                 {formData.items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 animate-slide-in">
                       <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                          <div className="lg:col-span-1 text-center font-black text-slate-300 text-lg">{idx + 1}</div>
                          <div className="lg:col-span-2 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัส</label>
                             <input type="text" value={item.code} onChange={e => updateItem(item.id, 'code', e.target.value)} className="w-full border-slate-200 border-2 rounded-xl p-3 outline-none focus:border-blue-500 font-mono text-xs" />
                          </div>
                          <div className="lg:col-span-4 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รายการ *</label>
                             <input type="text" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="w-full border-slate-200 border-2 rounded-xl p-3 outline-none focus:border-blue-500 font-bold" />
                          </div>
                          <div className="lg:col-span-1 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">จำนวน</label>
                             <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full border-slate-200 border-2 rounded-xl p-3 outline-none focus:border-blue-500 font-black text-center" />
                          </div>
                          <div className="lg:col-span-1 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">หน่วย</label>
                             <input type="text" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full border-slate-200 border-2 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-center" />
                          </div>
                          <div className="lg:col-span-2 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right block">ราคาต่อหน่วย</label>
                             <input type="number" value={item.pricePerUnit || ''} onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)} className="w-full border-slate-200 border-2 rounded-xl p-3 outline-none focus:border-blue-500 font-black text-right" />
                          </div>
                          <div className="lg:col-span-1 flex justify-center pb-1">
                             <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 transition-all">
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pl-12">
                          <div className="lg:col-span-2 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">คำอธิบายเพิ่มเติม</label>
                             <input type="text" placeholder="ระบุรายละเอียดเพิ่มเติม..." value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full bg-white border-slate-200 border-2 rounded-xl p-2 text-xs text-slate-600 outline-none focus:border-blue-500" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ส่วนลด (บาท)</label>
                             <input type="number" value={item.discount} onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)} className="w-full bg-white border-slate-200 border-2 rounded-xl p-2 text-xs text-red-600 font-bold outline-none focus:border-blue-500" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทภาษี</label>
                             <select value={item.vatType} onChange={e => updateItem(item.id, 'vatType', e.target.value)} className="w-full bg-white border-slate-200 border-2 rounded-xl p-2 text-xs font-bold outline-none focus:border-blue-500">
                                <option value="7%">VAT 7% (รวมในราคา)</option>
                                <option value="Exempt">ยกเว้นภาษี / 0%</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Section 3: Summary */}
           <div className="pt-10 border-t border-slate-100 flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-4">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">หมายเหตุเพิ่มเติม / เงื่อนไข</label>
                 <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="ระบุเงื่อนไขการชำระเงิน, ระยะเวลาส่งมอบ..." className="w-full border-slate-200 border-2 rounded-3xl p-5 outline-none focus:border-blue-500 font-medium resize-none shadow-sm" />
              </div>

              <div className="w-full lg:w-96 bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-6 shadow-2xl">
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">รวมเป็นเงิน</span><span className="font-black">{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">ภาษีมูลค่าเพิ่ม 7%</span><span className="font-black text-blue-400">{totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span></div>
                 </div>
                 <div className="pt-6 border-t border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ยอดรวมทั้งสิ้น</p>
                    <p className="text-5xl font-black text-blue-500 tracking-tighter">{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-500 mt-2 font-bold italic">({toThaiBaht(totals.total)})</p>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95">
                    <Save size={24} /> บันทึกและออกใบเสนอราคา
                 </button>
              </div>
           </div>
        </form>
      ) : (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" placeholder="ค้นหาตามเลขที่ใบเสนอราคา หรือ ชื่อลูกค้า..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl p-4 pl-12 outline-none transition-all font-bold" />
              </div>
           </div>

           <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b">
                    <tr>
                       <th className="p-6">วันที่ / เลขที่</th>
                       <th className="p-6">ชื่อลูกค้า</th>
                       <th className="p-6 text-right">ยอดรวม</th>
                       <th className="p-6 text-center">สถานะ</th>
                       <th className="p-6 text-center">จัดการ</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {filteredQuotations.map(q => (
                       <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-6">
                             <div className="flex flex-col">
                                <span className="font-black text-slate-800">{q.id}</span>
                                <span className="text-xs text-slate-400">{format(new Date(q.date), 'dd/MM/yyyy')}</span>
                             </div>
                          </td>
                          <td className="p-6">
                             <span className="font-bold text-slate-700">{q.customerName}</span>
                          </td>
                          <td className="p-6 text-right">
                             <span className="font-black text-lg text-slate-900">{q.total.toLocaleString()} ฿</span>
                          </td>
                          <td className="p-6 text-center">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusBadge(q.status)}`}>
                                {q.status}
                             </span>
                          </td>
                          <td className="p-6">
                             <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setSelectedQuotation(q); setViewMode('VIEW'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="ดูเอกสาร"><FileText size={18} /></button>
                                <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ลบ"><Trash2 size={18} /></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                    {filteredQuotations.length === 0 && (
                       <tr>
                          <td colSpan={5} className="p-28 text-center bg-slate-50/20">
                             <div className="flex flex-col items-center gap-4 opacity-30">
                                <FileText size={64} className="text-slate-300" />
                                <p className="font-black text-slate-400 uppercase tracking-widest">ยังไม่มีข้อมูลใบเสนอราคา</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default QuotationManagement;
