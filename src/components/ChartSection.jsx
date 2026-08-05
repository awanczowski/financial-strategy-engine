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

  const axisStroke = isDark ? '#787880' : '#A1A1AA';
  const tickColor = isDark ? '#9E9EA7' : '#71717A';
  const gridColor = isDark ? '#28282D' : '#E5E4E0';
  const tooltipBg = isDark ? '#1B1B1F' : '#FFFFFF';
  const tooltipBorder = isDark ? '#28282D' : '#E5E4E0';
  const tooltipText = isDark ? '#F4F4F0' : '#1C1C1E';
  
  const sageColor = isDark ? '#849372' : '#6B7A59';
  const bronzeColor = isDark ? '#C5A880' : '#A89480';
  const debtColor = isDark ? '#D97706' : '#C2410C';
  const netWorthStroke = isDark ? '#F4F4F0' : '#1C1C1E';

  return (
    <div style={{ height: '380px' }} className="mb-4 card dashboard-card bg-white p-3">
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h6 className="scandi-header text-muted m-0">Financial Trajectory & Wealth Divergence</h6>
        <span className="scandi-label text-muted" style={{ fontSize: '0.7rem' }}>30-Year Horizon Simulation</span>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={scheduleData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="year" stroke={axisStroke} tick={{ fill: tickColor, fontSize: 11 }} />
          <YAxis stroke={axisStroke} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={(val) => formatCurrencyCompact(val)} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)} 
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              border: `1px solid ${tooltipBorder}`, 
              color: tooltipText, 
              borderRadius: '8px', 
              fontSize: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)' 
            }} 
            itemStyle={{ color: tooltipText }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: tickColor }} />
          <Line type="monotone" dataKey="netWorthMed" stroke={netWorthStroke} name="Net Worth (Med)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: netWorthStroke }} />
          <Line type="monotone" dataKey="mortgageBalance" stroke={debtColor} name="Mortgage Balance (Debt)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: debtColor }} />
          <Line type="monotone" dataKey="homeMed" stroke={bronzeColor} strokeDasharray="4 4" name="Home Value (Med)" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="invMed" stroke={sageColor} name="Portfolio (Med Yield)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: sageColor }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
