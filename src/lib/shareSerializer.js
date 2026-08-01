import { defaultLoanConfig, defaultExtraPayments, defaultInvestments, defaultStartDate, defaultRetirementDate } from './constants.js';

export const encodeScenario = (statePayload) => {
  try {
    const cleanPayload = {
      v: 1,
      loanConfig: statePayload.loanConfig || {},
      extraPayments: statePayload.extraPayments || [],
      investments: statePayload.investments || [],
      rateAdjustments: statePayload.rateAdjustments || [],
      refinances: statePayload.refinances || [],
      viewMode: statePayload.viewMode || 'nominal'
    };
    const jsonStr = JSON.stringify(cleanPayload);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error("Failed to encode scenario payload", e);
    return null;
  }
};

export const decodeScenario = (encodedStr) => {
  if (!encodedStr) return null;
  try {
    const jsonStr = decodeURIComponent(atob(encodedStr));
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      loanConfig: { ...defaultLoanConfig, ...(parsed.loanConfig || {}) },
      extraPayments: Array.isArray(parsed.extraPayments) ? parsed.extraPayments : defaultExtraPayments,
      investments: Array.isArray(parsed.investments) ? parsed.investments : defaultInvestments,
      rateAdjustments: Array.isArray(parsed.rateAdjustments) ? parsed.rateAdjustments : [],
      refinances: Array.isArray(parsed.refinances) ? parsed.refinances : [],
      viewMode: parsed.viewMode === 'real' ? 'real' : 'nominal'
    };
  } catch (e) {
    return null;
  }
};

export const generateShareableUrl = (statePayload) => {
  const encoded = encodeScenario(statePayload);
  if (!encoded) return window.location.href;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?scenario=${encoded}`;
};

export const exportScenarioToJson = (statePayload, filename = 'strategy-scenario.json') => {
  try {
    const cleanPayload = {
      v: 1,
      exportedAt: new Date().toISOString(),
      loanConfig: statePayload.loanConfig || defaultLoanConfig,
      extraPayments: statePayload.extraPayments || defaultExtraPayments,
      investments: statePayload.investments || defaultInvestments,
      rateAdjustments: statePayload.rateAdjustments || [],
      refinances: statePayload.refinances || [],
      viewMode: statePayload.viewMode || 'nominal'
    };
    const blob = new Blob([JSON.stringify(cleanPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to export scenario JSON", e);
  }
};

export const importScenarioFromJson = (jsonContent) => {
  try {
    const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      loanConfig: { ...defaultLoanConfig, ...(parsed.loanConfig || {}) },
      extraPayments: Array.isArray(parsed.extraPayments) ? parsed.extraPayments : defaultExtraPayments,
      investments: Array.isArray(parsed.investments) ? parsed.investments : defaultInvestments,
      rateAdjustments: Array.isArray(parsed.rateAdjustments) ? parsed.rateAdjustments : [],
      refinances: Array.isArray(parsed.refinances) ? parsed.refinances : [],
      viewMode: parsed.viewMode === 'real' ? 'real' : 'nominal'
    };
  } catch (e) {
    return null;
  }
};

export const presetScenarios = {
  balanced: {
    name: 'Balanced Growth & Mortgage',
    description: 'Standard 30-year fixed mortgage with equal $500 monthly debt paydown and investment contributions.',
    data: {
      loanConfig: { ...defaultLoanConfig },
      extraPayments: [
        { id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }
      ],
      investments: [
        { id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }
      ],
      rateAdjustments: [],
      viewMode: 'nominal'
    }
  },
  aggressive_paydown: {
    name: 'Aggressive Debt Paydown',
    description: 'Accelerated bi-weekly payments with $1,200 monthly extra principal payments to erase debt early.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        isBiweekly: true,
        divertAfterPayoff: true
      },
      extraPayments: [
        { id: 1, amount: 1200, frequency: 1, startDate: defaultStartDate }
      ],
      investments: [
        { id: 1, amount: 200, frequency: 1, startDate: defaultStartDate }
      ],
      rateAdjustments: [],
      viewMode: 'nominal'
    }
  },
  fire_retirement: {
    name: 'FIRE / Early Retirement',
    description: 'Heavy investment phase followed by early retirement decumulation with 4% annual dynamic withdrawals.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        initialInvestment: 100000,
        enableRetirement: true,
        retirementDate: defaultRetirementDate,
        withdrawalType: 'percent_fixed',
        retirementWithdrawalRate: 4.0,
        retirementGrowthRate: 5.0,
        stopContributionsInRetirement: true
      },
      extraPayments: [],
      investments: [
        { id: 1, amount: 1500, frequency: 1, startDate: defaultStartDate }
      ],
      rateAdjustments: [],
      viewMode: 'real'
    }
  }
};
