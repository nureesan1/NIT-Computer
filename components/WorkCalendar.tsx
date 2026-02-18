
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, TaskStatus } from '../types';
import { 
  Plus, Check, Clock, MapPin, User, Calendar as CalendarIcon, 
  Wrench, Monitor, FileText, Layers, Edit2, Printer, X, Save, Trash2, Tag, 
  ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle
} from 'lucide-react';
// Fix: Removed missing exports (startOfMonth, startOfWeek, subMonths) and added addDays to help with manual logic
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  addDays,
  isToday
} from 'date-fns';
import { th } from 'date-fns/locale/th';
import { useNavigate } from 'react-router-dom';

const WorkCalendar = () => {
  const { tasks, addTask, updateTask, updateTaskStatus, deleteTask, companyProfile } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [printingTask, setPrintingTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Calendar Logic
  // Fix: Manual calculation of startOfMonth since the date-fns export was reported missing
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  // Fix: Manual calculation of startOfWeek (Sunday) using addDays and getDay
  const startDate = addDays(monthStart, -monthStart.getDay());
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  // Fix: Use addMonths(..., -1) instead of missing subMonths
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

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
  };

  const getStatusColor = (status: TaskStatus) => {
    switch(status) {
        case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CANCELED': return 'bg-slate-100 text-slate-500 border-slate-200';
        default: return 'bg-slate-100';
    }
  };

  const getTypeColor = (type: TaskType) => {
    switch(type) {
      case 'REPAIR': return 'bg-orange-500';
      case 'INSTALLATION': return 'bg-blue-600';
      case 'SYSTEM': return 'bg-purple-600';
      default: return 'bg-slate-500';
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ตารางงานปฏิทิน</h2>
          <p className="text-slate-500 font-medium">จัดการงานซ่อมและติดตั้งรายวัน</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/intake')}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 font-black text-sm"
            >
                <FileText size={18} />
                เปิดใบงานแบบละเอียด
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
                {showForm && !editingTask ? 'ปิด' : 'เพิ่มงานด่วน'}
            </button>
        </div>
      </div>

      {/* Quick Form */}
      {showForm && (
        <div className={`p-8 rounded-3xl border-2 shadow-2xl animate-fade-in relative transition-all duration-300 mb-6 ${editingTask ? 'bg-amber-50/50 border-amber-200 shadow-amber-900/10' : 'bg-white border-blue-100 shadow-slate-900/5'}`}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg flex items-center gap-3">
                {editingTask ? <Edit2 className="text-amber-600" size={20} /> : <Plus className="text-blue-600" size={20} />}
                {editingTask ? `แก้ไขใบงาน: ${editingTask.id}` : 'เพิ่มงานใหม่ด่วน'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">หัวข้องาน *</label>
                <input type="text" placeholder="ระบุชื่องาน..." className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทงาน</label>
                <select className="w-full border-slate-200 border-2 p-3.5 rounded-2xl bg-white focus:border-blue-500 outline-none transition-all font-bold cursor-pointer" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="REPAIR">งานซ่อม</option>
                    <option value="INSTALLATION">งานติดตั้ง</option>
                    <option value="SYSTEM">งานระบบ</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่เริ่ม *</label>
                <input type="date" className="w-full border-slate-200 border-2 p-3.5 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
             </div>
             <div className="lg:col-span-2 flex justify-end items-center gap-4 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditingTask(null); }} className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">ยกเลิก</button>
                <button type="submit" className={`px-10 py-3 rounded-2xl text-white shadow-xl transition-all active:scale-95 font-black text-sm flex items-center gap-2 ${editingTask ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                   <Save size={18} /> {editingTask ? 'บันทึกแก้ไข' : 'บันทึกงาน'}
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Calendar Control */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-3 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><ChevronLeft size={24} /></button>
              <div className="flex flex-col items-center min-w-[180px]">
                  <span className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                    {format(currentDate, 'MMMM yyyy', { locale: th })}
                  </span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Monthly Agenda</span>
              </div>
              <button onClick={nextMonth} className="p-3 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><ChevronRight size={24} /></button>
          </div>
          <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span> ซ่อม
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> ติดตั้ง
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <span className="w-3 h-3 rounded-full bg-purple-600"></span> ระบบ
              </div>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden animate-fade-in">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day, idx) => (
            <div key={idx} className={`py-4 text-center text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px] sm:auto-rows-[160px]">
          {calendarDays.map((day, dayIdx) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.startDate), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={dayIdx} 
                className={`border-r border-b border-slate-100 p-2 relative group transition-colors ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-blue-50/20'}`}
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-1">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                    isTodayDate 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                    : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <button 
                      onClick={() => {
                        setFormData({ ...formData, startDate: format(day, 'yyyy-MM-dd') });
                        setShowForm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                {/* Tasks pills */}
                <div className="space-y-1 overflow-y-auto max-h-[80px] sm:max-h-[120px] custom-scrollbar">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => handleEdit(task)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white cursor-pointer truncate hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm ${getTypeColor(task.type)} ${task.status === 'COMPLETED' ? 'opacity-40' : ''}`}
                      title={task.title}
                    >
                      {task.status === 'COMPLETED' ? <CheckCircle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between border-4 border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl">
                  <CalendarIcon size={28} />
              </div>
              <div>
                  <h5 className="font-black text-base uppercase tracking-widest text-blue-400">สถานะปฏิทิน</h5>
                  <p className="text-slate-400 text-sm font-bold">
                    เดือนนี้มีงานทั้งหมด <span className="text-white text-lg">{tasks.filter(t => isSameMonth(new Date(t.startDate), currentDate)).length}</span> รายการ
                  </p>
              </div>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
              <div className="px-6 py-3 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">รอดำเนินการ</p>
                  <p className="text-xl font-black text-amber-500">{tasks.filter(t => t.status === 'PENDING').length}</p>
              </div>
              <div className="px-6 py-3 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">เสร็จสิ้นแล้ว</p>
                  <p className="text-xl font-black text-emerald-500">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default WorkCalendar;
