
import React, { useState, useEffect } from 'react';
import { Product, Statistics, NotificationLog, UserProfile } from '../types';
import { triggerHaptic } from '../services/hapticService';

interface DashboardProps {
  products: Product[];
  stats: Statistics;
  onNavigate: (page: any) => void;
  logs: NotificationLog[];
  onSweep: () => void;
  user: UserProfile;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ products, stats, onNavigate, logs, onSweep, user, t }) => {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleAlertEvent = (e: any) => {
      setToast(`${e.detail.count} Alert(s) Dispatched`);
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('vigilant-alert-sent', handleAlertEvent);
    return () => window.removeEventListener('vigilant-alert-sent', handleAlertEvent);
  }, []);

  const getDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr + 'T00:00:00');
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiringSoon = products
    .filter(p => {
      const days = getDaysLeft(p.expiryDate);
      return days >= 0 && days <= 3;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-12 pb-24 lg:pb-0 page-fade-in relative transition-colors">
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t.dashboard}</h2>
        </div>
        <button 
          onClick={() => { triggerHaptic('medium'); onNavigate('add'); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 btn-press"
        >
          {t.addNew}
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: t.inventory, value: stats.total, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
          { label: t.fresh, value: stats.fresh, color: 'text-emerald-600', bg: 'bg-emerald-50/20 dark:bg-emerald-500/10' },
          { label: t.warning, value: stats.soon, color: 'text-amber-600', bg: 'bg-amber-50/20 dark:bg-amber-500/10' },
          { label: t.expired, value: stats.expired, color: 'text-rose-600', bg: 'bg-rose-50/20 dark:bg-rose-500/10' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-slate-900 ${stat.bg}`}>
            <div className={`text-4xl font-black mb-1 tracking-tighter ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl space-y-10">
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringSoon.length > 0 ? expiringSoon.map(product => {
              const daysLeft = getDaysLeft(product.expiryDate);
              return (
                <div key={product.id} className="modern-card p-6 rounded-[30px] flex items-center justify-between group dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-slate-100 text-lg font-black transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{product.name}</h4>
                      <p className={`text-[9px] font-bold uppercase tracking-tighter ${daysLeft <= 1 ? 'text-rose-600' : 'text-slate-400 dark:text-slate-500'}`}>
                        {daysLeft === 0 ? 'Expires Today' : daysLeft < 0 ? 'Expired' : `${daysLeft} Days Left`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 rounded-[40px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 border-dashed flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest">All items are currently fresh</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
