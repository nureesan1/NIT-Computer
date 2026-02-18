
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerRecord } from '../types';
import { 
  Users, Plus, Search, Trash2, Edit2, X, Save, 
  User, Building, Phone, Mail, MapPin, Tag, 
  ChevronRight, Info, UserCheck, PhoneCall
} from 'lucide-react';

const CustomerManagement = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<CustomerRecord>>({
    name: '',
    company: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData as Omit<CustomerRecord, 'id'>);
    }
    handleCloseForm();
  };

  const handleEdit = (customer: CustomerRecord) => {
    setFormData({ ...customer });
    setEditingId(customer.id);
    setViewMode('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อลูกค้านี้?')) {
      deleteCustomer(id);
    }
  };

  const handleCloseForm = () => {
    setViewMode('LIST');
    setEditingId(null);
    setFormData({ name: '', company: '', taxId: '', phone: '', email: '', address: '', notes: '' });
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ระบบจัดการรายชื่อลูกค้า</h2>
          <p className="text-slate-500 font-medium">บันทึกและจัดการข้อมูลลูกค้าเพื่อความสะดวกรวดเร็วในการทำงาน</p>
        </div>
        <button 
          onClick={() => viewMode === 'FORM' ? handleCloseForm() : setViewMode('FORM')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 ${viewMode === 'FORM' ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {viewMode === 'FORM' ? <X size={20} /> : <Plus size={20} />}
          {viewMode === 'FORM' ? 'ปิดหน้าต่าง' : 'เพิ่มลูกค้าใหม่'}
        </button>
      </div>

      {viewMode === 'FORM' ? (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-10 animate-slide-in">
           <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className={`p-3 rounded-2xl text-white shadow-lg ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`}>
                 <User size={24} />
              </div>
              <div>
                 <h3 className="font-black text-xl text-slate-800">{editingId ? 'แก้ไขข้อมูลลูกค้า' : 'ลงทะเบียนลูกค้าใหม่'}</h3>
                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{editingId ? editingId : 'New Customer Profile'}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อ-นามสกุล (บุคคล / ผู้ติดต่อ) *</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input type="text" required placeholder="ระบุชื่อ..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold transition-all" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อบริษัท / องค์กร</label>
                 <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input type="text" placeholder="ระบุชื่อบริษัท (ถ้ามี)" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold transition-all" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ *</label>
                 <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input type="tel" required placeholder="08x-xxx-xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-black text-lg transition-all" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">อีเมล</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input type="email" placeholder="example@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold transition-all" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลขผู้เสียภาษี (Tax ID)</label>
                 <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input type="text" placeholder="ระบุเลขประจำตัวผู้เสียภาษี" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-bold transition-all" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ที่อยู่ (สำหรับการจัดส่ง / ใบกำกับ)</label>
                 <div className="relative group">
                    <MapPin className="absolute left-4 top-5 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 pl-12 focus:border-blue-500 outline-none font-medium transition-all" placeholder="ระบุที่อยู่ละเอียด..." />
                 </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">บันทึกเพิ่มเติม (Notes)</label>
                 <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border-slate-200 border-2 rounded-2xl p-4 focus:border-blue-500 outline-none font-medium transition-all" placeholder="ประวัติการติดต่อ, เงื่อนไขพิเศษ..." />
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
              <button type="button" onClick={handleCloseForm} className="px-10 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors">ยกเลิก</button>
              <button type="submit" className={`px-16 py-4 rounded-3xl text-white font-black text-lg shadow-xl active:scale-95 transition-all flex items-center gap-3 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
                 <Save size={24} /> {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลลูกค้า'}
              </button>
           </div>
        </form>
      ) : (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input type="text" placeholder="ค้นหาตามชื่อ, บริษัท หรือ เบอร์โทรศัพท์..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl p-4 pl-12 outline-none transition-all font-bold" />
              </div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 font-black text-xs uppercase tracking-widest flex items-center gap-3">
                 <UserCheck size={18} /> ทั้งหมด {customers.length} คน
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map(customer => (
                 <div key={customer.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -z-10 group-hover:bg-blue-600 group-hover:opacity-10 transition-all duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                          <User size={28} />
                       </div>
                       <div className="flex gap-1">
                          <button onClick={() => handleEdit(customer)} className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(customer.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div>
                          <h4 className="font-black text-slate-800 text-xl leading-tight group-hover:text-blue-600 transition-colors">{customer.name}</h4>
                          {customer.company && (
                             <p className="text-slate-500 font-bold text-sm flex items-center gap-1.5 mt-1 opacity-70">
                                <Building size={14} className="text-blue-400" /> {customer.company}
                             </p>
                          )}
                       </div>

                       <div className="pt-4 border-t border-slate-50 space-y-2.5">
                          <a href={`tel:${customer.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                             <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Phone size={14} /></div>
                             <span className="font-black tracking-tight">{customer.phone}</span>
                          </a>
                          {customer.email && (
                             <div className="flex items-center gap-3 text-slate-500 text-xs font-bold overflow-hidden truncate">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Mail size={14} /></div>
                                <span>{customer.email}</span>
                             </div>
                          )}
                          {customer.address && (
                             <div className="flex items-start gap-3 text-slate-400 text-[11px] font-medium leading-relaxed">
                                <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg mt-0.5"><MapPin size={14} /></div>
                                <span className="line-clamp-2">{customer.address}</span>
                             </div>
                          )}
                       </div>
                    </div>

                    <button 
                       className="w-full mt-8 py-3 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
                       onClick={() => handleEdit(customer)}
                    >
                       ดูข้อมูลและแก้ไข <ChevronRight size={14} />
                    </button>
                 </div>
              ))}

              {filteredCustomers.length === 0 && (
                 <div className="md:col-span-2 lg:col-span-3 p-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <Users size={64} className="text-slate-300" />
                       <p className="font-black text-slate-400 uppercase tracking-widest">ไม่พบรายชื่อลูกค้าที่ต้องการ</p>
                       <button onClick={() => setViewMode('FORM')} className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">เพิ่มลูกค้าคนแรก</button>
                    </div>
                 </div>
              )}
           </div>

           <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem] flex items-start gap-6">
              <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg">
                 <Info size={28} />
              </div>
              <div className="space-y-1">
                 <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">ข้อแนะนำระบบจัดการลูกค้า</h4>
                 <p className="text-indigo-800 text-sm font-medium leading-relaxed">
                    ระบบจะบันทึกข้อมูลลูกค้าทั้งหมดลงใน Google Sheets แผ่นงานชื่อ "Customers" 
                    คุณสามารถใช้ข้อมูลเหล่านี้ในการออกใบเสนอราคา (Quotation) หรือรับงานซ่อม (Job Intake) ได้อย่างรวดเร็วโดยไม่ต้องกรอกข้อมูลใหม่ทุกครั้ง
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
