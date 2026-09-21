'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const dummyData = [
  { month: 'Jan', total: 12000000 },
  { month: 'Feb', total: 15000000 },
  { month: 'Mar', total: 18000000 },
  { month: 'Apr', total: 14000000 },
  { month: 'May', total: 20000000 },
  { month: 'Jun', total: 25000000 },
];

export function RevenueChart() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Tren Penerimaan Kas Pondok
          </h3>
          <p className="text-xs text-slate-400">
            Akumulasi SPP, Top Up dompet, dan Infaq per bulan
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Semester Ini
        </span>
      </div>

      <div className="h-[260px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dummyData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000000}jt`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-modal p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-slate-200">
                      <p className="font-semibold text-slate-700">Bulan {label}</p>
                      <p className="text-emerald-700 font-bold text-sm">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(Number(payload[0].value))}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="total" 
              fill="#059669" 
              radius={[6, 6, 2, 2]} 
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
