
import React, { useState } from 'react';
import { triggerHaptic } from '../services/hapticService';

interface LoginProps {
  onLogin: (identifier: string, pass: string) => void;
  onSwitchToRegister: () => void;
  onDemoLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister, onDemoLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(phone, password);
  };

  const handleAction = (fn: () => void) => {
    triggerHaptic('medium');
    fn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf9] dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-sm space-y-10 page-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20">
            <i className="fa-solid fa-shield text-2xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">VIGILANT</h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">Expiry Guard</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mobile Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-slate-900 dark:text-white text-xs font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="+1 234 567 8900"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-slate-900 dark:text-white text-xs font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              onClick={() => triggerHaptic('heavy')}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-black dark:hover:bg-indigo-700 btn-press shadow-xl shadow-slate-100 dark:shadow-indigo-900/20"
            >
              Login
            </button>
          </form>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleAction(onDemoLogin)}
              className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-[10px] font-black uppercase tracking-widest btn-press"
            >
              Try as Guest
            </button>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                No account? <button onClick={() => handleAction(onSwitchToRegister)} className="text-indigo-600 dark:text-indigo-400 hover:underline">Register Now</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
