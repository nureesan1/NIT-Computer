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
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30 transform rotate-3">
             <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">NIT Computer</h1>
          <p className="text-slate-500 text-sm">Enterprise Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password (รหัสผ่าน)</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="กรุณากรอกรหัสผ่าน..."
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded flex items-center gap-1">{error}</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 group"
          >
            เข้าสู่ระบบ (Login)
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-500">Restricted Access</p>
          <p className="mt-1">© NIT Computer Solution LTD.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;