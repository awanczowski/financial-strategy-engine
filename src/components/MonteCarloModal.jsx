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

export default function MonteCarloModal({
  show,
  onClose,
  isSimulating,
  results,
  loanConfig
}) {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card border-dark border-2 rounded-0 shadow-lg" style={{ width: '95%', maxWidth: '1100px', zIndex: 1050, maxHeight: '95vh', overflowY: 'auto' }}>
        <div className="card-header bg-white border-dark d-flex justify-content-between align-items-center p-3 p-md-4">
          <h5 className="m-0 scandi-header text-black">Monte Carlo Analysis</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        
        <div className="card-body p-3 p-md-4 bg-white">
          {isSimulating ? (
            <div className="py-5 text-center">
              <div className="spinner-border text-dark mb-3" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}></div>
              <h6 className="scandi-label text-muted">Generating 3,000 statistical market paths...</h6>
            </div>
          ) : results && (
            <div className="row g-4">
              
              {/* Left Column: Metrics */}
              <div className="col-lg-4 text-start">
                <h6 className="scandi-header text-black mb-3">Survival Probability</h6>
                <p className="text-muted small mb-4 lh-base">
                  Based on 1,000 randomized market paths (assuming 15% annualized volatility) applied against your Low, Medium, and High accumulation yield estimates.
                </p>
                
                <div className="border border-dark">
                  <div className="d-flex justify-content-between align-items-center border-bottom border-light p-3">
                    <div>
                      <span className="scandi-label text-muted d-block">Low Base ({loanConfig.investRateLow}%)</span>
                      <small className="text-muted fw-bold">Med End: {formatCurrencyCompact(results.low.median)}</small>
                    </div>
                    <div className="text-end">
                      <span className="fw-bolder fs-4 text-muted d-block lh-1">{results.low.successRate.toFixed(1)}%</span>
                      <span className="scandi-label text-muted" style={{fontSize: '0.65rem'}}>Success</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center border-bottom border-light p-3 bg-light border-start border-dark border-4">
                    <div>
                      <span className="scandi-label text-black d-block">Med Base ({loanConfig.investRateMed}%)</span>
                      <small className="text-black fw-bold">Med End: {formatCurrencyCompact(results.med.median)}</small>
                    </div>
                    <div className="text-end">
                      <span className="fw-bolder fs-3 text-black d-block lh-1">{results.med.successRate.toFixed(1)}%</span>
                      <span className="scandi-label text-black" style={{fontSize: '0.65rem'}}>Success</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3">
                    <div>
                      <span className="scandi-label text-muted d-block">High Base ({loanConfig.investRateHigh}%)</span>
                      <small className="text-muted fw-bold">Med End: {formatCurrencyCompact(results.high.median)}</small>
                    </div>
                    <div className="text-end">
                      <span className="fw-bolder fs-4 text-muted d-block lh-1">{results.high.successRate.toFixed(1)}%</span>
                      <span className="scandi-label text-muted" style={{fontSize: '0.65rem'}}>Success</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Plotted Chart */}
              <div className="col-lg-8">
                <h6 className="scandi-header text-black mb-3">Portfolio Spread (Medium Scenario)</h6>
                <div className="border border-dark p-3" style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.med.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="year" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
                      <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} tickFormatter={(val) => formatCurrencyCompact(val)} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)} 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', color: '#000', borderRadius: '0', fontWeight: 'bold' }} 
                        itemStyle={{ color: '#000' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="p90" stroke="#93c5fd" name="90th Percentile (Great)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="p50" stroke="#3b82f6" name="50th Percentile (Median)" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
                      <Line type="monotone" dataKey="p10" stroke="#ef4444" name="10th Percentile (Poor)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
