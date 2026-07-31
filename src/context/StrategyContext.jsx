import React, { useState, useMemo, useEffect } from 'react';
import { StrategyContext } from './StrategyContext.js';
import {
  ACTIVE_SESSION_KEY,
  defaultLoanConfig,
  defaultExtraPayments,
  defaultInvestments
} from '../lib/constants.js';
import { runSimulationEngine } from '../lib/engine/simulation.js';
import { runMonteCarloSimulation } from '../lib/engine/monteCarlo.js';

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

  // Deterministic simulation computed via engine library
  const { scheduleData, summary, initialBreakdown, monthContributions } = useMemo(() => {
    return runSimulationEngine(loanConfig, extraPayments, investments, rateAdjustments);
  }, [loanConfig, extraPayments, investments, rateAdjustments]);

  // Monte Carlo Execution Engine
  const handleOpenMonteCarlo = () => {
    setShowMonteCarloModal(true);
    setIsSimulating(true);
    setMonteCarloResults(null);
    
    setTimeout(() => {
      const results = runMonteCarloSimulation(monthContributions, loanConfig);
      setMonteCarloResults(results);
      setIsSimulating(false);
    }, 400); 
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
    handleConfigChange,
    addStrategy,
    removeStrategy,
    updateStrategy,
    scheduleData,
    summary,
    initialBreakdown,
    monthContributions,
    showMonteCarloModal,
    setShowMonteCarloModal,
    isSimulating,
    monteCarloResults,
    handleOpenMonteCarlo
  };

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  );
}
