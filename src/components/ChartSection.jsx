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
import { useStrategy } from '../context/useStrategy.js';

export default function ChartSection({ scheduleData }) {
  const strategyCtx = useStrategy() || {};
  const theme = strategyCtx.theme || 'light';
  const isDark = theme === 'dark';

  const axisStroke = isDark ? '#a0a0a0' : '#000';
  const tickColor = isDark ? '#d0d0d0' : '#333';
  const gridColor = isDark ? '#303030' : '#eee';
  const tooltipBg = isDark ? '#222222' : '#fff';
  const tooltipBorder = isDark ? '#444444' : '#000';
  const tooltipText = isDark ? '#ffffff' : '#000';
  const netWorthStroke = isDark ? '#ffffff' : '#000';
  const homeStroke = isDark ? '#aaaaaa' : '#666';

  return (
    <div style={{ height: '350px' }} className="mb-4 border border-dark p-2 bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scheduleData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="year" stroke={axisStroke} tick={{ fill: tickColor, fontSize: 12 }} />
          <YAxis stroke={axisStroke} tick={{ fill: tickColor, fontSize: 12 }} tickFormatter={(val) => formatCurrencyCompact(val)} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)} 
            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText, borderRadius: '0', fontSize: '12px' }} 
            itemStyle={{ color: tooltipText }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: tickColor }} />
          <Line type="monotone" dataKey="netWorthMed" stroke={netWorthStroke} name="Net Worth (Med)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: netWorthStroke }} />
          <Line type="monotone" dataKey="mortgageBalance" stroke="#ef4444" name="Mortgage Balance (Debt)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#ef4444' }} />
          <Line type="monotone" dataKey="homeMed" stroke={homeStroke} strokeDasharray="4 4" name="Home Value (Med)" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="invMed" stroke="#3b82f6" name="Portfolio (Med Yield)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
