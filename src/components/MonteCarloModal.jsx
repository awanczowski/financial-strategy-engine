import React, { useState, useEffect } from 'react';
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
  loanConfig,
  socialSecurityConfig,
  onReRun
}) {
  const [selectedScenario, setSelectedScenario] = useState('med'); // 'low' | 'med' | 'high'
  const [mcViewMode, setMcViewMode] = useState('nominal'); // 'nominal' | 'real'
  const [localVolatility, setLocalVolatility] = useState(loanConfig.monteCarloVolatility ?? 15);
  const [localIterations, setLocalIterations] = useState(loanConfig.monteCarloIterations ?? 1000);

  useEffect(() => {
    if (loanConfig) {
      if (loanConfig.monteCarloVolatility) setLocalVolatility(loanConfig.monteCarloVolatility);
      if (loanConfig.monteCarloIterations) setLocalIterations(loanConfig.monteCarloIterations);
    }
  }, [loanConfig]);

  if (!show) return null;

  const handleRunSimulation = (e) => {
    if (e) e.preventDefault();
    if (onReRun) {
      onReRun({
        volatility: Number(localVolatility),
        iterations: Number(localIterations)
      });
    }
  };

  const activeResult = results ? (results[selectedScenario] || results.med) : null;
  const isReal = mcViewMode === 'real';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card border-dark border-2 rounded-0 shadow-lg" style={{ width: '95%', maxWidth: '1200px', zIndex: 1050, maxHeight: '95vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div className="card-header bg-white border-dark d-flex justify-content-between align-items-center p-3 p-md-4">
          <div>
            <h5 className="m-0 scandi-header text-black">Advanced Monte Carlo Analysis</h5>
            <small className="text-muted fw-bold">Statistical Stress Test & Multi-Percentile Return Cones</small>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close Monte Carlo Modal"></button>
        </div>
        
        <div className="card-body p-3 p-md-4 bg-white">

          {/* Simulation Controls Toolbar */}
          <form onSubmit={handleRunSimulation} className="bg-light border border-dark p-3 mb-4">
            <div className="row g-3 align-items-center">
              
              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label scandi-label text-black mb-1">
                  Annual Volatility (Risk %):
                </label>
                <div className="input-group input-group-sm">
                  <input 
                    type="number" 
                    step="1" 
                    min="1" 
                    max="50" 
                    className="form-control scandi-input border-dark fw-bold text-center" 
                    value={localVolatility} 
                    onChange={(e) => setLocalVolatility(e.target.value)} 
                  />
                  <span className="input-group-text bg-white border-dark text-dark fw-bold">%</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label scandi-label text-black mb-1">
                  Simulation Runs:
                </label>
                <select 
                  className="form-select form-select-sm scandi-input border-dark fw-bold"
                  value={localIterations}
                  onChange={(e) => setLocalIterations(Number(e.target.value))}
                >
                  <option value={500}>500 Runs (Fast)</option>
                  <option value={1000}>1,000 Runs (Standard)</option>
                  <option value={2500}>2,500 Runs (High Detail)</option>
                  <option value={5000}>5,000 Runs (Deep Stress Test)</option>
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="form-label scandi-label text-black mb-1">
                  Display Value Mode:
                </label>
                <div className="btn-group btn-group-sm w-100 border border-dark" role="group">
                  <button
                    type="button"
                    className={`btn ${!isReal ? 'btn-dark' : 'bg-white text-dark'} fw-bold scandi-label px-2`}
                    onClick={() => setMcViewMode('nominal')}
                  >
                    Nominal
                  </button>
                  <button
                    type="button"
                    className={`btn ${isReal ? 'btn-dark' : 'bg-white text-dark'} fw-bold scandi-label px-2`}
                    onClick={() => setMcViewMode('real')}
                  >
                    Real ($ Today)
                  </button>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-end">
                <button 
                  type="submit" 
                  disabled={isSimulating}
                  className="btn btn-dark btn-sm w-100 fw-bold scandi-label py-2"
                >
                  {isSimulating ? 'Simulating...' : 'Re-Run Stress Test'}
                </button>
              </div>

            </div>
          </form>

          {/* Social Security Impact Banner */}
          <div className="p-3 mb-4 bg-light border border-dark d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className={`badge ${socialSecurityConfig?.enableSocialSecurity ? 'bg-dark text-white' : 'bg-secondary text-white'} scandi-label px-2 py-1`}>
                {socialSecurityConfig?.enableSocialSecurity ? 'Social Security Active' : 'Social Security Disabled'}
              </span>
              <span className="small text-dark fw-bold">
                {socialSecurityConfig?.enableSocialSecurity ? (
                  <>
                    Self: <strong>${(socialSecurityConfig.selfMonthlyBenefit || 0).toLocaleString()}/mo</strong> ({socialSecurityConfig.selfStartDate})
                    {socialSecurityConfig.enableSpouseSS && (
                      <span className="ms-2">
                        | Spouse: <strong>${(socialSecurityConfig.spouseMonthlyBenefit || 0).toLocaleString()}/mo</strong> ({socialSecurityConfig.spouseStartDate})
                      </span>
                    )}
                    <span className="ms-2 text-muted">
                      ({socialSecurityConfig.annualColaRate || 0}% COLA)
                    </span>
                  </>
                ) : (
                  <span className="text-muted fw-normal">
                    Enable Social Security in Retirement Controls to model guaranteed income cash flows and portfolio withdrawal offsets.
                  </span>
                )}
              </span>
            </div>
            {socialSecurityConfig?.enableSocialSecurity && (
              <span className="badge bg-white text-dark border border-dark px-2 py-1 scandi-label">
                Guaranteed Cash Flow Floor Applied
              </span>
            )}
          </div>

          {isSimulating ? (
            <div className="py-5 text-center">
              <div className="spinner-border text-dark mb-3" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}></div>
              <h6 className="scandi-label text-muted">Running {Number(localIterations).toLocaleString()} market simulations across yield scenarios...</h6>
            </div>
          ) : results && (
            <div className="row g-4">
              
              {/* Left Column: Survival Rate Breakdown & Scenario Selection */}
              <div className="col-lg-4 text-start">
                <h6 className="scandi-header text-black mb-2">Survival Probabilities</h6>
                <p className="text-muted small mb-3 lh-base">
                  Click a scenario below to inspect its percentile trajectory cone:
                </p>
                
                <div className="border border-dark mb-4">
                  
                  {/* Low Scenario Card */}
                  <div 
                    onClick={() => setSelectedScenario('low')}
                    className={`p-3 border-bottom border-light cursor-pointer style-hover-card ${selectedScenario === 'low' ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`scandi-label d-block ${selectedScenario === 'low' ? 'text-white-50' : 'text-muted'}`}>
                          Low Base ({loanConfig.investRateLow}%)
                        </span>
                        <small className="fw-bold">
                          Median: {formatCurrencyCompact(isReal ? results.low.medianReal : results.low.median)}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`fw-bolder fs-4 d-block lh-1 ${selectedScenario === 'low' ? 'text-white' : 'text-dark'}`}>
                          {results.low.successRate.toFixed(1)}%
                        </span>
                        <span className="scandi-label text-muted" style={{ fontSize: '0.65rem' }}>Success</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medium Scenario Card */}
                  <div 
                    onClick={() => setSelectedScenario('med')}
                    className={`p-3 border-bottom border-light cursor-pointer ${selectedScenario === 'med' ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`scandi-label d-block ${selectedScenario === 'med' ? 'text-white-50' : 'text-black fw-bold'}`}>
                          Med Base ({loanConfig.investRateMed}%)
                        </span>
                        <small className="fw-bold">
                          Median: {formatCurrencyCompact(isReal ? results.med.medianReal : results.med.median)}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`fw-bolder fs-3 d-block lh-1 ${selectedScenario === 'med' ? 'text-white' : 'text-black'}`}>
                          {results.med.successRate.toFixed(1)}%
                        </span>
                        <span className="scandi-label text-muted" style={{ fontSize: '0.65rem' }}>Success</span>
                      </div>
                    </div>
                  </div>

                  {/* High Scenario Card */}
                  <div 
                    onClick={() => setSelectedScenario('high')}
                    className={`p-3 cursor-pointer ${selectedScenario === 'high' ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`scandi-label d-block ${selectedScenario === 'high' ? 'text-white-50' : 'text-muted'}`}>
                          High Base ({loanConfig.investRateHigh}%)
                        </span>
                        <small className="fw-bold">
                          Median: {formatCurrencyCompact(isReal ? results.high.medianReal : results.high.median)}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`fw-bolder fs-4 d-block lh-1 ${selectedScenario === 'high' ? 'text-white' : 'text-dark'}`}>
                          {results.high.successRate.toFixed(1)}%
                        </span>
                        <span className="scandi-label text-muted" style={{ fontSize: '0.65rem' }}>Success</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Risk Metrics Summary Card for Selected Scenario */}
                {activeResult && (
                  <div className="card border-dark bg-light rounded-0">
                    <div className="card-body p-3">
                      <h6 className="scandi-label text-black border-bottom border-dark pb-2 mb-3">
                        {selectedScenario.toUpperCase()} Scenario Metrics ({isReal ? "Real $ Today" : "Nominal"})
                      </h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-danger small fw-bold">10th Percentile (Bear):</span>
                        <span className="fw-bold text-danger">{formatCurrency(isReal ? activeResult.p10Real : activeResult.p10)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-black small fw-bold">50th Percentile (Median):</span>
                        <span className="fw-bolder text-black">{formatCurrency(isReal ? activeResult.medianReal : activeResult.median)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-success small fw-bold">90th Percentile (Bull):</span>
                        <span className="fw-bold text-success">{formatCurrency(isReal ? activeResult.p90Real : activeResult.p90)}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Multi-Percentile Return Cone Chart */}
              <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="scandi-header text-black mb-0">
                    Probability Cone ({selectedScenario.toUpperCase()} Base - {isReal ? "Today's Real Dollars" : "Nominal Dollars"})
                  </h6>
                  <span className="badge bg-dark text-white px-2 py-1 scandi-label">
                    {results.volatility}% Volatility | {results.iterations.toLocaleString()} Runs
                  </span>
                </div>
                
                <div className="border border-dark p-3 bg-white" style={{ height: '420px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeResult ? activeResult.chartData : []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="year" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
                      <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} tickFormatter={(val) => formatCurrencyCompact(val)} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)} 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #000', color: '#000', borderRadius: '0', fontWeight: 'bold' }} 
                        itemStyle={{ color: '#000' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px', fontWeight: 'bold', fontSize: '0.8rem' }} />
                      
                      <Line type="monotone" dataKey={isReal ? "p90Real" : "p90"} stroke="#2563eb" name="90th % (Bull Market)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey={isReal ? "p75Real" : "p75"} stroke="#60a5fa" name="75th % (Above Average)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                      <Line type="monotone" dataKey={isReal ? "p50Real" : "p50"} stroke="#1d4ed8" name="50th % (Median Outcome)" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#1d4ed8' }} />
                      <Line type="monotone" dataKey={isReal ? "p25Real" : "p25"} stroke="#f97316" name="25th % (Below Average)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                      <Line type="monotone" dataKey={isReal ? "p10Real" : "p10"} stroke="#ef4444" name="10th % (Bear Market)" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#ef4444' }} />
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

