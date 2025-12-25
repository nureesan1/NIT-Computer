
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง (Incorrect password)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Box with blue border style matching sidebar header intent */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-500/20 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
             <User size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">NIT Consulting</h1>
          <h2 className="text-xl font-bold text-blue-600 mb-2">Solution LTD.</h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Enterprise Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Password (รหัสผ่าน)</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-lg"
                placeholder="กรุณากรอกรหัสผ่าน..."
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-3 font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2 animate-shake">
                <ArrowRight size={14} className="rotate-180" /> {error}
              </p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-4.5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            เข้าสู่ระบบ (Login)
            <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-slate-100 text-center relative z-10">
          <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-2">Restricted Access Area</p>
          <p className="text-xs text-slate-300">© 2025 NIT Consulting Solution LTD.</p>
        </div>
      </div>
      
      {/* Floating background elements */}
      <div className="fixed bottom-10 left-10 text-slate-800/20 font-black text-9xl -z-10 select-none">NIT</div>
      <div className="fixed top-10 right-10 text-slate-800/20 font-black text-9xl -z-10 select-none">ERP</div>
    </div>
  );
};

export default Login;