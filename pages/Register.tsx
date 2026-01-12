
import React, { useState } from 'react';
import { triggerHaptic } from '../services/hapticService';

interface RegisterProps {
  onRegister: (email: string | null, pass: string, phone: string) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      triggerHaptic('error');
      return alert("Passwords do not match!");
    }
    // Passing null for email as it's no longer used for registration
    onRegister(null, password, phone);
  };

  const handleAction = (fn: () => void) => {
    triggerHaptic('medium');
    fn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf9]">
      <div className="w-full max-w-sm space-y-10 page-fade-in">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-slate-200">
            <i className="fa-solid fa-mobile-screen-button text-2xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SIGN UP</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Join the Guard</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number (SMS)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-900 text-xs font-bold transition-all"
                placeholder="+1 234 567 8900"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Security Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-900 text-xs font-bold transition-all"
                placeholder="6+ characters"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
              <input 
                type="password" 
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-900 text-xs font-bold transition-all"
                placeholder="Repeat password"
                required
              />
            </div>

            <button 
              type="submit"
              onClick={() => triggerHaptic('heavy')}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 btn-press shadow-xl shadow-indigo-100 mt-4"
            >
              Create Account
            </button>
          </form>

          <div className="pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Already have an account? <button onClick={() => handleAction(onSwitchToLogin)} className="text-slate-900 hover:underline">Log In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
