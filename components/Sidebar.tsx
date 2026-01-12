
import React from 'react';
import { UserProfile } from '../types';
import { triggerHaptic } from '../services/hapticService';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  isConnected?: boolean;
  onLogout: () => void;
  user: UserProfile;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isConnected, onLogout, user, t }) => {
  const navItems = [
    { id: 'dashboard', label: t.home, icon: 'fa-house' },
    { id: 'inventory', label: t.items, icon: 'fa-list' },
    { id: 'add', label: t.add, icon: 'fa-plus' },
    { id: 'insights', label: t.stats, icon: 'fa-chart-simple' },
    { id: 'assistant', label: t.tips, icon: 'fa-bolt' },
    { id: 'settings', label: t.settings, icon: 'fa-gear' },
  ];

  const handleNav = (id: string) => {
    triggerHaptic('light');
    onNavigate(id);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 sidebar-modern border-r border-slate-200 dark:border-slate-800 lg:flex flex-col z-50 transition-colors">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <i className="fa-solid fa-shield text-sm"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">VIGILANT</h1>
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black opacity-60">Expiry Manager</p>
        </div>

        <nav className="flex-1 px-5 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all btn-press ${
                currentPage === item.id 
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-sm`}></i>
              <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs">
                {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-900 dark:text-slate-200 truncate uppercase tracking-tight">{user.displayName || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isConnected ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { triggerHaptic('medium'); onLogout(); }}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all btn-press text-[10px] font-black uppercase tracking-widest"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 lg:hidden flex justify-around p-3 z-50">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-all btn-press ${
              currentPage === item.id ? 'text-indigo-600' : 'text-slate-300 dark:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg`}></i>
            <span className="text-[8px] font-bold uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
