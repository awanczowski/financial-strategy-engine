import React, { useState, useMemo, useEffect } from 'react';
import { StrategyContext } from './StrategyContext.js';
import {
  ACTIVE_SESSION_KEY,
  defaultLoanConfig,
  defaultExtraPayments,
  defaultInvestments,
  defaultRefinances,
  defaultTaxConfig
} from '../lib/constants.js';
import { runSimulationEngine } from '../lib/engine/simulation.js';
import { runMonteCarloSimulation } from '../lib/engine/monteCarlo.js';
import { decodeScenario } from '../lib/shareSerializer.js';

const loadActiveSession = () => {
  if (typeof window === 'undefined') return null;
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

export function StrategyProvider({ children }) {
  const activeSession = loadActiveSession();

  const [loanConfig, setLoanConfig] = useState(activeSession?.loanConfig || defaultLoanConfig);
  const [extraPayments, setExtraPayments] = useState(activeSession?.extraPayments || defaultExtraPayments);
  const [investments, setInvestments] = useState(activeSession?.investments || defaultInvestments);
  const [rateAdjustments, setRateAdjustments] = useState(activeSession?.rateAdjustments || []);
  const [refinances, setRefinances] = useState(activeSession?.refinances || defaultRefinances);
  const [taxConfig, setTaxConfig] = useState(activeSession?.taxConfig || defaultTaxConfig);
  const [viewMode, setViewMode] = useState(activeSession?.viewMode || 'nominal'); // 'nominal' | 'real'

  // Monte Carlo State
  const [showMonteCarloModal, setShowMonteCarloModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);

  // Share & Toast State
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // URL Auto-Hydration for Shared Links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedCode = params.get('scenario');
      if (sharedCode) {
        const decoded = decodeScenario(sharedCode);
        if (decoded) {
          setLoanConfig(decoded.loanConfig);
          setExtraPayments(decoded.extraPayments);
          setInvestments(decoded.investments);
          setRateAdjustments(decoded.rateAdjustments);
          if (decoded.refinances) setRefinances(decoded.refinances);
          if (decoded.taxConfig) setTaxConfig(decoded.taxConfig);
          setViewMode(decoded.viewMode);
          showToast("Loaded shared strategy scenario!");

          // Clean scenario parameter from URL bar without page reload
          const cleanUrl = `${window.location.pathname}${window.location.hash}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    }
  }, []);

  const loadScenario = (data) => {
    if (!data) return;
    if (data.loanConfig) setLoanConfig({ ...defaultLoanConfig, ...data.loanConfig });
    if (Array.isArray(data.extraPayments)) setExtraPayments(data.extraPayments);
    if (Array.isArray(data.investments)) setInvestments(data.investments);
    if (Array.isArray(data.rateAdjustments)) setRateAdjustments(data.rateAdjustments);
    if (Array.isArray(data.refinances)) setRefinances(data.refinances);
    if (data.taxConfig) setTaxConfig({ ...defaultTaxConfig, ...data.taxConfig });
    if (data.viewMode) setViewMode(data.viewMode);
  };

  useEffect(() => {
    const sessionData = {
      loanConfig,
      extraPayments,
      investments,
      rateAdjustments,
      refinances,
      taxConfig,
      viewMode
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
  }, [loanConfig, extraPayments, investments, rateAdjustments, refinances, taxConfig, viewMode]);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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

  const handleTaxConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : (name === 'jurisdiction' || name === 'filingStatus' || name === 'saltCapLimit' ? value : (value === '' ? '' : Number(value)));

    setTaxConfig(prev => {
      const updated = { ...prev, [name]: finalValue };
      if (name === 'jurisdiction') {
        if (value === 'NY_NYC') {
          updated.currentMarginalRate = 34.7;
        } else if (value === 'CA') {
          updated.currentMarginalRate = 33.0;
        } else if (value === 'TX_FL') {
          updated.currentMarginalRate = 24.0;
        }
      }
      return updated;
    });
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

  // Deterministic simulation computed via engine library
  const { scheduleData, summary, initialBreakdown, monthContributions } = useMemo(() => {
    return runSimulationEngine(loanConfig, extraPayments, investments, rateAdjustments, refinances, taxConfig);
  }, [loanConfig, extraPayments, investments, rateAdjustments, refinances, taxConfig]);

  // Derived active summary and schedule data based on viewMode ('nominal' vs 'real')
  const activeSummary = useMemo(() => {
    if (viewMode === 'real') {
      return {
        ...summary,
        totalInterestPaid: summary.totalInterestPaidReal,
        totalInvestContributed: summary.totalInvestContributedReal,
        totalWithdrawnOverall: summary.totalWithdrawnOverallReal,
        finalHomeLow: summary.finalHomeLowReal,
        finalHomeMed: summary.finalHomeMedReal,
        finalHomeHigh: summary.finalHomeHighReal,
        finalInvLow: summary.finalInvLowReal,
        finalInvMed: summary.finalInvMedReal,
        finalInvHigh: summary.finalInvHighReal,
        finalNetWorthLow: summary.finalNetWorthLowReal,
        finalNetWorthMed: summary.finalNetWorthMedReal,
        finalNetWorthHigh: summary.finalNetWorthHighReal
      };
    }
    return summary;
  }, [summary, viewMode]);

  const activeScheduleData = useMemo(() => {
    if (viewMode === 'real') {
      return scheduleData.map(row => ({
        ...row,
        mortgageBalance: row.mortgageBalanceReal,
        homeMed: row.homeMedReal,
        invLow: row.invLowReal,
        invMed: row.invMedReal,
        invHigh: row.invHighReal,
        netWorthLow: row.netWorthLowReal,
        netWorthMed: row.netWorthMedReal,
        netWorthHigh: row.netWorthHighReal,
        mortgagePaid: row.mortgagePaidReal,
        interestPaid: row.interestPaidReal,
        investContributed: row.investContributedReal,
        withdrawn: row.withdrawnReal
      }));
    }
    return scheduleData;
  }, [scheduleData, viewMode]);

  // Monte Carlo Execution Engine
  const handleOpenMonteCarlo = (overrideOptions = {}) => {
    setShowMonteCarloModal(true);
    setIsSimulating(true);
    
    setTimeout(() => {
      const results = runMonteCarloSimulation(monthContributions, loanConfig, overrideOptions);
      setMonteCarloResults(results);
      setIsSimulating(false);
    }, 250); 
  };

  const value = {
    loanConfig,
    setLoanConfig,
    extraPayments,
    setExtraPayments,
    investments,
    setInvestments,
    rateAdjustments,
    setRateAdjustments,
    refinances,
    setRefinances,
    taxConfig,
    setTaxConfig,
    handleTaxConfigChange,
    viewMode,
    setViewMode,
    handleConfigChange,
    addStrategy,
    removeStrategy,
    updateStrategy,
    scheduleData,
    activeScheduleData,
    summary,
    activeSummary,
    initialBreakdown,
    monthContributions,
    showMonteCarloModal,
    setShowMonteCarloModal,
    isSimulating,
    monteCarloResults,
    handleOpenMonteCarlo,
    showShareModal,
    setShowShareModal,
    loadScenario,
    showToast,
    toastMessage
  };

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  );
}
