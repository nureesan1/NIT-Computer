
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Save, Mail, Phone, MapPin, Globe, CreditCard, Image as ImageIcon, Wallet, QrCode, CloudCheck, CloudOff, Loader2, AlertCircle } from 'lucide-react';

const CompanyProfilePage = () => {
  const { companyProfile, updateCompanyProfile, isDbConnected } = useApp();
  const [formData, setFormData] = useState(companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('IDLE');
    
    try {
      const success = await updateCompanyProfile(formData);
      if (success) {
        setSaveStatus('SUCCESS');
        // รีเฟรชข้อมูลฟอร์มด้วยค่าปัจจุบัน
        setFormData(formData);
      } else {
        setSaveStatus('ERROR');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('ERROR');
    } finally {
      setIsSaving(false);
      if (saveStatus !== 'ERROR') {
        setTimeout(() => setSaveStatus('IDLE'), 4000);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'qrCode') => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ไม่ควรเกิน 1MB เพื่อความเสถียรของ Google Sheets)
      if (file.size > 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">โปรไฟล์บริษัท</h2>
          <p className="text-slate-500">จัดการข้อมูลพื้นฐานที่จะปรากฏในเอกสารและใบงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Building2 size={18} className="text-blue-500" /> ข้อมูลบริษัทและโลโก้
          </h3>
          <div className="flex items-center gap-3">
            {saveStatus === 'SUCCESS' && (
              <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-fade-in shadow-sm">
                <CloudCheck size={18} /> บันทึกและซิงค์สำเร็จ
              </span>
            )}
            {saveStatus === 'ERROR' && (
              <span className="text-red-600 text-sm font-bold flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-fade-in shadow-sm">
                <AlertCircle size={18} /> บันทึกล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ
              </span>
            )}
          </div>
        </div>

        <div className="p-8 lg:p-10 space-y-10">
          {/* Logo & Basic Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1 flex flex-col items-center space-y-4">
               <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain p-3" />
                  ) : (
                    <ImageIcon size={40} className="text-slate-300" />
                  )}
                  <label className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 text-xs font-black uppercase tracking-widest text-center px-4">
                    Change Logo
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} />
                  </label>
               </div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center">Company Logo</p>
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อบริษัท / ร้านค้า *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ *</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  />
               </div>
               <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">อีเมล</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  />
               </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ที่อยู่บริษัท *</label>
            <textarea 
              rows={3}
              required
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium shadow-sm resize-none"
              placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลขประจำตัวผู้เสียภาษี</label>
              <input 
                type="text" 
                value={formData.taxId}
                onChange={e => setFormData({...formData, taxId: e.target.value})}
                className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เว็บไซต์</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
              />
            </div>
          </div>

          {/* Bank Transfer Information */}
          <div className="pt-10 border-t border-slate-100">
             <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-wider">
               <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Wallet size={18} /></div>
               ข้อมูลการเงินและการรับชำระ
             </h3>
             
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
               <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    {formData.qrCode ? (
                      <img src={formData.qrCode} alt="Payment QR Code" className="w-full h-full object-contain p-2" />
                    ) : (
                      <QrCode size={40} className="text-indigo-200" />
                    )}
                    <label className="absolute inset-0 bg-indigo-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-center px-4">
                      Upload QR
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'qrCode')} />
                    </label>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Payment QR Code</span>
               </div>

               <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ธนาคาร</label>
                    <input 
                      type="text" 
                      placeholder="เช่น กสิกรไทย"
                      value={formData.bankName || ''}
                      onChange={e => setFormData({...formData, bankName: e.target.value})}
                      className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อบัญชี</label>
                    <input 
                      type="text" 
                      placeholder="ระบุชื่อบัญชี"
                      value={formData.accountName || ''}
                      onChange={e => setFormData({...formData, accountName: e.target.value})}
                      className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลขที่บัญชี</label>
                    <input 
                      type="text" 
                      placeholder="000-0-00000-0"
                      value={formData.accountNumber || ''}
                      onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                      className="w-full border-slate-200 border-2 rounded-2xl p-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black shadow-sm"
                    />
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 flex justify-between items-center px-10">
          <div className="flex items-center gap-4">
            {!isDbConnected ? (
              <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-900/50">
                <CloudOff size={16} /> Offline Mode
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-950/30 px-4 py-2 rounded-xl border border-emerald-900/50">
                <CloudCheck size={16} /> Cloud Sync Active
              </div>
            )}
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยใน Google Sheets</p>
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-3 bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isSaving ? (
              <><Loader2 className="animate-spin" size={24} /> กำลังบันทึกข้อมูล...</>
            ) : (
              <><Save size={24} className="group-hover:scale-110 transition-transform" /> บันทึกและซิงค์ Cloud</>
            )}
          </button>
        </div>
      </form>
      
      {saveStatus === 'ERROR' && (
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-start gap-4 animate-shake">
          <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
          <div className="space-y-1">
             <h4 className="font-black text-red-800 uppercase tracking-widest text-sm">การเชื่อมต่อล้มเหลว</h4>
             <p className="text-red-600 text-xs font-medium leading-relaxed">
               ไม่สามารถส่งข้อมูลไปยัง Google Sheets ได้ กรุณาตรวจสอบว่าคุณได้ทำการ Deploy Web App เป็นเวอร์ชั่นล่าสุด (v2.4) และตั้งค่า URL ในหน้า Settings ถูกต้องแล้ว
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfilePage;
