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
    <div style={{ height: '350px' }} className="mb-4 border border-dark p-2 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scheduleData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="year" stroke="#000" tick={{ fill: '#333', fontSize: 12 }} />
          <YAxis stroke="#000" tick={{ fill: '#333', fontSize: 12 }} tickFormatter={(val) => formatCurrencyCompact(val)} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)} 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', color: '#000', borderRadius: '0', fontSize: '12px' }} 
            itemStyle={{ color: '#000' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="netWorthMed" stroke="#000" name="Net Worth (Med)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#000' }} />
          <Line type="monotone" dataKey="mortgageBalance" stroke="#ef4444" name="Mortgage Balance (Debt)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="homeMed" stroke="#666" strokeDasharray="4 4" name="Home Value (Med)" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="invMed" stroke="#2563eb" name="Portfolio (Med Yield)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
