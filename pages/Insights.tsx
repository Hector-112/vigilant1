
import React, { useMemo } from 'react';
import { Product } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface InsightsProps {
  products: Product[];
  // Translation object
  t: any;
}

const Insights: React.FC<InsightsProps> = ({ products, t }) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const statusData = useMemo(() => {
    const now = new Date();
    let fresh = 0, soon = 0, expired = 0;
    products.forEach(p => {
      const expiry = new Date(p.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) expired++;
      else if (diffDays <= 3) soon++;
      else fresh++;
    });
    return [
      { name: t.fresh || 'Fresh', value: fresh, color: '#10b981' },
      { name: t.warning || 'Soon', value: soon, color: '#f59e0b' },
      { name: t.expired || 'Expired', value: expired, color: '#ef4444' },
    ];
  }, [products, t]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316'];

  return (
    <div className="space-y-10 pb-24 lg:pb-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t.stats || 'Statistics'}</h2>
        <p className="text-sm text-slate-500">Visual breakdown of your product data.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Inventory Health</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Bar dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
