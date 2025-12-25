import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getApiUrl } from '../services/sheetsService';
import { Save, Database, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

const Settings = () => {
  const { configDatabase, isDbConnected, isLoading } = useApp();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
    setUrl(getApiUrl());
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SAVING');
    const success = await configDatabase(url);
    if (success) {
      setStatus('SUCCESS');
    } else {
      setStatus('ERROR');
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus('IDLE');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-slate-800 rounded-lg text-white">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ (Settings)</h2>
          <p className="text-slate-500">เชื่อมต่อฐานข้อมูล Google Sheets</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">การเชื่อมต่อ Database</h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Google Apps Script Web App URL
            </label>
            <div className="relative">
               <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full border-slate-300 rounded-lg p-3 pl-4 focus:ring-2 focus:ring-blue-500 outline-none border font-mono text-sm"
                />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              * วาง URL ที่ได้จากการ Deploy Web App ใน Google Apps Script
            </p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isDbConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <span className="text-sm font-medium text-slate-700">
                  Status: {isDbConnected ? 'Connected (เชื่อมต่อแล้ว)' : 'Disconnected (ใช้ข้อมูลจำลอง)'}
               </span>
            </div>
            <button 
                type="submit" 
                disabled={status === 'SAVING' || isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-md
                  ${status === 'SUCCESS' ? 'bg-green-600 hover:bg-green-700' : 
                    status === 'ERROR' ? 'bg-red-600 hover:bg-red-700' : 
                    'bg-blue-600 hover:bg-blue-700'}
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
            >
                {status === 'SAVING' || isLoading ? (
                    'Connecting...'
                ) : status === 'SUCCESS' ? (
                    <><CheckCircle size={18} /> Saved & Connected</>
                ) : status === 'ERROR' ? (
                    <><AlertCircle size={18} /> Connection Failed</>
                ) : (
                    <><Save size={18} /> Save Configuration</>
                )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900">
         <h4 className="font-bold flex items-center gap-2 mb-3">
            <HelpCircle size={18} /> วิธีการติดตั้ง (Setup Guide)
         </h4>
         <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li>สร้าง Google Sheet ใหม่</li>
            <li>ไปที่เมนู <strong>Extensions {'>'} Apps Script</strong></li>
            <li>คัดลอกโค้ดจากไฟล์ <code>backend/code.js</code> ไปวางแทนที่โค้ดเดิม</li>
            <li>กดปุ่ม <strong>Deploy</strong> {'>'} <strong>New deployment</strong></li>
            <li>เลือก type เป็น <strong>Web app</strong></li>
            <li>ตั้งค่า <strong>Who has access</strong> เป็น <strong>Anyone</strong> (สำคัญ!)</li>
            <li>กด Deploy และคัดลอก <strong>Web App URL</strong> มาวางในช่องข้างบน</li>
         </ol>
      </div>
    </div>
  );
};

export default Settings;