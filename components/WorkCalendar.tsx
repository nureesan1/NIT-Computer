import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskType, TaskStatus } from '../types';
import { Plus, Check, Clock, MapPin, User, Calendar as CalendarIcon, Wrench, Monitor, FileText } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const WorkCalendar = () => {
  const { tasks, addTask, updateTaskStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'REPAIR' | 'INSTALLATION'>('ALL');
  const navigate = useNavigate();

  // New Task Form
  const [formData, setFormData] = useState<Partial<Task>>({
    type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.startDate) {
      addTask(formData as Omit<Task, 'id'>);
      setShowForm(false);
      setFormData({ type: 'REPAIR', status: 'PENDING', startDate: format(new Date(), 'yyyy-MM-dd'), title: '' });
    }
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
            >
                <FileText size={18} />
                เปิดใบงาน (Full)
            </button>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
                <Plus size={18} />
                เพิ่มงานด่วน
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
           <h3 className="font-bold text-lg mb-4 text-slate-800">นัดหมายงานใหม่ (Quick Add)</h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-slate-600 mb-1">ชื่องาน</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">ประเภทงาน</label>
                <select className="w-full border p-2 rounded bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="REPAIR">งานซ่อม</option>
                    <option value="INSTALLATION">งานติดตั้ง</option>
                </select>
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">วันที่เริ่ม</label>
                <input type="date" className="w-full border p-2 rounded" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">วันที่สิ้นสุด/คืนของ</label>
                <input type="date" className="w-full border p-2 rounded" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">สถานที่ (สำหรับติดตั้ง)</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">ผู้รับผิดชอบ</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})} />
             </div>
             <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">บันทึก</button>
             </div>
           </form>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2">
        {(['ALL', 'REPAIR', 'INSTALLATION'] as const).map(type => (
            <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    filterType === type 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
            >
                {type === 'ALL' ? 'ทั้งหมด' : type === 'REPAIR' ? 'งานซ่อม' : 'งานติดตั้ง'}
            </button>
        ))}
      </div>

      {/* Task List (Agenda View) */}
      <div className="grid gap-4">
        {filteredTasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Date Box */}
                <div className="bg-slate-50 p-3 rounded-lg text-center min-w-[80px] border border-slate-100">
                    <span className="block text-xs text-slate-500">{format(parseISO(task.startDate), 'MMM')}</span>
                    <span className="block text-xl font-bold text-slate-800">{format(parseISO(task.startDate), 'dd')}</span>
                    <span className="block text-xs text-slate-400">{format(parseISO(task.startDate), 'eee')}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${task.type === 'REPAIR' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                            {task.type === 'REPAIR' ? <Wrench size={10} /> : <Monitor size={10} />}
                            {task.type}
                        </span>
                        <h4 className="font-bold text-slate-800">{task.title}</h4>
                    </div>
                    
                    {task.description && <p className="text-sm text-slate-600 mt-1 line-clamp-1">{task.description}</p>}
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                         {task.customer && (
                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                                <User size={14} /> {task.customer.name}
                            </div>
                        )}
                        {task.location && (
                            <div className="flex items-center gap-1">
                                <MapPin size={14} /> {task.location}
                            </div>
                        )}
                        {task.assignee && (
                            <div className="flex items-center gap-1">
                                <User size={14} /> {task.assignee}
                            </div>
                        )}
                        {task.endDate && (
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock size={14} /> ถึง {task.endDate}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                    </span>
                    {task.status !== 'COMPLETED' && task.status !== 'CANCELED' && (
                        <button 
                            onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                            className="text-xs flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                        >
                            <Check size={14} /> Mark Complete
                        </button>
                    )}
                </div>
            </div>
        ))}
        {filteredTasks.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">ไม่มีตารางงานในช่วงนี้</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WorkCalendar;