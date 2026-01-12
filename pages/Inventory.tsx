
import React, { useState } from 'react';
import { Product, Category } from '../types';
import { triggerHaptic } from '../services/hapticService';

interface InventoryProps {
  products: Product[];
  onDelete: (id: string) => void;
  // Translation object
  t: any;
}

const Inventory: React.FC<InventoryProps> = ({ products, onDelete, t }) => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getUrgencyLevel = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr + 'T00:00:00');
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (days < 0) return { label: t.expired || 'Expired', class: 'text-rose-600 bg-rose-50' };
    if (days === 0) return { label: 'Today', class: 'text-rose-600 bg-rose-50 animate-pulse' };
    if (days <= 3) return { label: t.warning || 'Soon', class: 'text-amber-600 bg-amber-50' };
    return { label: t.fresh || 'Fresh', class: 'text-emerald-600 bg-emerald-50' };
  };

  const handleDelete = (id: string) => {
    triggerHaptic('heavy');
    onDelete(id);
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-8 page-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.items || 'My Items'}</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.inventory || 'Inventory List'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-100 rounded-2xl pl-10 pr-5 py-3 text-xs font-bold transition-all shadow-sm w-full sm:w-48 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => { triggerHaptic('light'); setFilter(e.target.value as any); }}
            className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest shadow-sm cursor-pointer appearance-none outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Medicine">Medicine</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Household">Household</option>
          </select>
        </div>
      </header>

      {filteredProducts.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Date</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => {
                  const urgency = getUrgencyLevel(product.expiryDate);
                  const displayDate = new Date(product.expiryDate + 'T00:00:00').toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/40 transition-all group">
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{product.name}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{product.category}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs text-slate-900 font-black uppercase tracking-widest">{displayDate}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${urgency.class}`}>
                          {urgency.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="w-10 h-10 rounded-xl hover:bg-rose-50 text-slate-200 hover:text-rose-500 transition-all"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-xl">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No items match your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
