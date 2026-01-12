
import React, { useState } from 'react';
import { Product } from '../types';
import { getRecipeSuggestion } from '../services/geminiService';

interface AssistantProps {
  products: Product[];
  // Translation object
  t: any;
}

const Assistant: React.FC<AssistantProps> = ({ products, t }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const expiringSoon = products.filter(p => {
    const diff = new Date(p.expiryDate).getTime() - Date.now();
    return diff > 0 && diff < (5 * 24 * 60 * 60 * 1000) && p.category === 'Food';
  });

  const handleAskRecipes = async () => {
    if (expiringSoon.length === 0) return;
    setLoading(true);
    const result = await getRecipeSuggestion(expiringSoon.map(p => p.name));
    setResponse(result || null);
    setLoading(false);
  };

  return (
    <div className="space-y-10 pb-24 lg:pb-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t.tips || 'Smart Assistant'}</h2>
        <p className="text-sm text-slate-500">Intelligent insights for your inventory management.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <i className="fa-solid fa-sparkles"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Operational Advice</h3>
                <p className="text-xs text-slate-400 font-medium">Leveraging AI to optimize your consumption.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {expiringSoon.length > 0 
                    ? `Detected ${expiringSoon.length} food items nearing expiry. I can suggest a way to use them efficiently.`
                    : "No immediate food waste risks detected. Your current inventory is well-managed."
                  }
                </p>
              </div>

              {response && (
                <div className="p-6 rounded-lg bg-indigo-50 border border-indigo-100 animate-in fade-in duration-300">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Recommendation</p>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {response}
                  </div>
                </div>
              )}

              <button 
                onClick={handleAskRecipes}
                disabled={loading || expiringSoon.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-standard shadow-sm flex items-center gap-2"
              >
                {loading ? 'Thinking...' : 'Get Recipe Suggestion'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Urgent Items</h3>
          <div className="space-y-3">
            {expiringSoon.length > 0 ? expiringSoon.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-50 hover:border-slate-100 transition-standard">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">{Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24))} Days left</div>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400 font-medium italic">No food items expiring soon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
