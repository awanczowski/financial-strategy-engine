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

// Box-Muller transform for generating normally distributed random market returns
const randomNormal = (mean, stdDev) => {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
};

// Extracted UI Components
const StrategyRow = ({ item, onUpdate, onRemove }) => (
  <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-sm-nowrap">
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '100px' }}>
      <span className="input-group-text bg-white text-dark fw-bold border-dark">$</span>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input px-1" 
        type="number" 
        value={item.amount} 
        onChange={(e) => onUpdate(item.id, 'amount', e.target.value)} 
        placeholder="Amt" 
      />
    </div>
    <select 
      className="form-select form-select-sm bg-white text-dark border-dark scandi-input flex-fill" 
      style={{ minWidth: '100px' }}
      value={item.frequency} 
      onChange={(e) => onUpdate(item.id, 'frequency', e.target.value)}
    >
      <option value={1}>Monthly</option>
      <option value={3}>Quarterly</option>
      <option value={6}>Semi-Annual</option>
      <option value={12}>Yearly</option>
    </select>
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '130px' }}>
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
  <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-sm-nowrap">
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '100px' }}>
      <input 
        className="form-control bg-white text-dark border-dark scandi-input px-1" 
        type="number" 
        step="0.1" 
        value={item.rate} 
        onChange={(e) => onUpdate(item.id, 'rate', e.target.value)} 
      />
      <span className="input-group-text bg-white text-dark fw-bold border-dark">%</span>
    </div>
    <div className="input-group input-group-sm flex-fill" style={{ minWidth: '130px' }}>
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
const ACTIVE_SESSION_KEY = 'financialEngine_activeSession_v11';
const defaultStartDate = "2026-08-01";
const defaultRetirementDate = "2051-08-01";

const defaultLoanConfig = {
  principal: 400000,
  mortgageRate: 6.5, 
  years: 30,           
  simulationYears: 55, // Increased to 55 years to accurately test a 30-year retirement lifespan
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
  loanStartDate: defaultStartDate,
  enableRetirement: false,
  retirementDate: defaultRetirementDate,
  withdrawalType: 'percent', // 'percent' or 'fixed'
  retirementWithdrawalRate: 4.0,
  retirementFixedWithdrawal: 60000,
  retirementGrowthRate: 5.0,
  stopContributionsInRetirement: true
};

const defaultExtraPayments = [{ id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }];
const defaultInvestments = [{ id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }];

// Local Storage Helper
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
  const activeSession = loadActiveSession();

  const [loanConfig, setLoanConfig] = useState(activeSession?.loanConfig || defaultLoanConfig);
  const [extraPayments, setExtraPayments] = useState(activeSession?.extraPayments || defaultExtraPayments);
  const [investments, setInvestments] = useState(activeSession?.investments || defaultInvestments);
  const [rateAdjustments, setRateAdjustments] = useState(activeSession?.rateAdjustments || []);

  // Monte Carlo State
  const [showMonteCarloModal, setShowMonteCarloModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);

  useEffect(() => {
    const sessionData = {
      loanConfig,
      extraPayments,
      investments,
      rateAdjustments
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
  }, [loanConfig, extraPayments, investments, rateAdjustments]);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Fix for the withdrawal type string bug
    let finalValue = value;
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'date' || name === 'withdrawalType') {
      finalValue = value;
    } else {
      finalValue = value === '' ? '' : Number(value);
    }

    setLoanConfig(prev => ({ 
      ...prev, 
      [name]: finalValue
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
  const { scheduleData, summary, initialBreakdown, monthContributions } = useMemo(() => {
    const loanMonths = (Number(loanConfig.years) || 0) * 12;
    const simulationMonths = (Number(loanConfig.simulationYears) || 0) * 12;
    const isBiweekly = loanConfig.isBiweekly;
    const baseDate = loanConfig.loanStartDate;
    const retirementStartMonth = loanConfig.enableRetirement ? getMonthOffset(baseDate, loanConfig.retirementDate) : Infinity;
    
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
    let trackedMonthContributions = [];
    
    let yearMortgagePaid = 0;
    let yearInterestPaid = 0;
    let yearInvestContributed = 0;
    let yearWithdrawn = 0;

    let totalInterestPaid = 0;
    let totalInvestContributed = 0;
    let totalWithdrawnOverall = 0;
    let payoffMonth = null;
    let firstMonthBreakdown = null;

    // We will lock the withdrawal amounts on the first month of retirement
    let lockedWithdrawalLow = null;
    let lockedWithdrawalMed = null;
    let lockedWithdrawalHigh = null;

    for (let month = 1; month <= simulationMonths; month++) {
      const isRetired = month >= retirementStartMonth;

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

      if (isRetired && loanConfig.stopContributionsInRetirement) {
        investContributionThisMonth = 0;
      }

      // Store pure liquid cash flow additions for Monte Carlo simulation
      trackedMonthContributions.push(investContributionThisMonth);

      let yieldLow = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateLow;
      let yieldMed = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateMed;
      let yieldHigh = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateHigh;

      let withdrawalLow = 0, withdrawalMed = 0, withdrawalHigh = 0;
      let actualWithdrawnMed = 0; 

      if (isRetired) {
        if (lockedWithdrawalMed === null) {
          // Calculate and lock in the withdrawal amount on month 1 of retirement
          if (loanConfig.withdrawalType === 'fixed') {
            const fixedMonthly = (Number(loanConfig.retirementFixedWithdrawal) || 0) / 12;
            lockedWithdrawalLow = fixedMonthly;
            lockedWithdrawalMed = fixedMonthly;
            lockedWithdrawalHigh = fixedMonthly;
          } else {
            const pullRateAnnual = (Number(loanConfig.retirementWithdrawalRate) || 0) / 100;
            lockedWithdrawalLow = (currentInvestmentLow * pullRateAnnual) / 12;
            lockedWithdrawalMed = (currentInvestmentMed * pullRateAnnual) / 12;
            lockedWithdrawalHigh = (currentInvestmentHigh * pullRateAnnual) / 12;
          }
        }

        // Apply the locked amounts
        withdrawalLow = lockedWithdrawalLow;
        withdrawalMed = lockedWithdrawalMed;
        withdrawalHigh = lockedWithdrawalHigh;

        // Prevent ghost withdrawals tracking if the portfolio hits zero
        const availableMed = currentInvestmentMed + (currentInvestmentMed * yieldMed) + investContributionThisMonth;
        actualWithdrawnMed = Math.min(withdrawalMed, availableMed);
      }

      // Real estate is isolated. Withdrawals ONLY pull from liquid investments.
      currentInvestmentLow = Math.max(0, currentInvestmentLow + (currentInvestmentLow * yieldLow) + investContributionThisMonth - withdrawalLow);
      currentInvestmentMed = Math.max(0, currentInvestmentMed + (currentInvestmentMed * yieldMed) + investContributionThisMonth - withdrawalMed);
      currentInvestmentHigh = Math.max(0, currentInvestmentHigh + (currentInvestmentHigh * yieldHigh) + investContributionThisMonth - withdrawalHigh);
      
      currentHomeValueLow += currentHomeValueLow * monthlyHomeGrowthLow;
      currentHomeValueMed += currentHomeValueMed * monthlyHomeGrowthMed;
      currentHomeValueHigh += currentHomeValueHigh * monthlyHomeGrowthHigh;

      yearInvestContributed += investContributionThisMonth;
      totalInvestContributed += investContributionThisMonth;
      
      yearWithdrawn += actualWithdrawnMed;
      totalWithdrawnOverall += actualWithdrawnMed;

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
          withdrawn: yearWithdrawn,
          activeRate: currentAnnualRate 
        });
        
        yearMortgagePaid = 0;
        yearInterestPaid = 0;
        yearInvestContributed = 0;
        yearWithdrawn = 0;
      }
    }

    return {
      scheduleData: yearlyData,
      initialBreakdown: firstMonthBreakdown,
      monthContributions: trackedMonthContributions,
      summary: {
        totalInterestPaid,
        totalInvestContributed,
        totalWithdrawnOverall,
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
        finalNetWorthHigh: (currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal)
      }
    };
  }, [loanConfig, extraPayments, investments, rateAdjustments]);

  // Monte Carlo Execution Engine
  const handleOpenMonteCarlo = () => {
    setShowMonteCarloModal(true);
    setIsSimulating(true);
    setMonteCarloResults(null);
    
    setTimeout(() => {
      const iterations = 1000;
      const annualStdDev = 0.15; // 15% Volatility baseline
      const monthlyStdDev = annualStdDev / Math.sqrt(12);
      
      const retirementStartMonth = loanConfig.enableRetirement 
        ? getMonthOffset(loanConfig.loanStartDate, loanConfig.retirementDate) 
        : Infinity;

      const totalYears = Math.floor(monthContributions.length / 12);

      const runSimulation = (accumRate, trackPaths = false) => {
        let successCount = 0;
        let finalPorts = [];
        let yearlyPaths = [];
        
        if (trackPaths) {
          for (let y = 0; y < totalYears; y++) {
            yearlyPaths.push(new Float32Array(iterations));
          }
        }

        const isFixedWithdrawal = loanConfig.withdrawalType === 'fixed';
        const pullRateAnnual = loanConfig.enableRetirement && !isFixedWithdrawal ? (Number(loanConfig.retirementWithdrawalRate) || 0) / 100 : 0;
        const fixedMonthlyInput = isFixedWithdrawal ? (Number(loanConfig.retirementFixedWithdrawal) || 0) / 12 : 0;
        
        const retMean = (Number(loanConfig.retirementGrowthRate) || 0) / 100;
        const accumMean = (Number(accumRate) || 0) / 100;

        for (let i = 0; i < iterations; i++) {
          // Liquid portfolio only. Real estate is explicitly excluded.
          let port = Number(loanConfig.initialInvestment) || 0;
          let failed = false;
          let lockedWithdrawal = null;
          
          for (let m = 0; m < monthContributions.length; m++) {
            const isRetired = (m + 1) >= retirementStartMonth;

            // Lock the withdrawal amount on the very first month of retirement for this specific simulation path
            if (isRetired && lockedWithdrawal === null) {
              if (isFixedWithdrawal) {
                lockedWithdrawal = fixedMonthlyInput;
              } else {
                lockedWithdrawal = (port * pullRateAnnual) / 12;
              }
            }

            // Calculate returns only if still alive
            if (!failed) {
              const annualMean = isRetired ? retMean : accumMean;
              const monthlyMean = annualMean / 12;
              const r = randomNormal(monthlyMean, monthlyStdDev);
              
              let withdrawal = isRetired ? lockedWithdrawal : 0;
              
              port = port * (1 + r) + monthContributions[m] - withdrawal;
              
              // If liquid cash drops below 0, declare bankrupt path
              if (port <= 0) {
                port = 0;
                failed = true; 
              }
            }

            if ((m + 1) % 12 === 0 && trackPaths) {
              yearlyPaths[Math.floor(m / 12)][i] = port;
            }
          }
          finalPorts.push(port);
          if (!failed && port > 0) successCount++;
        }

        finalPorts.sort((a, b) => a - b);
        
        let chartData = [];
        if (trackPaths) {
          for (let y = 0; y < totalYears; y++) {
            let yearData = Array.from(yearlyPaths[y]).sort((a, b) => a - b);
            chartData.push({
              year: y + 1,
              p10: yearData[Math.floor(iterations * 0.10)],
              p50: yearData[Math.floor(iterations * 0.50)],
              p90: yearData[Math.floor(iterations * 0.90)]
            });
          }
        }

        return {
          successRate: (successCount / iterations) * 100,
          median: finalPorts[Math.floor(iterations * 0.50)],
          chartData
        };
      };

      const lowRes = runSimulation(loanConfig.investRateLow, false);
      const medRes = runSimulation(loanConfig.investRateMed, true); 
      const highRes = runSimulation(loanConfig.investRateHigh, false);

      setMonteCarloResults({
        low: lowRes,
        med: medRes,
        high: highRes
      });
      setIsSimulating(false);
    }, 400); 
  };

  return (
    <div 
      className="text-dark font-monospace m-0 p-0 d-flex flex-column min-vh-100" 
      style={{ 
        width: '100vw', 
        overflowX: 'hidden', 
        backgroundColor: '#f9f9f9',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" 
      }}
    >
      <style>{`
        body, #root { max-width: none !important; width: 100vw !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }

        .card, .form-control, .btn, .input-group-text, .form-select { border-radius: 0 !important; box-shadow: none !important; }
        .scandi-input:focus, .form-select:focus { border-color: #000 !important; box-shadow: inset 0 0 0 1px #000 !important; outline: none; }
        .btn-outline-dark:hover { background-color: #000; color: #fff; }

        .dashboard-card { border: 1px solid #000 !important; transition: transform 0.2s ease; }
        .dashboard-card:hover { transform: translateY(-4px); }

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

        @media (min-width: 992px) {
          .border-lg-end { border-right: 1px solid #e5e5e5 !important; }
        }
      `}</style>

      {/* Monte Carlo Modal Overlay */}
      {showMonteCarloModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card border-dark border-2 rounded-0 shadow-lg" style={{ width: '95%', maxWidth: '1100px', zIndex: 1050, maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="card-header bg-white border-dark d-flex justify-content-between align-items-center p-3 p-md-4">
              <h5 className="m-0 scandi-header text-black">Monte Carlo Analysis</h5>
              <button className="btn-close" onClick={() => setShowMonteCarloModal(false)}></button>
            </div>
            
            <div className="card-body p-3 p-md-4 bg-white">
              {isSimulating ? (
                <div className="py-5 text-center">
                  <div className="spinner-border text-dark mb-3" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}></div>
                  <h6 className="scandi-label text-muted">Generating 3,000 statistical market paths...</h6>
                </div>
              ) : monteCarloResults && (
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
                          <small className="text-muted fw-bold">Med End: {formatCurrencyCompact(monteCarloResults.low.median)}</small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bolder fs-4 text-muted d-block lh-1">{monteCarloResults.low.successRate.toFixed(1)}%</span>
                          <span className="scandi-label text-muted" style={{fontSize: '0.65rem'}}>Success</span>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center border-bottom border-light p-3 bg-light border-start border-dark border-4">
                        <div>
                          <span className="scandi-label text-black d-block">Med Base ({loanConfig.investRateMed}%)</span>
                          <small className="text-black fw-bold">Med End: {formatCurrencyCompact(monteCarloResults.med.median)}</small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bolder fs-3 text-black d-block lh-1">{monteCarloResults.med.successRate.toFixed(1)}%</span>
                          <span className="scandi-label text-black" style={{fontSize: '0.65rem'}}>Success</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3">
                        <div>
                          <span className="scandi-label text-muted d-block">High Base ({loanConfig.investRateHigh}%)</span>
                          <small className="text-muted fw-bold">Med End: {formatCurrencyCompact(monteCarloResults.high.median)}</small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bolder fs-4 text-muted d-block lh-1">{monteCarloResults.high.successRate.toFixed(1)}%</span>
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
                        <LineChart data={monteCarloResults.med.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
      )}

      {/* Sticky Top Navigation Bar */}
      <header className="w-100 border-bottom border-dark bg-white px-4 py-3" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
        <div className="d-flex justify-content-between align-items-center max-w-100 mx-auto">
          <h1 className="h4 mb-0 scandi-header text-black">Strategy Engine</h1>
        </div>
      </header>

      {/* Main Full-Width Content Area */}
      <main className="flex-grow-1 w-100 p-3 p-md-4 p-xl-5">
        
        {/* Lined Up Summary Dashboard */}
        <div className="row g-4 mb-4">
          {initialBreakdown && (
            <div className="col-lg-6">
              <div className="card dashboard-card bg-white h-100">
                <div className="card-body d-flex flex-column justify-content-between p-4">
                  <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Base Payment Breakdown ({initialBreakdown.frequency})</h6>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-black small fw-bold text-uppercase">Total Payment</span>
                    <span className="text-black fw-bolder fs-4">{formatCurrency(initialBreakdown.periodicPayment)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold">Principal Portion (P.1)</span>
                    <span className="text-muted fw-bold">{formatCurrency(initialBreakdown.principalPortion)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small fw-bold">Interest Portion (P.1)</span>
                    <span className="text-muted fw-bold">{formatCurrency(initialBreakdown.interestPortion)}</span>
                  </div>
                  {initialBreakdown.extraInMonth1 > 0 && (
                    <div className="d-flex justify-content-between mt-2 pt-2 border-top border-dark">
                      <span className="text-black small fw-bold">Extra Applied (Date 1)</span>
                      <span className="text-black fw-bold">+{formatCurrency(initialBreakdown.extraInMonth1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-6">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4">
                <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Cash Flow & Debt</h6>
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span className="text-black small fw-bold text-uppercase">Payoff Date</span>
                  <span className="text-black fw-bolder fs-4">{summary.payoffString}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-bold text-uppercase">Total Interest</span>
                  <span className="text-danger fw-bold">{formatCurrency(summary.totalInterestPaid)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-bold text-uppercase">Total Invested</span>
                  <span className="text-black fw-bold">{formatCurrency(summary.totalInvestContributed)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small fw-bold text-uppercase">Total Withdrawn</span>
                  <span className="text-success fw-bold">{formatCurrency(summary.totalWithdrawnOverall)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4">
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

          <div className="col-md-4">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4">
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

          <div className="col-md-4">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4 bg-light">
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

        {/* =========================================
            THE CONFIGURATION ENGINE (2 COLUMNS)
        ========================================= */}
        <div className="card bg-white border-dark mb-5 border-2 shadow-sm">
          <div className="card-header border-dark bg-transparent p-4">
            <h5 className="mb-0 scandi-header text-black">Strategy Engine Controls</h5>
          </div>
          
          <div className="card-body p-4 p-xl-5">
            <div className="row g-0">
              
              {/* === LEFT COLUMN: MORTGAGE & DEBT === */}
              <div className="col-lg-6 border-lg-end pe-lg-5 mb-5 mb-lg-0">
                <h5 className="scandi-label text-black mb-4 border-bottom border-dark pb-2 fs-6">Mortgage & Debt</h5>
                
                {/* 1. Base Loan */}
                <h6 className="scandi-label text-muted mb-3">Initial Configuration</h6>
                <div className="row g-3 align-items-end mb-4">
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Loan Start Date</label>
                    <input name="loanStartDate" type="date" className="form-control scandi-input border-dark" value={loanConfig.loanStartDate} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Principal ($)</label>
                    <input name="principal" type="number" className="form-control scandi-input border-dark" value={loanConfig.principal} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Base Rate (%)</label>
                    <input name="mortgageRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.mortgageRate} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Term (Yrs)</label>
                    <input name="years" type="number" className="form-control scandi-input border-dark" value={loanConfig.years} onChange={handleConfigChange} />
                  </div>
                  <div className="col-12 mt-3">
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

                {/* 2. ARM Adjustments */}
                <h6 className="scandi-label text-muted mb-3 border-top border-light pt-4">ARM Adjustments (Rate Changes)</h6>
                <div className="mb-4">
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

                {/* 3. Extra Payments */}
                <h6 className="scandi-label text-muted mb-3 border-top border-light pt-4">Extra Mortgage Payments</h6>
                <div className="mb-2">
                  {extraPayments.length === 0 && <div className="text-muted small fst-italic mb-3">No extra payments scheduled.</div>}
                  {extraPayments.map(item => (
                    <StrategyRow 
                      key={item.id} 
                      item={item} 
                      onUpdate={(id, field, val) => updateStrategy(id, field, val, setExtraPayments)} 
                      onRemove={(id) => removeStrategy(id, setExtraPayments)} 
                    />
                  ))}
                  <button className="btn btn-sm btn-outline-dark fw-bold mt-2 w-100" onClick={() => addStrategy(setExtraPayments, { amount: 0, frequency: 1, startDate: defaultStartDate })}>+ Add Payment</button>
                </div>

              </div>

              {/* === RIGHT COLUMN: WEALTH & INVESTING === */}
              <div className="col-lg-6 ps-lg-5">
                <h5 className="scandi-label text-black mb-4 border-bottom border-dark pb-2 fs-6">Wealth & Investing</h5>
                
                {/* 1. Real Estate */}
                <h6 className="scandi-label text-muted mb-3">Real Estate</h6>
                <div className="row g-3 align-items-end mb-4">
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Initial Home Value ($)</label>
                    <input name="initialHomeValue" type="number" className="form-control scandi-input border-dark" value={loanConfig.initialHomeValue} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-12 col-md-12">
                    <label className="form-label scandi-label">Appreciation (L / M / H %)</label>
                    <div className="input-group">
                      <input name="homeGrowthRateLow" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateLow} onChange={handleConfigChange} />
                      <span className="input-group-text bg-light text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                      <input name="homeGrowthRateMed" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateMed} onChange={handleConfigChange} />
                      <span className="input-group-text bg-light text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                      <input name="homeGrowthRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.homeGrowthRateHigh} onChange={handleConfigChange} />
                    </div>
                  </div>
                </div>

                {/* 2. Portfolio Base */}
                <h6 className="scandi-label text-muted mb-3 border-top border-light pt-4">Portfolio Base</h6>
                <div className="row g-3 align-items-end mb-4">
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label text-black fw-bolder border-bottom border-dark pb-1">Sim Term (Yrs)</label>
                    <input name="simulationYears" type="number" className="form-control scandi-input border-dark fw-bold" value={loanConfig.simulationYears} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-6 col-md-6">
                    <label className="form-label scandi-label">Init. Port. ($)</label>
                    <input name="initialInvestment" type="number" className="form-control scandi-input border-dark" value={loanConfig.initialInvestment} onChange={handleConfigChange} />
                  </div>
                  <div className="col-sm-12 col-md-12">
                    <label className="form-label scandi-label">Yield Estimates (L / M / H %)</label>
                    <div className="input-group">
                      <input name="investRateLow" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateLow} onChange={handleConfigChange} />
                      <span className="input-group-text bg-light text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                      <input name="investRateMed" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateMed} onChange={handleConfigChange} />
                      <span className="input-group-text bg-light text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                      <input name="investRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark px-1 text-center" value={loanConfig.investRateHigh} onChange={handleConfigChange} />
                    </div>
                  </div>
                </div>

                {/* 3. Ongoing Contributions */}
                <h6 className="scandi-label text-muted mb-3 border-top border-light pt-4">Ongoing Contributions</h6>
                <div className="mb-4">
                  {investments.length === 0 && <div className="text-muted small fst-italic mb-3">No direct investments scheduled.</div>}
                  {investments.map(item => (
                    <StrategyRow 
                      key={item.id} 
                      item={item} 
                      onUpdate={(id, field, val) => updateStrategy(id, field, val, setInvestments)} 
                      onRemove={(id) => removeStrategy(id, setInvestments)} 
                    />
                  ))}
                  <button className="btn btn-sm btn-outline-dark fw-bold mt-2 mb-4 w-100" onClick={() => addStrategy(setInvestments, { amount: 0, frequency: 1, startDate: defaultStartDate })}>+ Add Investment</button>
                  
                  <div className="d-flex align-items-center gap-3">
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

                {/* 4. Retirement Phase */}
                <h6 className="scandi-label text-muted mb-3 border-top border-light pt-4">Retirement Phase</h6>
                <div className="mb-2">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <input 
                      className="scandi-checkbox" 
                      type="checkbox" 
                      name="enableRetirement" 
                      id="enableRetirementCheck"
                      checked={loanConfig.enableRetirement} 
                      onChange={handleConfigChange}
                    />
                    <label className="scandi-label m-0 text-black lh-sm" htmlFor="enableRetirementCheck" style={{ cursor: 'pointer' }}>
                      Enable Retirement Withdrawals
                    </label>
                  </div>

                  {loanConfig.enableRetirement && (
                    <div className="row g-3 align-items-end mt-1">
                      <div className="col-sm-6">
                        <label className="form-label scandi-label">Retirement Date</label>
                        <input name="retirementDate" type="date" className="form-control scandi-input border-dark" value={loanConfig.retirementDate} onChange={handleConfigChange} />
                      </div>
                      
                      <div className="col-sm-6">
                        <label className="form-label scandi-label">Withdrawal Type</label>
                        <select name="withdrawalType" className="form-select scandi-input border-dark" value={loanConfig.withdrawalType} onChange={handleConfigChange}>
                          <option value="percent">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>

                      <div className="col-sm-6">
                        {loanConfig.withdrawalType === 'percent' ? (
                          <>
                            <label className="form-label scandi-label">Yearly Pull (%)</label>
                            <input name="retirementWithdrawalRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.retirementWithdrawalRate} onChange={handleConfigChange} />
                          </>
                        ) : (
                          <>
                            <label className="form-label scandi-label">Yearly Pull ($)</label>
                            <input name="retirementFixedWithdrawal" type="number" step="1000" className="form-control scandi-input border-dark" value={loanConfig.retirementFixedWithdrawal} onChange={handleConfigChange} />
                          </>
                        )}
                      </div>

                      <div className="col-sm-6">
                        <label className="form-label scandi-label">Ret. Growth (%)</label>
                        <input name="retirementGrowthRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.retirementGrowthRate} onChange={handleConfigChange} />
                      </div>

                      <div className="col-12 mt-3">
                        <div className="d-flex align-items-center gap-3">
                          <input 
                            className="scandi-checkbox" 
                            type="checkbox" 
                            name="stopContributionsInRetirement" 
                            id="stopContribCheck"
                            checked={loanConfig.stopContributionsInRetirement} 
                            onChange={handleConfigChange}
                          />
                          <label className="scandi-label m-0 text-black lh-sm" htmlFor="stopContribCheck" style={{ cursor: 'pointer' }}>
                            Stop all new contributions at retirement
                          </label>
                        </div>
                      </div>
                      
                      {/* MONTE CARLO TRIGGER */}
                      <div className="col-12 mt-4 pt-4 border-top border-light">
                        <button className="btn btn-dark fw-bold w-100 py-2 scandi-label fs-6 text-uppercase" onClick={handleOpenMonteCarlo}>
                          Run Monte Carlo Analysis
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
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
                <th className="text-success scandi-label py-3 px-3">Withdrawn (Yr)</th>
                <th className="text-muted scandi-label py-3 px-3 d-none d-md-table-cell">Port. Low</th>
                <th className="text-black scandi-label py-3 px-3 fw-bolder">Port. Med</th>
                <th className="text-black scandi-label py-3 px-3 d-none d-md-table-cell">Port. High</th>
                <th className="text-black scandi-label py-3 px-3 fw-bolder">Net Worth (Med)</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {scheduleData.map((row) => (
                <tr key={row.year} className="border-bottom border-light">
                  <td className="text-start fw-bold text-black py-3 px-3">{row.year}</td>
                  <td className="text-muted py-3 px-3">{row.mortgageBalance > 0 ? `${row.activeRate.toFixed(3)}%` : '-'}</td>
                  <td className="fw-bold py-3 px-3">{formatCurrency(row.mortgageBalance)}</td>
                  <td className="text-danger fw-bold py-3 px-3">{formatCurrency(row.interestPaid)}</td>
                  <td className="py-3 px-3">{formatCurrency(row.homeMed)}</td>
                  <td className="py-3 px-3">{formatCurrency(row.investContributed)}</td>
                  <td className="text-success fw-bold py-3 px-3">{formatCurrency(row.withdrawn)}</td>
                  <td className="text-muted py-3 px-3 d-none d-md-table-cell">{formatCurrency(row.invLow)}</td>
                  <td className="text-black fw-bolder py-3 px-3">{formatCurrency(row.invMed)}</td>
                  <td className="text-dark fw-bold py-3 px-3 d-none d-md-table-cell">{formatCurrency(row.invHigh)}</td>
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

      </main>
    </div>
  );
}