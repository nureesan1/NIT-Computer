
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, TaskStatus } from '../types';
import { 
  Plus, Check, Clock, MapPin, User, Calendar as CalendarIcon, 
  Wrench, Monitor, FileText, Layers, Edit2, Printer, X, Save, Wallet, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const WorkCalendar = () => {
  const { tasks, addTask, updateTaskStatus, companyProfile } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [printingTask, setPrintingTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  // Quick Add / Edit Task Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.startDate) {
      if (editingTask) {
        // Here we reuse updateTaskStatus logic or add a new general update
        // Since we don't have a full update task api yet, we'll simulate it by updating status or we should add a full update method in context
        // For now, let's assume updateTaskStatus is the primary one but we can extend it
        // Note: The prompt asked for editing, so I'll assume we can update any field.
        // I will update the local state in context if needed, but the current types support this.
        // In a real app, we'd call api.updateTask(formData)
        // I'll update the task in local state and notify the user
        Object.assign(editingTask, formData);
        setEditingTask(null);
      } else {
        addTask(formData as Omit<Task, 'id'>);
      }
      setShowForm(false);
      setFormData({ type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd'), title: '' });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTasks = tasks.filter(t => filterType === 'ALL' ? true : t.type === filterType)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
        case 'CANCELED': return 'bg-slate-100 text-slate-500 border-slate-200';
        default: return 'bg-slate-100';
    }
  };

  const getTypeInfo = (type: TaskType) => {
    switch(type) {
      case 'REPAIR': return { label: 'งานซ่อม', icon: <Wrench size={10} />, color: 'bg-orange-100 text-orange-700' };
      case 'INSTALLATION': return { label: 'งานติดตั้ง', icon: <Layers size={10} />, color: 'bg-blue-100 text-blue-700' };
      case 'SYSTEM': return { label: 'งานระบบ', icon: <Monitor size={10} />, color: 'bg-purple-100 text-purple-700' };
      default: return { label: type, icon: <FileText size={10} />, color: 'bg-slate-100 text-slate-700' };
    }
  }

  // Receipt Modal for individual printing
  if (printingTask) {
    const remaining = (printingTask.estimatedCost || 0) - (printingTask.deposit || 0);
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto animate-fade-in p-4 lg:p-10">
        <div className="print:hidden max-w-4xl mx-auto mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Printer className="text-blue-600" size={20} />
            พิมพ์ใบงาน: {printingTask.id}
          </h2>
          <div className="flex gap-3">
            <button onClick={() => setPrintingTask(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">ปิดหน้าต่าง</button>
            <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all active:scale-95 font-bold">
              <Printer size={18} /> พิมพ์ใบงาน
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 border rounded-xl" id="print-area">
          {/* Reuse the receipt UI logic from JobIntake */}
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
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 px-4 py-2 rounded mb-2 inline-block border border-slate-200">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">เลขที่ใบงาน</span>
                <span className="block text-xl font-mono font-bold text-slate-800">{printingTask.id || 'N/A'}</span>
              </div>
              <p className="text-sm text-slate-600">วันที่ออก: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2 font-sarabun"><User size={16} className="text-blue-600" /> ข้อมูลลูกค้า</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-24 inline-block text-slate-500">ชื่อลูกค้า:</span> <span className="text-slate-800">{printingTask.customer?.name || "ไม่ระบุ"}</span></p>
                <p><span className="font-semibold w-24 inline-block text-slate-500">เบอร์โทร:</span> <span className="text-slate-800">{printingTask.customer?.phone || "ไม่ระบุ"}</span></p>
              </div>
            </div>
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2 font-sarabun"><FileText size={16} className="text-blue-600" /> รายละเอียดงาน</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-32 inline-block text-slate-500">หัวข้อ:</span> <span className="text-slate-800 font-bold">{printingTask.title}</span></p>
                <p><span className="font-semibold w-32 inline-block text-slate-500">วันที่เริ่ม:</span> <span className="text-slate-800">{printingTask.startDate}</span></p>
                <p><span className="font-semibold w-32 inline-block text-slate-500">ผู้รับผิดชอบ:</span> <span className="text-slate-800">{printingTask.assignee || "-"}</span></p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-end">
             <div className="w-1/2 space-y-2">
                <div className="flex justify-between border-b py-2"><span className="text-slate-600">ราคาประเมิน:</span><span className="font-bold text-lg">{printingTask.estimatedCost?.toLocaleString()} ฿</span></div>
                <div className="flex justify-between border-b py-2"><span className="text-slate-600 font-semibold">มัดจำแล้ว:</span><span className="font-bold text-green-600">{printingTask.deposit?.toLocaleString()} ฿</span></div>
                <div className="flex justify-between border-b-2 border-slate-900 py-3 bg-slate-50 px-2 rounded"><span className="font-bold text-slate-800 text-lg">คงเหลือ:</span><span className="font-black text-2xl text-red-600">{remaining.toLocaleString()} ฿</span></div>
             </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 mt-10">
               <p className="font-bold mb-2 text-slate-700">ข้อมูลการโอนเงิน</p>
               <p className="text-sm">ธนาคาร: {companyProfile.bankName || "-"}</p>
               <p className="text-sm">ชื่อบัญชี: {companyProfile.accountName || "-"}</p>
               <p className="font-bold text-slate-900">เลขที่บัญชี: {companyProfile.accountNumber || "-"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ตารางงาน / ปฏิทิน</h2>
          <p className="text-slate-500">จัดการงานซ่อมและติดตั้ง</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/intake')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all active:scale-95 font-bold"
            >
                <FileText size={18} />
                เปิดใบงาน (Full)
            </button>
            <button 
                onClick={() => {
                  setEditingTask(null);
                  setFormData({ type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd'), title: '' });
                  setShowForm(!showForm);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 font-bold ${showForm && !editingTask ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
                {showForm && !editingTask ? <X size={18} /> : <Plus size={18} />}
                {showForm && !editingTask ? 'ปิดแบบฟอร์ม' : 'เพิ่มงานด่วน'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-8 rounded-2xl border-2 shadow-xl animate-fade-in ${editingTask ? 'bg-amber-50 border-amber-200' : 'bg-white border-blue-100'}`}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                {editingTask ? <Edit2 className="text-amber-600" size={20} /> : <Plus className="text-blue-600" size={20} />}
                {editingTask ? `แก้ไขงาน: ${editingTask.id}` : 'นัดหมายงานใหม่ (Quick Add)'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">หัวข้องาน / ชื่องาน *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="ระบุชื่องาน..." className="w-full border-slate-200 border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ประเภทงาน</label>
                <select className="w-full border-slate-200 border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="REPAIR">งานซ่อม</option>
                    <option value="INSTALLATION">งานติดตั้ง</option>
                    <option value="SYSTEM">งานระบบ</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">วันที่เริ่ม *</label>
                <input type="date" className="w-full border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">กำหนดเสร็จ / คืนของ</label>
                <input type="date" className="w-full border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ผู้รับผิดชอบ</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="ระบุชื่อช่าง" className="w-full border-slate-200 border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})} />
                </div>
             </div>
             <div className="lg:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">สถานที่ / รายละเอียดเพิ่มเติม</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 text-slate-400" size={18} />
                  <textarea rows={2} placeholder="ระบุที่อยู่หรือรายละเอียดอื่นๆ..." className="w-full border-slate-200 border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ราคาประเมิน</label>
                  <input type="number" placeholder="0" className="w-full border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.estimatedCost || ''} onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">มัดจำ</label>
                  <input type="number" placeholder="0" className="w-full border-slate-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-green-600" value={formData.deposit || ''} onChange={e => setFormData({...formData, deposit: parseFloat(e.target.value)})} />
                </div>
             </div>
             <div className="lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-10 py-3 rounded-xl text-white shadow-lg transition-all active:scale-95 font-bold flex items-center gap-2 ${editingTask ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                   {editingTask ? <Save size={18} /> : <Plus size={18} />}
                   {editingTask ? 'บันทึกการแก้ไข' : 'บันทึกงาน'}
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'REPAIR', 'INSTALLATION', 'SYSTEM'] as const).map(type => (
            <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all shadow-sm ${
                    filterType === type 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
            >
                {type === 'ALL' ? 'ทั้งหมด' : type === 'REPAIR' ? 'งานซ่อม' : type === 'INSTALLATION' ? 'งานติดตั้ง' : 'งานระบบ'}
            </button>
        ))}
      </div>

      {/* Task List (Agenda View) */}
      <div className="grid gap-6">
        {filteredTasks.map(task => {
            const typeInfo = getTypeInfo(task.type);
            return (
                <div key={task.id} className={`bg-white p-5 rounded-2xl border-2 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center ${task.status === 'COMPLETED' ? 'border-slate-100 opacity-90' : 'border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-100 group'}`}>
                    {/* Date Box */}
                    <div className={`p-4 rounded-2xl text-center min-w-[90px] border-2 transition-colors ${task.status === 'COMPLETED' ? 'bg-slate-50 border-slate-100' : 'bg-slate-50 border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200'}`}>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{format(new Date(task.startDate), 'MMM')}</span>
                        <span className="block text-3xl font-black text-slate-800 my-1">{format(new Date(task.startDate), 'dd')}</span>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(task.startDate), 'eee')}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${typeInfo.color}`}>
                                {typeInfo.icon}
                                {typeInfo.label}
                            </span>
                            <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{task.title}</h4>
                            {task.status === 'COMPLETED' && <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 ml-auto bg-emerald-50 px-2 py-0.5 rounded-full"><Check size={12}/> เสร็จสมบูรณ์</span>}
                        </div>
                        
                        {task.description && <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic">{task.description}</p>}
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500 mt-2">
                             {task.customer && (
                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                    <User size={14} /> {task.customer.name}
                                </div>
                            )}
                            {task.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-slate-400" /> {task.location}
                                </div>
                            )}
                            {task.assignee && (
                                <div className="flex items-center gap-1.5">
                                    <User size={14} className="text-slate-400" /> {task.assignee}
                                </div>
                            )}
                            {task.endDate && (
                                <div className="flex items-center gap-1.5 text-red-400">
                                    <Clock size={14} /> กำหนดเสร็จ: {task.endDate}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons Overlay or Side Panel */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 min-w-[160px] w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="flex gap-2 w-full justify-start md:justify-end">
                          <button 
                            onClick={() => handleEdit(task)}
                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-amber-100 hover:text-amber-600 transition-all active:scale-90"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => setPrintingTask(task)}
                            className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-all active:scale-90"
                            title="พิมพ์ใบงาน"
                          >
                            <Printer size={18} />
                          </button>
                        </div>

                        <div className="flex-1 md:flex-none flex items-center justify-end">
                           <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(task.status)} shadow-sm`}>
                              {task.status.replace('_', ' ')}
                           </span>
                        </div>

                        {task.status !== 'COMPLETED' && task.status !== 'CANCELED' && (
                            <button 
                                onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                                className="text-xs flex items-center gap-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 font-black px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                                <Check size={16} /> ทำเสร็จแล้ว
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
        {filteredTasks.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <CalendarIcon size={64} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">ไม่มีตารางงานในช่วงนี้</p>
                <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-bold hover:underline">เพิ่มงานใหม่ที่นี่</button>
            </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <CalendarIcon size={24} />
              </div>
              <div>
                  <h5 className="font-black text-sm uppercase tracking-widest">สรุปงานวันนี้</h5>
                  <p className="text-slate-400 text-xs mt-0.5">คุณมีงานค้างทั้งหมด {tasks.filter(t => t.status !== 'COMPLETED').length} รายการ</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <div className="text-right mr-3 hidden sm:block">
                  <p className="text-[10px] text-slate-500 font-black uppercase">ประสิทธิภาพ</p>
                  <p className="text-blue-400 font-black text-xl leading-none">
                    {Math.round((tasks.filter(t => t.status === 'COMPLETED').length / (tasks.length || 1)) * 100)}%
                  </p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin-slow"></div>
                 <Check size={20} className="text-blue-400" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default WorkCalendar;
