
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Wallet, 
  Package, 
  CalendarDays, 
  ClipboardList,
  Menu, 
  X,
  UserCircle,
  LogOut,
  Database,
  CloudOff,
  Settings,
  Building2,
  Calculator
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, switchRole, logout, isDbConnected, isLoading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'ภาพรวมระบบ', path: '/', allowed: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: <ClipboardList size={20} />, label: 'รับงานลูกค้า (Intake)', path: '/intake', allowed: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.MANAGER] },
    { icon: <CalendarDays size={20} />, label: 'ตารางงาน', path: '/calendar', allowed: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.MANAGER] },
    { icon: <Wallet size={20} />, label: 'การเงิน (รายรับ-จ่าย)', path: '/finance', allowed: [UserRole.ADMIN, UserRole.ACCOUNTING, UserRole.MANAGER] },
    { icon: <Package size={20} />, label: 'สต๊อกสินค้า', path: '/inventory', allowed: [UserRole.ADMIN, UserRole.STOCK, UserRole.MANAGER] },
    { icon: <Calculator size={20} />, label: 'คำนวณราคาขาย', path: '/calculator', allowed: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STOCK, UserRole.ACCOUNTING] },
    { icon: <Building2 size={20} />, label: 'โปรไฟล์บริษัท', path: '/company', allowed: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: <Settings size={20} />, label: 'ตั้งค่าระบบ', path: '/settings', allowed: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.allowed.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-100 print:bg-white text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col print:hidden
      `}>
        {/* Sidebar Header with Boxed Branding */}
        <div className="p-4 border-b border-slate-800 relative">
          <div className="p-4 border border-blue-500/30 rounded-xl bg-slate-800/50 shadow-inner">
            <h1 className="text-xl font-bold text-blue-400 leading-tight">NIT Consulting</h1>
            <p className="text-sm font-semibold text-blue-100 mt-1">Solution LTD.</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-3 font-medium">Enterprise Management</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Database Status */}
        <div className="px-4 py-3">
            <div className={`flex items-center gap-3 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all ${
              isDbConnected 
                ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
                {isLoading ? (
                    <span className="animate-pulse">Loading Database...</span>
                ) : isDbConnected ? (
                    <>
                        <Database size={16} className="text-emerald-500" />
                        <span>Connected to Sheets</span>
                    </>
                ) : (
                    <>
                        <CloudOff size={16} />
                        <span>Mock Data Mode</span>
                    </>
                )}
            </div>
        </div>

        {/* User Info & Role Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-1">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <UserCircle size={24} />
             </div>
             <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{user.role}</p>
             </div>
          </div>
          <div className="relative group">
            <select 
              value={user.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="w-full bg-slate-800 text-slate-300 text-xs rounded-lg p-2.5 outline-none border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Menu size={12} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 print:hidden shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">ยินดีต้อนรับ</span>
              <div className="text-slate-600 text-sm font-bold">
                {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-all text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 border border-slate-200 hover:border-red-200"
            >
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-10 print:p-0 print:overflow-visible bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
