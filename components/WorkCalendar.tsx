
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, TaskStatus } from '../types';
import { 
  Plus, Check, Clock, MapPin, User, Calendar as CalendarIcon, 
  Wrench, Monitor, FileText, Layers, Edit2, Printer, X, Save, Wallet, Trash2, Tag, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale/th';
import { useNavigate } from 'react-router-dom';

const WorkCalendar = () => {
  const { tasks, addTask, updateTask, updateTaskStatus, deleteTask, companyProfile } = useApp();
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
        updateTask(editingTask.id, formData);
        setEditingTask(null);
      } else {
        addTask(formData as Omit<Task, 'id'>);
      }
      setShowForm(false);
      setFormData({ type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd'), title: '', brand: '', model: '' });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({ ...task });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?')) {
      deleteTask(id);
    }
  };

  const filteredTasks = tasks.filter(t => filterType === 'ALL' ? true : t.type === filterType)
    .sort((a, b) => {
      // Priority for sorting: Pending/In Progress first, then Completed, then Canceled
      const statusPriority: Record<TaskStatus, number> = {
        'PENDING': 0,
        'IN_PROGRESS': 0,
        'COMPLETED': 1,
        'CANCELED': 2
      };

      const pA = statusPriority[a.status] ?? 0;
      const pB = statusPriority[b.status] ?? 0;

      if (pA !== pB) {
        return pA - pB;
      }

      // Within same status group, sort by start date
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

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
      case 'REPAIR': return { label: 'งานซ่อม', icon: <Wrench size={12} />, color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'INSTALLATION': return { label: 'งานติดตั้ง', icon: <Layers size={12} />, color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'SYSTEM': return { label: 'งานระบบ', icon: <Monitor size={12} />, color: 'bg-purple-100 text-purple-700 border-purple-200' };
      default: return { label: type, icon: <FileText size={12} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
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
            <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all active:scale-95 font-bold">
              <Printer size={18} /> พิมพ์ใบงาน
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-8 border rounded-xl" id="print-area">
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
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2"><User size={16} className="text-blue-600" /> ข้อมูลลูกค้า</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-24 inline-block text-slate-500">ชื่อลูกค้า:</span> <span className="text-slate-800">{printingTask.customer?.name || "ไม่ระบุ"}</span></p>
                <p><span className="font-semibold w-24 inline-block text-slate-500">เบอร์โทร:</span> <span className="text-slate-800">{printingTask.customer?.phone || "ไม่ระบุ"}</span></p>
              </div>
            </div>
            <div className="border p-4 rounded-lg bg-slate-50">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-600" /> รายละเอียดงาน</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold w-32 inline-block text-slate-500">หัวข้อ:</span> <span className="text-slate-800 font-bold">{printingTask.title}</span></p>
                {(printingTask.brand || printingTask.model) && (
                    <p><span className="font-semibold w-32 inline-block text-slate-500">อุปกรณ์:</span> <span className="text-slate-800">{printingTask.brand} {printingTask.model}</span></p>
                )}
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ตารางงาน / ปฏิทิน</h2>
          <p className="text-slate-500 font-medium">จัดการงานซ่อมและติดตั้ง</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/intake')}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 font-black text-sm"
            >
                <FileText size={18} />
                เปิดใบงาน (Full)
            </button>
            <button 
                onClick={() => {
                  setEditingTask(null);
                  setFormData({ type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd'), title: '', brand: '', model: '' });
                  setShowForm(!showForm);
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-xl transition-all active:scale-95 font-black text-sm ${showForm && !editingTask ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
            >
                {showForm && !editingTask ? <X size={18} /> : <Plus size={18} />}
                {showForm && !editingTask ? 'ปิดแบบฟอร์ม' : 'เพิ่มงานด่วน'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className={`p-8 rounded-3xl border-2 shadow-2xl animate-fade-in relative transition-all duration-300 ${editingTask ? 'bg-yellow-50/50 border-yellow-200 shadow-yellow-900/10' : 'bg-white border-blue-100 shadow-slate-900/5'}`}>
           <div className="flex justify-between items-center mb-8">
              <div className={`px-5 py-2.5 rounded-2xl border-2 flex items-center gap-3 ${editingTask ? 'bg-white border-yellow-400 text-slate-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                {editingTask ? <Edit2 className="text-yellow-600" size={20} /> : <Plus className="text-blue-600" size={20} />}
                <h3 className="font-black text-lg">
                  {editingTask ? `แก้ไขใบงาน: ${editingTask.id}` : 'เปิดใบงานใหม่ (Quick Add)'}
                </h3>
              </div>
              <button onClick={() => { setShowForm(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-colors">
                <X size={28} />
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">หัวข้องาน / ชื่องาน *</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={20} />
                  <input type="text" placeholder="ระบุชื่องาน..." className="w-full border-slate-200 border-2 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ประเภทงาน</label>
                <select className="w-full border-slate-200 border-2 p-4 rounded-2xl bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="REPAIR">งานซ่อม</option>
                    <option value="INSTALLATION">งานติดตั้ง</option>
                    <option value="SYSTEM">งานระบบ</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ยี่ห้อ (Brand)</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                  <input type="text" placeholder="เช่น Dell, ASUS" className="w-full border-slate-200 border-2 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">รุ่น (Model)</label>
                <div className="relative group">
                  <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                  <input type="text" placeholder="เช่น Inspiron, Zenbook" className="w-full border-slate-200 border-2 p-4 pl-12 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">วันที่เริ่ม *</label>
                <input type="date" className="w-full border-slate-200 border-2 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
             </div>
             <div className="lg:col-span-3 flex justify-end items-center gap-6 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors text-lg">
                  ยกเลิก
                </button>
                <button type="submit" className={`px-12 py-4 rounded-2xl text-white shadow-xl transition-all active:scale-95 font-black text-lg flex items-center gap-3 ${editingTask ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/20'}`}>
                   {editingTask ? <Save size={22} /> : <Plus size={22} />}
                   {editingTask ? 'บันทึกการแก้ไข' : 'บันทึกเปิดงาน'}
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2.5 flex-wrap">
        {(['ALL', 'REPAIR', 'INSTALLATION', 'SYSTEM'] as const).map(type => (
            <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black border-2 transition-all shadow-sm tracking-wider uppercase ${
                    filterType === type 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
            >
                {type === 'ALL' ? 'ทั้งหมด' : type === 'REPAIR' ? 'งานซ่อม' : type === 'INSTALLATION' ? 'งานติดตั้ง' : 'งานระบบ'}
            </button>
        ))}
      </div>

      {/* Task List (Agenda View) */}
      <div className="space-y-6">
        {filteredTasks.map(task => {
            const typeInfo = getTypeInfo(task.type);
            const isCompleted = task.status === 'COMPLETED';
            return (
                <div key={task.id} className={`bg-white p-6 rounded-[2rem] border-2 transition-all flex flex-col md:flex-row gap-8 items-start md:items-center relative ${isCompleted ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-slate-50 shadow-sm'} hover:shadow-xl group overflow-hidden bg-white`}>
                    
                    {/* Date Box */}
                    <div className={`p-4 rounded-3xl text-center min-w-[100px] border-2 transition-all ${isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(task.startDate), 'MMM')}</span>
                        <span className="block text-4xl font-black text-slate-800 my-1">{format(new Date(task.startDate), 'dd')}</span>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(new Date(task.startDate), 'eee', { locale: th })}</span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border-2 ${typeInfo.color}`}>
                                {typeInfo.icon}
                                {typeInfo.label}
                            </span>
                            <h4 className="font-black text-slate-800 text-2xl group-hover:text-blue-600 transition-colors leading-tight">
                                {task.title} {task.brand || task.model ? `- ${task.brand} ${task.model}` : ''}
                            </h4>
                            
                            {/* Customer Tag moved to header row */}
                            {task.customer && (
                                <div className="flex items-center gap-2 text-blue-700 bg-blue-100/50 px-4 py-2 rounded-2xl border border-blue-100 text-xs font-black">
                                    <User size={16} /> {task.customer.name}
                                </div>
                            )}

                            {isCompleted && (
                                <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 ml-auto">
                                    <CheckCircle size={14}/> เสร็จสมบูรณ์
                                </span>
                            )}
                        </div>

                        {/* Problem / Description */}
                        {task.description && (
                            <p className="text-sm text-slate-500 font-medium whitespace-pre-line border-l-4 border-slate-200 pl-4 leading-relaxed italic">
                                {task.description}
                            </p>
                        )}

                        {/* Meta Tags - Customer tag removed from here */}
                        <div className="flex flex-wrap gap-4 mt-6">
                            {task.location && (
                                <div className="flex items-center gap-2 text-slate-500 px-2 py-2 text-xs font-bold">
                                    <MapPin size={16} className="text-slate-400" /> {task.location}
                                </div>
                            )}
                            {task.assignee && (
                                <div className="flex items-center gap-2 text-slate-500 px-2 py-2 text-xs font-bold">
                                    <User size={16} className="text-slate-400" /> {task.assignee}
                                </div>
                            )}
                            {task.endDate && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 text-xs font-black">
                                    <Clock size={16} /> กำหนดเสร็จ: {task.endDate}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Side */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-6 min-w-[200px] w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                        <div className="flex gap-3 w-full justify-start md:justify-end">
                          <button onClick={() => handleEdit(task)} className="p-3 bg-white text-slate-400 rounded-full hover:bg-amber-50 hover:text-amber-500 transition-all border-2 border-slate-50 hover:border-amber-100"><Edit2 size={20} /></button>
                          <button onClick={() => setPrintingTask(task)} className="p-3 bg-white text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-all border-2 border-slate-50 hover:border-blue-100"><Printer size={20} /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-3 bg-white text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border-2 border-slate-50 hover:border-red-100"><Trash2 size={20} /></button>
                        </div>

                        <div className="flex-1 md:flex-none flex items-center justify-end">
                           <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${getStatusColor(task.status)} shadow-sm`}>
                              {task.status}
                           </span>
                        </div>

                        {!isCompleted && task.status !== 'CANCELED' && (
                            <button 
                                onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                                className="text-xs flex items-center justify-center gap-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 font-black px-8 py-3.5 rounded-[1.5rem] transition-all shadow-xl shadow-emerald-900/5 w-full uppercase tracking-widest border-2 border-emerald-100 hover:border-emerald-600"
                            >
                                <Check size={20} /> ทำเสร็จแล้ว
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
      
      {/* Footer Summary Card */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between border-4 border-slate-800 relative overflow-hidden group">
          <div className="flex items-center gap-8 relative z-10">
              <div className="p-5 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-600/30">
                  <CalendarIcon size={36} />
              </div>
              <div>
                  <h5 className="font-black text-lg uppercase tracking-[0.3em] text-blue-400 mb-1">สรุปงานวันนี้</h5>
                  <p className="text-slate-400 text-base font-bold">
                    คุณมีงานค้างทั้งหมด <span className="text-white text-xl">{tasks.filter(t => t.status !== 'COMPLETED').length}</span> รายการ
                  </p>
              </div>
          </div>
          
          <div className="flex items-center gap-10 mt-8 md:mt-0 relative z-10">
              <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">ประสิทธิภาพรวม</p>
                  <p className="text-white font-black text-5xl tracking-tighter">
                    {Math.round((tasks.filter(t => t.status === 'COMPLETED').length / (tasks.length || 1)) * 100)}%
                  </p>
              </div>
              <div className="w-20 h-20 rounded-full border-8 border-slate-800 flex items-center justify-center relative shadow-inner">
                 <div className="absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent animate-spin-slow"></div>
                 <CheckCircle size={32} className="text-blue-500" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default WorkCalendar;
