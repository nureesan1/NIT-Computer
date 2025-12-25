import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, Customer } from '../types';
import { format } from 'date-fns';
import { Save, Printer, User, Building, MapPin, Phone, Mail, FileText, Calendar, Wrench, Monitor } from 'lucide-react';

const JobIntake = () => {
  const { addTask } = useApp();
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
    location: '', // For install
    estimatedCost: 0,
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
      estimatedCost: formData.estimatedCost
    };

    // In a real app, addTask would return the new ID. Here we mock it for the receipt.
    // We add to state first to show receipt.
    const mockId = "JOB-" + new Date().getTime().toString().slice(-6);
    const taskWithId = { ...newTask, id: mockId } as Task;
    
    // Add to context
    addTask(newTask);
    
    // Set for receipt view
    setCreatedJob(taskWithId);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerCompany: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      jobType: 'REPAIR',
      jobTitle: '',
      jobDescription: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      location: '',
      estimatedCost: 0,
      assignee: ''
    });
    setShowReceipt(false);
    setCreatedJob(null);
  };

  if (showReceipt && createdJob) {
    return (
      <div className="bg-white min-h-screen">
        {/* Actions Bar (Hidden on Print) */}
        <div className="print:hidden p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800">Job Created Successfully</h2>
          <div className="flex gap-2">
            <button 
              onClick={resetForm}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Back to Form
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer size={18} /> Print Receipt
            </button>
          </div>
        </div>

        {/* Receipt Layout (Visible on Print) */}
        <div className="p-8 max-w-4xl mx-auto bg-white" id="receipt-area">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">NIT Computer Solution LTD.</h1>
              <p className="text-sm text-slate-500">123 Tech Park, Bangkok 10250</p>
              <p className="text-sm text-slate-500">Tel: 02-123-4567 | Email: support@nit.co.th</p>
              <p className="text-sm text-slate-500">Tax ID: 0105551234567</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 px-4 py-2 rounded mb-2 inline-block">
                <span className="block text-xs text-slate-500 uppercase font-bold">Job Receipt No</span>
                <span className="block text-xl font-mono font-bold text-slate-800">{createdJob.id}</span>
              </div>
              <p className="text-sm text-slate-600">วันที่: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <User size={16} /> ข้อมูลลูกค้า (Customer)
              </h3>
              <p><span className="font-semibold w-24 inline-block text-sm">ชื่อ:</span> {createdJob.customer?.name}</p>
              {createdJob.customer?.company && <p><span className="font-semibold w-24 inline-block text-sm">บริษัท:</span> {createdJob.customer?.company}</p>}
              <p><span className="font-semibold w-24 inline-block text-sm">เบอร์โทร:</span> {createdJob.customer?.phone}</p>
              {createdJob.customer?.email && <p><span className="font-semibold w-24 inline-block text-sm">อีเมล:</span> {createdJob.customer?.email}</p>}
              {createdJob.customer?.address && <p><span className="font-semibold w-24 inline-block text-sm">ที่อยู่:</span> {createdJob.customer?.address}</p>}
            </div>

            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <FileText size={16} /> ข้อมูลงาน (Job Details)
              </h3>
              <p>
                <span className="font-semibold w-32 inline-block text-sm">ประเภทงาน:</span> 
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${createdJob.type === 'REPAIR' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                  {createdJob.type}
                </span>
              </p>
              <p><span className="font-semibold w-32 inline-block text-sm">ชื่องาน:</span> {createdJob.title}</p>
              <p><span className="font-semibold w-32 inline-block text-sm">วันที่รับงาน:</span> {createdJob.startDate}</p>
              {createdJob.endDate && <p><span className="font-semibold w-32 inline-block text-sm">กำหนดส่ง/ติดตั้ง:</span> {createdJob.endDate}</p>}
              {createdJob.assignee && <p><span className="font-semibold w-32 inline-block text-sm">ผู้รับผิดชอบ:</span> {createdJob.assignee}</p>}
            </div>
          </div>

          {/* Description & Scope */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-2">รายละเอียดงาน / ปัญหา (Description & Scope)</h3>
            <div className="border rounded-lg p-4 min-h-[100px] bg-white">
              {createdJob.description || "-"}
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="mb-8 flex justify-end">
             <div className="w-1/2">
                <div className="flex justify-between border-b py-2">
                    <span className="font-semibold">ราคาประเมิน (Estimated Cost):</span>
                    <span className="font-bold text-xl">{createdJob.estimatedCost?.toLocaleString()} ฿</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">*ราคาอาจมีการเปลี่ยนแปลงตามอะไหล่และหน้างานจริง</p>
             </div>
          </div>

          {/* Terms */}
          <div className="mb-12 text-xs text-slate-500 border-t pt-4">
            <p className="font-bold mb-1">เงื่อนไขการให้บริการ (Terms & Conditions)</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>กรุณานำใบรับงานนี้มารับสินค้าคืนทุกครั้ง</li>
              <li>หากพ้นกำหนด 30 วัน นับจากวันที่แจ้งให้มารับ บริษัทขอสงวนสิทธิ์ในการบริจาคหรือทำลายโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
              <li>บริษัทรับประกันเฉพาะอาการเดิม 30 วัน (สำหรับงานซ่อม)</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-16 mt-16">
            <div className="text-center">
              <div className="border-b border-dotted border-slate-400 h-8 mb-2"></div>
              <p className="text-sm font-semibold">{createdJob.customer?.name}</p>
              <p className="text-xs text-slate-500">ลายเซ็นลูกค้า (Customer Signature)</p>
            </div>
            <div className="text-center">
              <div className="border-b border-dotted border-slate-400 h-8 mb-2"></div>
              <p className="text-sm font-semibold">เจ้าหน้าที่รับงาน (Staff)</p>
              <p className="text-xs text-slate-500">ลายเซ็นเจ้าหน้าที่ (Authorized Signature)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-600 rounded-lg text-white">
          <ClipboardListIcon />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">รับงานลูกค้า / เปิดใบงาน</h2>
          <p className="text-slate-500">บันทึกข้อมูลลูกค้าและรายละเอียดงานซ่อม/ติดตั้ง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        
        {/* Customer Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
            <User size={20} className="text-blue-500" /> 
            1. ข้อมูลลูกค้า (Customer Info)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="label-text">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  className="input-field pl-10" 
                  placeholder="เช่น คุณสมชาย ใจดี"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="label-text">ชื่อบริษัท (ถ้ามี)</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.customerCompany}
                  onChange={e => setFormData({...formData, customerCompany: e.target.value})}
                  className="input-field pl-10" 
                  placeholder="เช่น บจก. เอบีซี"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="label-text">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  required
                  value={formData.customerPhone}
                  onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                  className="input-field pl-10" 
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="label-text">อีเมล</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={formData.customerEmail}
                  onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                  className="input-field pl-10" 
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label-text">ที่อยู่</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={formData.customerAddress}
                  onChange={e => setFormData({...formData, customerAddress: e.target.value})}
                  className="input-field pl-10" 
                  placeholder="ที่อยู่สำหรับออกใบเสร็จ / หน้างาน"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
            <FileText size={20} className="text-blue-500" /> 
            2. รายละเอียดงาน (Job Details)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="label-text">ประเภทงาน</label>
               <div className="flex gap-4 mt-2">
                 <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.jobType === 'REPAIR' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'hover:bg-slate-50'}`}>
                    <input type="radio" name="jobType" value="REPAIR" checked={formData.jobType === 'REPAIR'} onChange={() => setFormData({...formData, jobType: 'REPAIR'})} className="hidden" />
                    <Wrench size={18} /> งานรับซ่อม
                 </label>
                 <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.jobType === 'INSTALLATION' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'hover:bg-slate-50'}`}>
                    <input type="radio" name="jobType" value="INSTALLATION" checked={formData.jobType === 'INSTALLATION'} onChange={() => setFormData({...formData, jobType: 'INSTALLATION'})} className="hidden" />
                    <Monitor size={18} /> งานติดตั้ง
                 </label>
               </div>
            </div>
            <div>
              <label className="label-text">หัวข้อเรื่อง / ชื่องาน <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                className="input-field" 
                placeholder={formData.jobType === 'REPAIR' ? 'เช่น ซ่อม Notebook เปิดไม่ติด' : 'เช่น ติดตั้งกล้องวงจรปิด 4 จุด'}
              />
            </div>
            
            <div>
              <label className="label-text">วันที่รับงาน (Intake Date) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div>
              <label className="label-text">{formData.jobType === 'REPAIR' ? 'กำหนดรับคืน (Return Date)' : 'วันที่เข้าติดตั้ง (Install Date)'}</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label-text">รายละเอียดปัญหา / ขอบเขตงาน</label>
              <textarea 
                rows={4}
                value={formData.jobDescription}
                onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                className="input-field py-2" 
                placeholder="ระบุอาการเสีย, อุปกรณ์ที่นำมาด้วย (Adapter/Bag), หรือรายละเอียดจุดติดตั้ง"
              />
            </div>

            <div className="md:col-span-1">
              <label className="label-text">สถานที่ (สำหรับงานติดตั้ง)</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="input-field" 
                placeholder="ถ้าว่างจะใช้ที่อยู่ลูกค้า"
              />
            </div>

             <div className="md:col-span-1">
              <label className="label-text">ผู้รับผิดชอบ (Assignee)</label>
              <input 
                type="text" 
                value={formData.assignee}
                onChange={e => setFormData({...formData, assignee: e.target.value})}
                className="input-field" 
                placeholder="ช่าง..."
              />
            </div>

             <div className="md:col-span-1">
              <label className="label-text">ราคาประเมินเบื้องต้น (Estimated Cost)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
                <input 
                  type="number" 
                  value={formData.estimatedCost || ''}
                  onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})}
                  className="input-field pl-8" 
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">
            ล้างข้อมูล
          </button>
          <button type="submit" className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
            <Save size={18} /> บันทึกและออกใบงาน
          </button>
        </div>

      </form>
      
      {/* Helper styles for inputs */}
      <style>{`
        .label-text {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .input-field {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.75rem 0.75rem;
          outline: none;
          transition: border-color 0.2s;
          line-height: 1.6;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

// Helper Icon
const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/><path d="M9 8h6"/></svg>
);

export default JobIntake;