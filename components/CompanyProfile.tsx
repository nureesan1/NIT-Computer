
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Save, Mail, Phone, MapPin, Globe, CreditCard, Image as ImageIcon, Wallet, QrCode } from 'lucide-react';

const CompanyProfilePage = () => {
  const { companyProfile, updateCompanyProfile } = useApp();
  const [formData, setFormData] = useState(companyProfile);
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(formData);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'qrCode') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">โปรไฟล์บริษัท</h2>
          <p className="text-slate-500">ข้อมูลนี้จะใช้แสดงในหัวกระดาษใบรับงานและเอกสารต่างๆ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">แก้ไขข้อมูลพื้นฐาน</h3>
          {saveStatus && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-fade-in">
              บันทึกข้อมูลสำเร็จ!
            </span>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Section */}
          <div className="md:col-span-2 flex items-center gap-6 pb-6 border-b border-slate-100">
             <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
                {formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
                <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-xs font-bold">
                  เปลี่ยนโลโก้
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} />
                </label>
             </div>
             <div>
                <h4 className="font-bold text-slate-700">โลโก้บริษัท</h4>
                <p className="text-xs text-slate-400">แนะนำเป็นไฟล์ PNG พื้นหลังโปร่งใส (ขนาดที่แนะนำ 200x200 px)</p>
             </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-2">ชื่อบริษัท / ร้านค้า</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-2">ที่อยู่</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-4 text-slate-400" size={18} />
              <textarea 
                rows={3}
                required
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">เบอร์โทรศัพท์</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">เลขประจำตัวผู้เสียภาษี</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={formData.taxId}
                onChange={e => setFormData({...formData, taxId: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">เว็บไซต์</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full border-slate-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
              />
            </div>
          </div>

          {/* Bank Transfer Information Section */}
          <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Wallet size={18} className="text-blue-600" /> ข้อมูลการโอนเงิน (แสดงในใบรับงาน)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
               {/* QR Code Upload */}
               <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group mb-2 shadow-inner">
                    {formData.qrCode ? (
                      <img src={formData.qrCode} alt="Payment QR Code" className="w-full h-full object-contain p-1" />
                    ) : (
                      <QrCode size={40} className="text-slate-300" />
                    )}
                    <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-black uppercase tracking-widest text-center px-2">
                      อัปโหลด QR Code
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'qrCode')} />
                    </label>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QR Code การโอนเงิน</span>
               </div>

               <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">ธนาคาร</label>
                    <input 
                      type="text" 
                      placeholder="เช่น กสิกรไทย"
                      value={formData.bankName || ''}
                      onChange={e => setFormData({...formData, bankName: e.target.value})}
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all text-sm font-medium"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">ชื่อบัญชี</label>
                    <input 
                      type="text" 
                      placeholder="ระบุชื่อบัญชี"
                      value={formData.accountName || ''}
                      onChange={e => setFormData({...formData, accountName: e.target.value})}
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all text-sm font-medium"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">เลขที่บัญชี</label>
                    <input 
                      type="text" 
                      placeholder="XXX-X-XXXXX-X"
                      value={formData.accountNumber || ''}
                      onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all text-sm font-black"
                    />
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-end">
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-xl font-black text-lg hover:bg-blue-700 shadow-xl hover:shadow-blue-200 transition-all active:scale-95"
          >
            <Save size={20} />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
