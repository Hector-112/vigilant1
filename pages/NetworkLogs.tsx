
import React, { useState, useEffect } from 'react';
import { UserProfile, NotificationLog } from '../types';
import { notificationService } from '../services/notificationService';
import { dataService } from '../services/dataService';

interface NetworkLogsProps {
  currentUser: UserProfile;
}

const NetworkLogs: React.FC<NetworkLogsProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadNetworkData = async () => {
      const globalLogs = notificationService.getLogs(currentUser.uid);
      setLogs(globalLogs);
      const directory = await dataService.getGlobalUserDirectory();
      setUsers(directory);
    };
    
    loadNetworkData();
  }, [currentUser.uid]);

  const filteredLogs = logs.filter(log => 
    log.recipient.toLowerCase().includes(filter.toLowerCase()) ||
    log.productName.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'Failed': return 'bg-rose-500 text-white shadow-rose-200';
      default: return 'bg-slate-400 text-white shadow-slate-100';
    }
  };

  return (
    <div className="space-y-12 pb-24 lg:pb-8 page-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Network Audit</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Verified Global SMS Node Directory</p>
        </div>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
          <input 
            type="text" 
            placeholder="Search Network..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>
      </header>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-users text-indigo-500"></i>
          Verified Recipients ({users.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {users.map((u, i) => (
            <div key={i} className="modern-card p-6 rounded-[30px] flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black mb-4 transition-transform group-hover:scale-110 shadow-lg shadow-slate-200">
                {u.displayName?.charAt(0) || u.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate w-full">{u.displayName || 'Anon Operative'}</p>
              <p className="text-[8px] font-bold text-slate-400 truncate w-full mt-1">{u.phoneNumber || 'No Number'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-satellite-dish text-indigo-500"></i>
          SMS Broadcast History
        </h3>
        <div className="modern-card rounded-[40px] overflow-hidden border border-slate-100 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Target Phone</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Item</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-600 tracking-tight">{log.recipient}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.productName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NetworkLogs;
