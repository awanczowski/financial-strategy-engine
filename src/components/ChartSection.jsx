import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../lib/formatters.js';

export default function ChartSection({ scheduleData }) {
  return (
    <div style={{ height: '500px' }} className="mb-5 border border-dark p-3 p-xl-4 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scheduleData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="year" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
          <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} tickFormatter={(val) => formatCurrencyCompact(val)} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)} 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', color: '#000', borderRadius: '0', fontWeight: 'bold' }} 
            itemStyle={{ color: '#000' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
          <Line type="monotone" dataKey="netWorthMed" stroke="#000" name="Net Worth (Med)" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#000' }} />
          <Line type="monotone" dataKey="mortgageBalance" stroke="#ef4444" name="Mortgage Balance (Debt)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="homeMed" stroke="#000" strokeDasharray="5 5" name="Home Value (Med)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="invMed" stroke="#3b82f6" name="Portfolio (Med Yield)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
