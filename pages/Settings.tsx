
import React, { useState, useEffect } from 'react';
import { UserProfile, TransmissionConfig } from '../types';
import { notificationService } from '../services/notificationService';
import { triggerHaptic } from '../services/hapticService';

interface SettingsProps {
  user: UserProfile;
  onConfigChange: (config: TransmissionConfig) => void;
  t: any;
}

const Settings: React.FC<SettingsProps> = ({ user, onConfigChange, t }) => {
  const [config, setConfig] = useState<TransmissionConfig>({
    enabled: true,
    smsEnabled: true,
    theme: 'light',
    language: 'English'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setConfig(notificationService.getConfig(user.uid));
    };
    loadSettings();
  }, [user.uid]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic('heavy');
    notificationService.saveConfig(user.uid, config);
    onConfigChange(config); // Trigger global update
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Hindi'
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8 page-fade-in transition-colors">
      <header className="mb-12">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t.preferences}</h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">App Customization</p>
      </header>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <i className="fa-solid fa-palette"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t.theme}</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select your visual mode</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', label: t.light, icon: 'fa-sun' },
              { id: 'dark', label: t.dark, icon: 'fa-moon' },
              { id: 'system', label: t.system, icon: 'fa-desktop' }
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => { triggerHaptic('light'); setConfig(prev => ({ ...prev, theme: th.id as any })); }}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all btn-press ${
                  config.theme === th.id 
                    ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-indigo-950/40' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <i className={`fa-solid ${th.icon} text-lg`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest">{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <i className="fa-solid fa-globe"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t.language}</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select your primary dialect</p>
            </div>
          </div>
          
          <div className="relative">
            <select
              value={config.language}
              onChange={(e) => { triggerHaptic('light'); setConfig(prev => ({ ...prev, language: e.target.value })); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-slate-900 dark:text-slate-100 text-xs font-bold transition-all appearance-none cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 dark:text-slate-600">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSave}
            className={`w-full font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all btn-press ${saved ? 'bg-emerald-500 text-white shadow-emerald-100 dark:shadow-emerald-950/20' : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-slate-200 dark:shadow-indigo-950/20'}`}
          >
            {saved ? 'Preferences Saved' : t.apply}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
