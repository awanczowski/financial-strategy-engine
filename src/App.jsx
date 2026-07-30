import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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

// Formatting Helpers
const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0);
};

const formatCurrencyCompact = (val) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(val || 0);
};

// Extracted UI Components
const StrategyRow = ({ item, onUpdate, onRemove }) => (
  <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-md-nowrap">
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '110px' }}>
      <span className="input-group-text bg-white text-dark fw-bold border-dark">$</span>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input" 
        type="number" 
        value={item.amount} 
        onChange={(e) => onUpdate(item.id, 'amount', e.target.value)} 
        placeholder="Amt" 
      />
    </div>
    <select 
      className="form-select form-select-sm bg-white text-dark border-dark scandi-input flex-fill" 
      value={item.frequency} 
      onChange={(e) => onUpdate(item.id, 'frequency', e.target.value)}
    >
      <option value={1}>Monthly</option>
      <option value={3}>Quarterly</option>
      <option value={6}>Semi-Annual</option>
      <option value={12}>Yearly</option>
    </select>
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '140px' }}>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input px-1" 
        type="date" 
        value={item.startDate} 
        onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)} 
      />
    </div>
    <button className="btn btn-sm btn-outline-dark fw-bold" onClick={() => onRemove(item.id)}>X</button>
  </div>
);

const RateAdjustmentRow = ({ item, onUpdate, onRemove }) => (
  <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-md-nowrap">
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '100px' }}>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input" 
        type="number" 
        step="0.1" 
        value={item.rate} 
        onChange={(e) => onUpdate(item.id, 'rate', e.target.value)} 
      />
      <span className="input-group-text bg-white text-dark fw-bold border-dark">%</span>
    </div>
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '140px' }}>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input px-1" 
        type="date" 
        value={item.startDate} 
        onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)} 
      />
    </div>
    <button className="btn btn-sm btn-outline-dark fw-bold" onClick={() => onRemove(item.id)}>X</button>
  </div>
);

// Constants
const ACTIVE_SESSION_KEY = 'financialEngine_activeSession';
const SAVED_SCENARIOS_KEY = 'financialEngine_scenarios_v7';
const defaultStartDate = "2026-08-01";

const defaultLoanConfig = {
  principal: 400000,
  mortgageRate: 6.5, 
  years: 30,           
  simulationYears: 25, 
  initialInvestment: 0,
  investRateLow: 5.0,
  investRateMed: 8.0,
  investRateHigh: 11.0,
  initialHomeValue: 500000,
  homeGrowthRateLow: 2.0,
  homeGrowthRateMed: 3.5,
  homeGrowthRateHigh: 5.0,
  divertAfterPayoff: true,
  isBiweekly: false,
  loanStartDate: defaultStartDate
};

const defaultExtraPayments = [{ id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }];
const defaultInvestments = [{ id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }];

// Local Storage Helper for Active Session Initialization
const loadActiveSession = () => {
  const saved = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse active session", e);
    }
  }
  return null;
};

export default function App() {
  // Load initial state from Local Storage or fallback to defaults
  const activeSession = loadActiveSession();

  const [loanConfig, setLoanConfig] = useState(activeSession?.loanConfig || defaultLoanConfig);
  const [extraPayments, setExtraPayments] = useState(activeSession?.extraPayments || defaultExtraPayments);
  const [investments, setInvestments] = useState(activeSession?.investments || defaultInvestments);
  const [rateAdjustments, setRateAdjustments] = useState(activeSession?.rateAdjustments || []);
  
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');

  // Hydrate Named Scenarios on Mount
  useEffect(() => {
    const loadedScenarios = localStorage.getItem(SAVED_SCENARIOS_KEY);
    if (loadedScenarios) {
      try {
        setSavedScenarios(JSON.parse(loadedScenarios));
      } catch (e) {
        console.error("Could not parse saved scenarios", e);
      }
    }
  }, []);

  // Auto-Save Active Session on any parameter change
  useEffect(() => {
    const sessionData = {
      loanConfig,
      extraPayments,
      investments,
      rateAdjustments
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
  }, [loanConfig, extraPayments, investments, rateAdjustments]);

  // Actions
  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      alert("Please enter a scenario name.");
      return;
    }
    const newScenario = {
      id: Date.now(),
      name: scenarioName,
      loanConfig,
      extraPayments,
      investments,
      rateAdjustments
    };
    const updatedScenarios = [...savedScenarios, newScenario];
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updatedScenarios));
    setScenarioName('');
  };

  const handleLoadScenario = (scenario) => {
    setLoanConfig(scenario.loanConfig);
    setExtraPayments(scenario.extraPayments || []);
    setInvestments(scenario.investments || []);
    setRateAdjustments(scenario.rateAdjustments || []);
  };

  const handleDeleteScenario = (id) => {
    const updatedScenarios = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updatedScenarios));
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoanConfig(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (type === 'date' ? value : (value === '' ? '' : Number(value)))
    }));
  };

  const addStrategy = (setter, defaultObj) => {
    setter(prev => [...prev, { id: Date.now(), ...defaultObj }]);
  };

  const removeStrategy = (id, setter) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const updateStrategy = (id, field, value, setter) => {
    setter(prev => prev.map(item => {
      if (item.id === id) {
        const val = (field === 'startDate') ? value : (value === '' ? '' : Number(value));
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const calculateStandardPayment = (principal, annualRate, remainingMonths) => {
    if (annualRate === 0) return principal / remainingMonths;
    const r = (annualRate / 100) / 12;
    return principal * (r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
  };

  const getMonthOffset = (baseStr, targetStr) => {
    if (!baseStr || !targetStr) return 1;
    const [by, bm] = baseStr.split('-').map(Number);
    const [ty, tm] = targetStr.split('-').map(Number);
    return (ty - by) * 12 + (tm - bm) + 1;
  };

  // Heavy Simulation Engine
  const { scheduleData, summary, initialBreakdown } = useMemo(() => {
    const loanMonths = (Number(loanConfig.years) || 0) * 12;
    const simulationMonths = (Number(loanConfig.simulationYears) || 0) * 12;
    const isBiweekly = loanConfig.isBiweekly;
    const baseDate = loanConfig.loanStartDate;
    
    const activeExtra = extraPayments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));
    const activeInvestments = investments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));
    const activeRates = rateAdjustments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));

    const monthlyInvestRateLow = ((Number(loanConfig.investRateLow) || 0) / 100) / 12;
    const monthlyInvestRateMed = ((Number(loanConfig.investRateMed) || 0) / 100) / 12;
    const monthlyInvestRateHigh = ((Number(loanConfig.investRateHigh) || 0) / 100) / 12;
    
    const monthlyHomeGrowthLow = ((Number(loanConfig.homeGrowthRateLow) || 0) / 100) / 12;
    const monthlyHomeGrowthMed = ((Number(loanConfig.homeGrowthRateMed) || 0) / 100) / 12;
    const monthlyHomeGrowthHigh = ((Number(loanConfig.homeGrowthRateHigh) || 0) / 100) / 12;
    
    let currentPrincipal = Number(loanConfig.principal) || 0;
    let currentAnnualRate = Number(loanConfig.mortgageRate) || 0;
    let standardMonthlyPayment = calculateStandardPayment(currentPrincipal, currentAnnualRate, loanMonths);
    
    let currentInvestmentLow = Number(loanConfig.initialInvestment) || 0;
    let currentInvestmentMed = Number(loanConfig.initialInvestment) || 0;
    let currentInvestmentHigh = Number(loanConfig.initialInvestment) || 0;
    
    let currentHomeValueLow = Number(loanConfig.initialHomeValue) || 0;
    let currentHomeValueMed = Number(loanConfig.initialHomeValue) || 0;
    let currentHomeValueHigh = Number(loanConfig.initialHomeValue) || 0;
    
    let yearlyData = [];
    let yearMortgagePaid = 0;
    let yearInterestPaid = 0;
    let yearInvestContributed = 0;

    let totalInterestPaid = 0;
    let totalInvestContributed = 0;
    let payoffMonth = null;
    let firstMonthBreakdown = null;

    for (let month = 1; month <= simulationMonths; month++) {
      const adjustmentThisMonth = activeRates.find(adj => adj.startMonth === month);
      if (adjustmentThisMonth && currentPrincipal > 0) {
        currentAnnualRate = Number(adjustmentThisMonth.rate) || 0;
        const remainingLoanMonths = loanMonths - month + 1;
        standardMonthlyPayment = calculateStandardPayment(currentPrincipal, currentAnnualRate, remainingLoanMonths);
      }

      let monthlyMortgageRate = (currentAnnualRate / 100) / 12;
      let interestThisMonth = currentPrincipal > 0 ? currentPrincipal * monthlyMortgageRate : 0;
      
      let basePaymentCount = isBiweekly ? (month % 6 === 0 ? 3 : 2) : 1;
      let periodicBasePayment = isBiweekly ? standardMonthlyPayment / 2 : standardMonthlyPayment;
      let totalBasePaymentThisMonth = periodicBasePayment * basePaymentCount;

      let extraThisMonth = activeExtra.reduce((total, pay) => {
        if (month >= pay.startMonth && (month - pay.startMonth) % (Number(pay.frequency) || 1) === 0) {
          return total + (Number(pay.amount) || 0);
        }
        return total;
      }, 0);

      let investContributionThisMonth = activeInvestments.reduce((total, inv) => {
        if (month >= inv.startMonth && (month - inv.startMonth) % (Number(inv.frequency) || 1) === 0) {
          return total + (Number(inv.amount) || 0);
        }
        return total;
      }, 0);

      if (month === 1) {
        firstMonthBreakdown = {
          frequency: isBiweekly ? "Bi-Weekly" : "Monthly",
          periodicPayment: periodicBasePayment,
          interestPortion: interestThisMonth / (isBiweekly ? 2 : 1),
          principalPortion: periodicBasePayment - (interestThisMonth / (isBiweekly ? 2 : 1)),
          extraInMonth1: extraThisMonth
        };
      }

      let principalThisMonth = 0;

      if (currentPrincipal > 0) {
        let totalPaymentThisMonth = totalBasePaymentThisMonth + extraThisMonth;
        
        if (currentPrincipal + interestThisMonth <= totalPaymentThisMonth) {
          totalPaymentThisMonth = currentPrincipal + interestThisMonth;
          principalThisMonth = currentPrincipal;
          currentPrincipal = 0;
          payoffMonth = month; 
          
          if (loanConfig.divertAfterPayoff) {
            let leftover = (totalBasePaymentThisMonth + extraThisMonth) - totalPaymentThisMonth;
            investContributionThisMonth += leftover;
          }
        } else {
          principalThisMonth = totalBasePaymentThisMonth - interestThisMonth + extraThisMonth;
          currentPrincipal -= principalThisMonth;
        }
        
        yearMortgagePaid += totalPaymentThisMonth;
        yearInterestPaid += interestThisMonth;
        totalInterestPaid += interestThisMonth;
      } else {
        if (loanConfig.divertAfterPayoff) {
          let divertedStandard = month <= loanMonths ? totalBasePaymentThisMonth : 0;
          investContributionThisMonth += divertedStandard + extraThisMonth;
        }
      }

      currentInvestmentLow += currentInvestmentLow * monthlyInvestRateLow + investContributionThisMonth;
      currentInvestmentMed += currentInvestmentMed * monthlyInvestRateMed + investContributionThisMonth;
      currentInvestmentHigh += currentInvestmentHigh * monthlyInvestRateHigh + investContributionThisMonth;
      
      currentHomeValueLow += currentHomeValueLow * monthlyHomeGrowthLow;
      currentHomeValueMed += currentHomeValueMed * monthlyHomeGrowthMed;
      currentHomeValueHigh += currentHomeValueHigh * monthlyHomeGrowthHigh;

      yearInvestContributed += investContributionThisMonth;
      totalInvestContributed += investContributionThisMonth;

      if (month % 12 === 0) {
        yearlyData.push({
          year: month / 12,
          mortgageBalance: Math.max(0, currentPrincipal),
          homeMed: currentHomeValueMed,
          invLow: currentInvestmentLow,
          invMed: currentInvestmentMed,
          invHigh: currentInvestmentHigh,
          netWorthLow: (currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal),
          netWorthMed: (currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal),
          netWorthHigh: (currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal),
          mortgagePaid: yearMortgagePaid,
          interestPaid: yearInterestPaid,
          investContributed: yearInvestContributed,
          activeRate: currentAnnualRate 
        });
        
        yearMortgagePaid = 0;
        yearInterestPaid = 0;
        yearInvestContributed = 0;
      }
    }

    const initialInv = Number(loanConfig.initialInvestment) || 0;

    return {
      scheduleData: yearlyData,
      initialBreakdown: firstMonthBreakdown,
      summary: {
        totalInterestPaid,
        totalInvestContributed,
        payoffString: payoffMonth 
          ? `Yr ${Math.ceil(payoffMonth / 12)}, Mo ${payoffMonth % 12 === 0 ? 12 : payoffMonth % 12}` 
          : "Not paid off",
        finalHomeLow: currentHomeValueLow,
        finalHomeMed: currentHomeValueMed,
        finalHomeHigh: currentHomeValueHigh,
        finalInvLow: currentInvestmentLow,
        finalInvMed: currentInvestmentMed,
        finalInvHigh: currentInvestmentHigh,
        finalNetWorthLow: (currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal),
        finalNetWorthMed: (currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal),
        finalNetWorthHigh: (currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal),
        growthLow: currentInvestmentLow - totalInvestContributed - initialInv,
        growthMed: currentInvestmentMed - totalInvestContributed - initialInv,
        growthHigh: currentInvestmentHigh - totalInvestContributed - initialInv
      }
    };
  }, [loanConfig, extraPayments, investments, rateAdjustments]);

  return (
    <div 
      className="text-dark font-monospace m-0 p-0" 
      style={{ 
        width: '100vw', 
        minHeight: '100vh', 
        overflowX: 'hidden', 
        backgroundColor: '#fff',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" 
      }}
    >
      <style>{`
        body, #root { max-width: none !important; width: 100vw !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
        
        .fluid-layout-wrapper { display: flex; width: 100vw; min-height: 100vh; }
        .fluid-sidebar { width: 360px; flex-shrink: 0; height: 100vh; position: sticky; top: 0; overflow-y: auto; background: #fff; z-index: 10; }
        .fluid-main { flex-grow: 1; min-width: 0; padding: 2.5rem; border-left: 1px solid #000; }

        @media (max-width: 992px) {
          .fluid-layout-wrapper { flex-direction: column; }
          .fluid-sidebar { width: 100%; height: auto; position: static; border-bottom: 1px solid #000; }
          .fluid-main { padding: 1.5rem; border-left: none; }
        }

        .card, .form-control, .btn, .input-group-text, .form-select { border-radius: 0 !important; box-shadow: none !important; }
        .scandi-input:focus, .form-select:focus { border-color: #000 !important; box-shadow: inset 0 0 0 1px #000 !important; outline: none; }
        .btn-outline-dark:hover { background-color: #000; color: #fff; }

        .dashboard-card { border: 1px solid #000 !important; transition: transform 0.2s ease; }
        .dashboard-card:hover { transform: translateY(-4px); background-color: #f9f9f9 !important; }

        .scandi-checkbox {
          appearance: none; width: 24px; height: 24px; border: 1px solid #000; background-color: #fff; 
          cursor: pointer; position: relative; margin: 0; display: inline-block; flex-shrink: 0;
        }
        .scandi-checkbox:checked { background-color: #000; }
        .scandi-checkbox:checked::after {
          content: ''; position: absolute; left: 6px; top: 2px; width: 8px; height: 13px; 
          border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #fff; border-left: 1px solid #e5e5e5; }
        ::-webkit-scrollbar-thumb { background: #000; }

        .scandi-header { font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .scandi-label { font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.75rem; }
      `}</style>

      <div className="fluid-layout-wrapper">
        
        {/* LEFT COLUMN: Fixed Sidebar */}
        <div className="fluid-sidebar p-4">
          <div className="mb-5 border-bottom border-dark pb-3">
             <h1 className="h4 mb-0 scandi-header text-black">Strategy Engine</h1>
          </div>

          {initialBreakdown && (
            <div className="border border-dark p-3 mb-5">
              <h6 className="scandi-label mb-3 text-black">Base Payment Breakdown</h6>
              
              <div className="d-flex justify-content-between align-items-end mb-3 pb-2 border-bottom border-dark">
                <span className="text-muted fw-bold">{initialBreakdown.frequency}</span>
                <h4 className="m-0 fw-bold text-black">{formatCurrency(initialBreakdown.periodicPayment)}</h4>
              </div>
              
              <div className="d-flex justify-content-between mb-2 small fw-bold">
                <span className="text-muted">Interest (P.1)</span>
                <span className="text-black">{formatCurrency(initialBreakdown.interestPortion)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small fw-bold">
                <span className="text-muted">Principal (P.1)</span>
                <span className="text-black">{formatCurrency(initialBreakdown.principalPortion)}</span>
              </div>
              {initialBreakdown.extraInMonth1 > 0 && (
                <div className="d-flex justify-content-between mt-3 pt-2 border-top border-dark small fw-bold text-black">
                  <span>Extra (Date 1)</span>
                  <span>+ {formatCurrency(initialBreakdown.extraInMonth1)}</span>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <h5 className="scandi-label mb-3 text-black">Scenario Manager</h5>
            <div className="mb-4">
              <label className="form-label scandi-label text-muted mb-2">Save Configuration</label>
              <div className="input-group input-group-sm">
                <input type="text" className="form-control scandi-input border-dark" placeholder="Name..." value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} />
                <button className="btn btn-dark fw-bold px-3" onClick={handleSaveScenario}>SAVE</button>
              </div>
            </div>

            {savedScenarios.length > 0 && (
              <div>
                <label className="form-label scandi-label text-muted mb-2">Saved Configs</label>
                <div className="d-flex flex-column gap-2">
                  {savedScenarios.map(scenario => (
                    <div key={scenario.id} className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-dark text-start w-100 text-truncate fw-bold" onClick={() => handleLoadScenario(scenario)}>{scenario.name}</button>
                      <button className="btn btn-outline-dark fw-bold" style={{ maxWidth: '35px' }} onClick={() => handleDeleteScenario(scenario.id)}>X</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Fluid Main Dashboard */}
        <div className="fluid-main">
          
          {/* Lined Up Summary Dashboard */}
          <div className="row g-3 g-xl-4 mb-5">
            <div className="col-sm-6 col-xxl-3">
              <div className="card dashboard-card bg-white h-100">
                <div className="card-body d-flex flex-column justify-content-between p-3 p-xl-4">
                  <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Debt & Contributions</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Total Interest</span>
                    <span className="text-danger fw-bold">{formatCurrency(summary.totalInterestPaid)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Total Invested</span>
                    <span className="text-black fw-bold">{formatCurrency(summary.totalInvestContributed)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small fw-bold text-uppercase">Payoff Date</span>
                    <span className="text-black fw-bold">{summary.payoffString}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-sm-6 col-xxl-3">
              <div className="card dashboard-card bg-white h-100">
                <div className="card-body d-flex flex-column justify-content-between p-3 p-xl-4">
                  <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Home Value</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold">Low</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeLow)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-black small fw-bold">Med</span>
                    <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalHomeMed)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small fw-bold">High</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeHigh)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xxl-3">
              <div className="card dashboard-card bg-white h-100">
                <div className="card-body d-flex flex-column justify-content-between p-3 p-xl-4">
                  <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Portfolio</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold">Low</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalInvLow)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-black small fw-bold">Med</span>
                    <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalInvMed)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small fw-bold">High</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalInvHigh)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-xxl-3">
              <div className="card dashboard-card bg-white h-100">
                <div className="card-body d-flex flex-column justify-content-between p-3 p-xl-4 bg-light">
                  <h6 className="card-subtitle mb-4 scandi-label text-black border-bottom border-dark pb-2">Final Net Worth</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold">Low</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthLow)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-black small fw-bold">Med</span>
                    <span className="text-black fw-bolder fs-4">{formatCurrency(summary.finalNetWorthMed)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small fw-bold">High</span>
                    <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthHigh)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="card bg-white border-dark mb-5">
            <div className="card-header border-dark bg-transparent p-3 p-xl-4">
              <h5 className="mb-0 scandi-header text-black">Core Parameters</h5>
            </div>
            <div className="card-body p-3 p-xl-4">
              
              {/* MORTGAGE SECTION - SPLIT INTO TWO COLUMNS */}
              <h6 className="scandi-label text-muted mb-4 border-bottom border-dark pb-2">Mortgage Details</h6>
              <div className="row g-5 mb-5">
                
                {/* Column 1: Initial Configuration */}
                <div className="col-lg-6 position-relative">
                  <h6 className="scandi-label text-black mb-3">Initial Configuration</h6>
                  <div className="row g-3 align-items-end">
                    <div className="col-sm-6">
                      <label className="form-label scandi-label">Loan Start Date</label>
                      <input name="loanStartDate" type="date" className="form-control scandi-input border-dark" value={loanConfig.loanStartDate} onChange={handleConfigChange} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label scandi-label">Principal ($)</label>
                      <input name="principal" type="number" className="form-control scandi-input border-dark" value={loanConfig.principal} onChange={handleConfigChange} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label scandi-label">Base Rate (%)</label>
                      <input name="mortgageRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.mortgageRate} onChange={handleConfigChange} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label scandi-label">Term (Yrs)</label>
                      <input name="years" type="number" className="form-control scandi-input border-dark" value={loanConfig.years} onChange={handleConfigChange} />
                    </div>
                    <div className="col-12 mt-4">
                      <div className="d-flex align-items-center gap-3">
                        <input 
                          className="scandi-checkbox" 
                          type="checkbox" 
                          name="isBiweekly" 
                          id="biweeklyCheck"
                          checked={loanConfig.isBiweekly} 
                          onChange={handleConfigChange}
                        />
                        <label className="scandi-label m-0 text-black lh-sm" htmlFor="biweeklyCheck" style={{ cursor: 'pointer' }}>
                          Accelerated Bi-Weekly Payments
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Vertical Divider line visible only on lg+ screens */}
                  <div className="d-none d-lg-block border-end border-dark position-absolute" style={{ top: 0, bottom: 0, right: 0 }}></div>
                </div>

                {/* Column 2: ARM Adjustments */}
                <div className="col-lg-6">
                  <h6 className="scandi-label text-black mb-3">ARM Adjustments (Rate Changes)</h6>
                  {rateAdjustments.length === 0 && <div className="text-muted small fst-italic mb-3">No rate changes scheduled.</div>}
                  {rateAdjustments.map(item => (
                    <RateAdjustmentRow 
                      key={item.id} 
                      item={item} 
                      onUpdate={(id, field, val) => updateStrategy(id, field, val, setRateAdjustments)} 
                      onRemove={(id) => removeStrategy(id, setRateAdjustments)} 
                    />
                  ))}
                  <button className="btn btn-sm btn-outline-dark fw-bold mt-2 w-100" onClick={() => addStrategy(setRateAdjustments, { rate: 7.0, startDate: "2031-08-01" })}>+ Add Rate Change</button>
                </div>

              </div>

              {/* REAL ESTATE SECTION */}
              <h6 className="scandi-label text-muted mb-4 border-bottom border-dark pb-2">Real Estate Details</h6>
              <div className="row g-4 align-items-end mb-5">
                <div className="col-sm-6 col-lg-4 col-xl-3">
                  <label className="form-label scandi-label">Initial Home Value ($)</label>
                  <input name="initialHomeValue" type="number" className="form-control scandi-input border-dark" value={loanConfig.initialHomeValue} onChange={handleConfigChange} />
                </div>
                <div className="col-sm-12 col-lg-8 col-xl-5">
                  <label className="form-label scandi-label">Appreciation Estimates (%)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-black fw-bold border-dark">L</span>
                    <input name="homeGrowthRateLow" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateLow} onChange={handleConfigChange} />
                    <span className="input-group-text bg-white text-black fw-bold border-dark border-start-0">M</span>
                    <input name="homeGrowthRateMed" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateMed} onChange={handleConfigChange} />
                    <span className="input-group-text bg-white text-black fw-bold border-dark border-start-0">H</span>
                    <input name="homeGrowthRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateHigh} onChange={handleConfigChange} />
                  </div>
                </div>
              </div>

              {/* INVESTMENTS SECTION */}
              <h6 className="scandi-label text-muted mb-4 border-bottom border-dark pb-2">Investment Details</h6>
              <div className="row g-4 align-items-end">
                <div className="col-sm-6 col-lg-3 col-xl-2">
                  <label className="form-label scandi-label text-black fw-bolder border-bottom border-dark pb-1">Sim Term (Yrs)</label>
                  <input name="simulationYears" type="number" className="form-control scandi-input border-dark fw-bold" value={loanConfig.simulationYears} onChange={handleConfigChange} />
                </div>
                <div className="col-sm-6 col-lg-3 col-xl-3">
                  <label className="form-label scandi-label">Init. Port. ($)</label>
                  <input name="initialInvestment" type="number" className="form-control scandi-input border-dark" value={loanConfig.initialInvestment} onChange={handleConfigChange} />
                </div>
                <div className="col-sm-12 col-xl-4">
                  <label className="form-label scandi-label">Yield Estimates (%)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-black fw-bold border-dark">L</span>
                    <input name="investRateLow" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateLow} onChange={handleConfigChange} />
                    <span className="input-group-text bg-white text-black fw-bold border-dark border-start-0">M</span>
                    <input name="investRateMed" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateMed} onChange={handleConfigChange} />
                    <span className="input-group-text bg-white text-black fw-bold border-dark border-start-0">H</span>
                    <input name="investRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateHigh} onChange={handleConfigChange} />
                  </div>
                </div>
                <div className="col-sm-12 col-xl-3">
                  <div className="d-flex align-items-center gap-3 h-100 pb-2">
                    <input 
                      className="scandi-checkbox" 
                      type="checkbox" 
                      name="divertAfterPayoff" 
                      id="divertCheck"
                      checked={loanConfig.divertAfterPayoff} 
                      onChange={handleConfigChange}
                    />
                    <label className="scandi-label m-0 text-black lh-sm" htmlFor="divertCheck" style={{ cursor: 'pointer' }}>
                      Auto-invest freed cash post-mortgage
                    </label>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          <div className="row g-4 g-xl-5 mb-5">
            <div className="col-lg-6 flex-fill">
              <h5 className="scandi-label mb-3 border-bottom border-dark pb-2 text-black">Extra Mortgage Payments</h5>
              {extraPayments.map(item => (
                <StrategyRow 
                  key={item.id} 
                  item={item} 
                  onUpdate={(id, field, val) => updateStrategy(id, field, val, setExtraPayments)} 
                  onRemove={(id) => removeStrategy(id, setExtraPayments)} 
                />
              ))}
              <button className="btn btn-outline-dark fw-bold w-100 mt-2" onClick={() => addStrategy(setExtraPayments, { amount: 0, frequency: 1, startDate: defaultStartDate })}>+ Add Payment</button>
            </div>

            <div className="col-lg-6 flex-fill">
              <h5 className="scandi-label mb-3 border-bottom border-dark pb-2 text-black">Investment Contributions</h5>
              {investments.map(item => (
                <StrategyRow 
                  key={item.id} 
                  item={item} 
                  onUpdate={(id, field, val) => updateStrategy(id, field, val, setInvestments)} 
                  onRemove={(id) => removeStrategy(id, setInvestments)} 
                />
              ))}
              <button className="btn btn-outline-dark fw-bold w-100 mt-2" onClick={() => addStrategy(setInvestments, { amount: 0, frequency: 1, startDate: defaultStartDate })}>+ Add Investment</button>
            </div>
          </div>

          {/* Chart Visualization */}
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

          {/* Amortization Table */}
          <h5 className="scandi-header mb-4 text-black">Yearly Rollup</h5>
          <div className="table-responsive border border-dark bg-white">
            <table className="table table-hover mb-0 text-end align-middle" style={{ whiteSpace: 'nowrap' }}>
              <thead className="border-bottom border-dark bg-light">
                <tr>
                  <th className="text-start text-black scandi-label py-3 px-3">Year</th>
                  <th className="text-black scandi-label py-3 px-3">Rate (E.O.Y)</th>
                  <th className="text-black scandi-label py-3 px-3">Mortgage Bal.</th>
                  <th className="text-danger scandi-label py-3 px-3">Interest (Yr)</th>
                  <th className="text-black scandi-label py-3 px-3">Home (Med)</th>
                  <th className="text-black scandi-label py-3 px-3">Invested (Yr)</th>
                  <th className="text-muted scandi-label py-3 px-3">Port. Low</th>
                  <th className="text-black scandi-label py-3 px-3 fw-bolder">Port. Med</th>
                  <th className="text-black scandi-label py-3 px-3">Port. High</th>
                  <th className="text-black scandi-label py-3 px-3 fw-bolder">Net Worth (Med)</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {scheduleData.map((row) => (
                  <tr key={row.year} className="border-bottom border-light">
                    <td className="text-start fw-bold text-black py-3 px-3">{row.year}</td>
                    <td className="text-muted py-3 px-3">{row.mortgageBalance > 0 ? `${row.activeRate.toFixed(2)}%` : '-'}</td>
                    <td className="fw-bold py-3 px-3">{formatCurrency(row.mortgageBalance)}</td>
                    <td className="text-danger fw-bold py-3 px-3">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-3 px-3">{formatCurrency(row.homeMed)}</td>
                    <td className="py-3 px-3">{formatCurrency(row.investContributed)}</td>
                    <td className="text-muted py-3 px-3">{formatCurrency(row.invLow)}</td>
                    <td className="text-black fw-bolder py-3 px-3">{formatCurrency(row.invMed)}</td>
                    <td className="text-dark fw-bold py-3 px-3">{formatCurrency(row.invHigh)}</td>
                    <td className="text-black fw-bolder py-3 px-3 bg-light border-start border-light">{formatCurrency(row.netWorthMed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Disclaimer */}
          <footer className="mt-5 pt-4 border-top border-dark text-muted small" style={{ lineHeight: '1.6' }}>
            <strong>Disclaimer:</strong> The information, projections, and calculations provided by this application are for educational and informational purposes only and do not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, compounding discrepancies, inflation, and tax implications will vary over time and may significantly alter these figures. You should not make any financial or investment decisions based solely on this tool. Please consult with a qualified, licensed financial advisor or legal professional before making any major financial decisions or entering into any binding agreements.
          </footer>

        </div>
      </div>
    </div>
  );
}