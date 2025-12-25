
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
  Settings
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
    { icon: <Settings size={20} />, label: 'ตั้งค่าระบบ', path: '/settings', allowed: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.allowed.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-100 print:bg-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on Print */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col print:hidden
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-400">NIT Computer</h1>
            <p className="text-xs text-slate-400">Enterprise Solution</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Database Status */}
        <div className="px-6 py-2">
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${isDbConnected ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                ) : isDbConnected ? (
                    <>
                        <Database size={14} />
                        <span>Connected to Sheets</span>
                    </>
                ) : (
                    <>
                        <CloudOff size={14} />
                        <span>Mock Data Mode</span>
                    </>
                )}
            </div>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <UserCircle size={24} />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-blue-300">{user.role}</p>
                </div>
             </div>
             <button 
               onClick={logout} 
               className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-lg transition-colors lg:hidden" 
               title="Logout"
             >
                <LogOut size={18} />
             </button>
          </div>
          
          <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Switch Role (Demo):</div>
          <select 
            value={user.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="w-full bg-slate-700 text-white text-sm rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.values(UserRole).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
        {/* Header - Hidden on Print */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 print:hidden">
          {/* Left Side: Menu Toggle (Mobile) + Date */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-blue-600 p-2"
            >
              <Menu size={24} />
            </button>
            <div className="text-slate-400 text-sm hidden sm:block font-medium">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Right Side: Logout Button with Text */}
          <div className="flex items-center">
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-all text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
              title="ออกจากระบบ"
            >
              <span className="hidden xs:inline">ออกจากระบบ</span>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 print:p-0 print:overflow-visible">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
