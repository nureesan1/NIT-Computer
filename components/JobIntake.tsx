
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, Customer } from '../types';
import { format } from 'date-fns';
import { Save, Printer, User, Building, MapPin, Phone, Mail, FileText, Calendar, Wrench, Monitor, ClipboardList, Layers, Wallet } from 'lucide-react';

const JobIntake = () => {
  const { addTask, companyProfile } = useApp();
  const [showReceipt, setShowReceipt] = useState(false);
  const [createdJob, setCreatedJob] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerCompany: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    jobType: 'REPAIR' as TaskType,
    jobTitle: '',
    jobDescription: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    location: '', 
    estimatedCost: 0,
    deposit: 0,
    assignee: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      name: formData.customerName,
      company: formData.customerCompany,
      phone: formData.customerPhone,
      email: formData.customerEmail,
      address: formData.customerAddress,
    };

    const newTask: Omit<Task, 'id'> = {
      type: formData.jobType,
      title: formData.jobTitle,
      description: formData.jobDescription,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location || formData.customerAddress,
      assignee: formData.assignee,
      status: 'PENDING',
      customer: customer,
      estimatedCost: formData.estimatedCost,
      deposit: formData.deposit
    };

    const mockId = "JOB-" + new Date().getTime().toString().slice(-6);
    const taskWithId = { ...newTask, id: mockId } as Task;
    addTask(newTask);
    setCreatedJob(taskWithId);
    setShowReceipt(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '', customerCompany: '', customerPhone: '', customerEmail: '', customerAddress: '',
      jobType: 'REPAIR', jobTitle: '', jobDescription: '', startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '', location: '', estimatedCost: 0, deposit: 0, assignee: ''
    });
    setShowReceipt(false);
    setCreatedJob(null);
  };

  if (showReceipt && createdJob) {
    const remaining = (createdJob.estimatedCost || 0) - (createdJob.deposit || 0);
    return (
      <div className="bg-white min-h-screen animate-fade-in">
        <div className="print:hidden p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-green-600" size={20} />
            สร้างใบงานสำเร็จ
          </h2>
          <div className="flex gap-2">
            <button onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">กลับหน้าฟอร์ม</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all active:scale-95">
              <Printer size={18} /> พิมพ์ใบรับงาน
            </button>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto bg-white" id="receipt-area">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex items-start gap-4">
              {companyProfile.logo ? (
                <img src={companyProfile.logo} alt="Logo" className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 flex items-center justify-center rounded border"><Monitor className="text-slate-300" /></div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{companyProfile.name}</h1>
                <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed">{companyProfile.address}</p>
                <p className="text-sm text-slate-500 mt-1">
                   <span className="font-semibold">Tel:</span> {companyProfile.phone} 
                   {companyProfile.email && <span className="ml-2"><span className="font-semibold">Email:</span> {companyProfile.email}</span>}
                </p>
                {companyProfile.taxId && <p className="text-sm text-slate-500 mt-1"><span className="font-semibold">Tax ID:</span> {companyProfile.taxId}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 px-4 py-2 rounded mb-2 inline-block border border-slate-200">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">เลขที่ใบงาน</span>
                <span className="block text-xl font-mono font-bold text-slate-800">{createdJob.id}</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>ประเภท: <span className="font-bold">{createdJob.type === 'REPAIR' ? 'งานซ่อม' : createdJob.type === 'INSTALLATION' ? 'งานติดตั้ง' : 'งานระบบ'}</span></p>
                <p>วันที่ออก: {format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2"><User size={16} className="text-blue-600" /> ข้อมูลลูกค้า</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-24 inline-block text-slate-500">ชื่อลูกค้า:</span> <span className="text-slate-800">{createdJob.customer?.name}</span></p>
                {createdJob.customer?.company && <p><span className="font-semibold w-24 inline-block text-slate-500">บริษัท:</span> <span className="text-slate-800">{createdJob.customer?.company}</span></p>}
                <p><span className="font-semibold w-24 inline-block text-slate-500">เบอร์โทร:</span> <span className="text-slate-800">{createdJob.customer?.phone}</span></p>
                {createdJob.customer?.address && <p><span className="font-semibold w-24 inline-block text-slate-500">ที่อยู่:</span> <span className="text-slate-800">{createdJob.customer?.address}</span></p>}
              </div>
            </div>
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-600" /> รายละเอียดงาน</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-32 inline-block text-slate-500">หัวข้อ:</span> <span className="text-slate-800">{createdJob.title}</span></p>
                <p><span className="font-semibold w-32 inline-block text-slate-500">วันที่รับงาน:</span> <span className="text-slate-800">{createdJob.startDate}</span></p>
                {createdJob.endDate && <p><span className="font-semibold w-32 inline-block text-slate-500">กำหนดส่ง/ติดตั้ง:</span> <span className="text-slate-800 font-bold text-blue-700">{createdJob.endDate}</span></p>}
                <p><span className="font-semibold w-32 inline-block text-slate-500">ผู้รับผิดชอบ:</span> <span className="text-slate-800">{createdJob.assignee || "-"}</span></p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><ClipboardList size={16} /> รายละเอียดปัญหา / ขอบเขตงาน</h3>
            <div className="border rounded-lg p-4 min-h-[120px] bg-white whitespace-pre-wrap text-slate-700 leading-relaxed shadow-sm">{createdJob.description || "-"}</div>
          </div>

          <div className="mb-8 flex justify-end">
             <div className="w-1/2 space-y-2">
                <div className="flex justify-between border-b py-2"><span className="text-slate-600">ราคาประเมิน:</span><span className="font-bold text-lg">{createdJob.estimatedCost?.toLocaleString()} ฿</span></div>
                <div className="flex justify-between border-b py-2"><span className="text-slate-600 font-semibold">มัดจำแล้ว:</span><span className="font-bold text-green-600">{createdJob.deposit?.toLocaleString()} ฿</span></div>
                <div className="flex justify-between border-b-2 border-slate-900 py-3 bg-slate-50 px-2 rounded"><span className="font-bold text-slate-800">ยอดคงค้าง:</span><span className="font-black text-2xl text-red-600">{remaining.toLocaleString()} ฿</span></div>
                <p className="text-[10px] text-slate-400 mt-1 italic text-right">* ราคาอาจมีการเปลี่ยนแปลงตามอุปกรณ์ที่ใช้จริง</p>
             </div>
          </div>

          <div className="mb-12 text-[11px] text-slate-500 border-t pt-4 grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-1 text-slate-700">เงื่อนไขการให้บริการ</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>กรุณานำใบรับงานนี้มารับเครื่องคืนทุกครั้ง</li>
                <li>หากพ้นกำหนด 30 วัน บริษัทขอสงวนสิทธิ์ในการจัดการสินค้าตามสมควร</li>
                <li>การรับประกันครอบคลุมเฉพาะอาการเดิมที่ซ่อมและอุปกรณ์ที่เปลี่ยน</li>
                <li>กรณีล้างเครื่องหรือติดตั้งโปรแกรม ข้อมูลอาจสูญหาย ทางร้านไม่รับผิดชอบข้อมูล</li>
              </ol>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
               <p className="font-bold mb-2 text-slate-700">ข้อมูลการโอนเงิน</p>
               <p>ธนาคาร: {companyProfile.bankName || "-"}</p>
               <p>ชื่อบัญชี: {companyProfile.accountName || "-"}</p>
               <p className="font-bold text-slate-900">เลขที่บัญชี: {companyProfile.accountNumber || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mt-16 pb-12">
            <div className="text-center">
              <div className="border-b border-slate-400 h-12 mb-2 w-48 mx-auto"></div>
              <p className="text-xs text-slate-500">ลงชื่อลูกค้า</p>
              <p className="text-[10px] text-slate-400 mt-1">( {createdJob.customer?.name} )</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 h-12 mb-2 w-48 mx-auto"></div>
              <p className="text-xs text-slate-500">ลงชื่อผู้รับงาน / เจ้าหน้าที่</p>
              <p className="text-[10px] text-slate-400 mt-1">( {createdJob.assignee || companyProfile.name} )</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg"><ClipboardList size={24} /></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">รับงานลูกค้า / เปิดใบงานใหม่</h2>
          <p className="text-slate-500">บันทึกข้อมูลและรายละเอียดเพื่อออกหลักฐานการรับงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        {/* Customer Information */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3 border-slate-100">
            <User size={20} className="text-blue-500" /> ข้อมูลลูกค้า
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อ-นามสกุล *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required 
                  placeholder="เช่น คุณสมชาย ใจดี" 
                  className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.customerName} 
                  onChange={e => setFormData({...formData, customerName: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">เบอร์โทรศัพท์ *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="tel" 
                  required 
                  placeholder="081-XXX-XXXX" 
                  className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.customerPhone} 
                  onChange={e => setFormData({...formData, customerPhone: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อบริษัท (ถ้ามี)</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="ระบุบริษัท" 
                  className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.customerCompany} 
                  onChange={e => setFormData({...formData, customerCompany: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">อีเมล (ถ้ามี)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  placeholder="customer@email.com" 
                  className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.customerEmail} 
                  onChange={e => setFormData({...formData, customerEmail: e.target.value})} 
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ที่อยู่ในการจัดส่ง/ติดตั้ง</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-slate-400" size={16} />
                <textarea 
                  placeholder="ระบุที่อยู่ละเอียด..." 
                  rows={2}
                  className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.customerAddress} 
                  onChange={e => setFormData({...formData, customerAddress: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Job Details */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3 border-slate-100">
            <Wrench size={20} className="text-blue-500" /> รายละเอียดงาน
          </h3>
          
          <div className="space-y-6">
            {/* Job Type Radio Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภทงาน *</label>
              <div className="flex gap-2">
                {[
                  { id: 'REPAIR', label: 'งานซ่อม', icon: <Wrench size={14} />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                  { id: 'INSTALLATION', label: 'งานติดตั้ง', icon: <Layers size={14} />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                  { id: 'SYSTEM', label: 'งานระบบ', icon: <Monitor size={14} />, color: 'bg-purple-50 text-purple-600 border-purple-200' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({...formData, jobType: type.id as TaskType})}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                      formData.jobType === type.id 
                      ? `${type.id === 'REPAIR' ? 'bg-orange-600 text-white border-orange-600' : type.id === 'INSTALLATION' ? 'bg-blue-600 text-white border-blue-600' : 'bg-purple-600 text-white border-purple-600 shadow-md'}` 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">หัวข้อเรื่อง / ชื่องาน *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    required 
                    placeholder="เช่น ซ่อมคอมพิวเตอร์เปิดไม่ติด, ติดตั้งกล้องวงจรปิด 4 ตัว" 
                    className="w-full border-slate-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={formData.jobTitle} 
                    onChange={e => setFormData({...formData, jobTitle: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายละเอียดปัญหา / อาการเสีย / ขอบเขตงาน</label>
                <textarea 
                  placeholder="ระบุรายละเอียดเพื่อเป็นข้อมูลให้ช่าง..." 
                  className="w-full border-slate-200 border p-4 rounded-xl min-h-[140px] outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.jobDescription} 
                  onChange={e => setFormData({...formData, jobDescription: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> วันที่รับงาน *</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> กำหนดส่งคืน / วันนัดติดตั้ง</label>
                <input 
                  type="date" 
                  className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" 
                  value={formData.endDate} 
                  onChange={e => setFormData({...formData, endDate: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><User size={12} /> ผู้รับผิดชอบ (ช่าง)</label>
                <input 
                  type="text" 
                  placeholder="ระบุชื่อช่างที่รับผิดชอบ" 
                  className="w-full border-slate-200 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={formData.assignee} 
                  onChange={e => setFormData({...formData, assignee: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Wallet size={12} /> ราคาประเมิน</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full border-slate-200 border p-3 pr-8 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" 
                      value={formData.estimatedCost || ''} 
                      onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})} 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Wallet size={12} /> เงินมัดจำ</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full border-slate-200 border p-3 pr-8 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-green-600" 
                      value={formData.deposit || ''} 
                      onChange={e => setFormData({...formData, deposit: parseFloat(e.target.value) || 0})} 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
          <button 
            type="button" 
            onClick={resetForm} 
            className="px-8 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors order-2 sm:order-1"
          >
            ล้างข้อมูลทั้งหมด
          </button>
          <button 
            type="submit" 
            className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Save size={20} />
            บันทึกข้อมูลและออกใบงาน
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobIntake;