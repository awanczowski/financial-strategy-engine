import {
  defaultLoanConfig,
  defaultExtraPayments,
  defaultInvestments,
  defaultTaxConfig,
  defaultSocialSecurityConfig,
  defaultStartDate,
  defaultRetirementDate
} from './constants.js';

/**
 * Encodes the active state payload into a URI-safe Base64 string for URL sharing.
 * @param {Object} statePayload Current application state containing loanConfig, extraPayments, investments, rateAdjustments, refinances, taxConfig, socialSecurityConfig, viewMode.
 * @returns {string|null} Encoded Base64 string or null on failure.
 */
export const encodeScenario = (statePayload) => {
  try {
    const cleanPayload = {
      v: 1,
      loanConfig: statePayload.loanConfig || {},
      extraPayments: statePayload.extraPayments || [],
      investments: statePayload.investments || [],
      rateAdjustments: statePayload.rateAdjustments || [],
      refinances: statePayload.refinances || [],
      taxConfig: statePayload.taxConfig || defaultTaxConfig,
      socialSecurityConfig: statePayload.socialSecurityConfig || defaultSocialSecurityConfig,
      viewMode: statePayload.viewMode || 'nominal'
    };
    const jsonStr = JSON.stringify(cleanPayload);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error("Failed to encode scenario payload", e);
    return null;
  }
};

/**
 * Decodes a URL scenario Base64 string into a complete application state object.
 * @param {string} encodedStr Encoded scenario parameter string from URL.
 * @returns {Object|null} Hydrated state object with fallback defaults, or null if invalid.
 */
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
      taxConfig: { ...defaultTaxConfig, ...(parsed.taxConfig || {}) },
      socialSecurityConfig: { ...defaultSocialSecurityConfig, ...(parsed.socialSecurityConfig || {}) },
      viewMode: parsed.viewMode === 'real' ? 'real' : 'nominal'
    };
  } catch (e) {
    return null;
  }
};

/**
 * Generates a full shareable URL pointing to the current scenario.
 * @param {Object} statePayload Current application state.
 * @returns {string} Absolute URL containing encoded scenario.
 */
export const generateShareableUrl = (statePayload) => {
  const encoded = encodeScenario(statePayload);
  if (!encoded) return window.location.href;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?scenario=${encoded}`;
};

/**
 * Exports current scenario configuration as a downloadable JSON file.
 * @param {Object} statePayload Current application state.
 * @param {string} filename Output file name.
 */
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
      taxConfig: statePayload.taxConfig || defaultTaxConfig,
      socialSecurityConfig: statePayload.socialSecurityConfig || defaultSocialSecurityConfig,
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

/**
 * Imports and validates scenario payload from raw JSON string or object.
 * @param {string|Object} jsonContent JSON text or parsed object.
 * @returns {Object|null} Validated scenario state object or null if parsing fails.
 */
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
      taxConfig: { ...defaultTaxConfig, ...(parsed.taxConfig || {}) },
      socialSecurityConfig: { ...defaultSocialSecurityConfig, ...(parsed.socialSecurityConfig || {}) },
      viewMode: parsed.viewMode === 'real' ? 'real' : 'nominal'
    };
  } catch (e) {
    return null;
  }
};

/**
 * Pre-configured financial strategy templates for instant scenario modeling.
 */
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
        { id: 1, amount: 500, frequency: 1, startDate: defaultStartDate, accountType: 'TAXABLE' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: { ...defaultTaxConfig },
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
        { id: 1, amount: 200, frequency: 1, startDate: defaultStartDate, accountType: 'TAXABLE' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: { ...defaultTaxConfig },
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
        { id: 1, amount: 1500, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_DEFERRED' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: { ...defaultTaxConfig },
      viewMode: 'real'
    }
  },
  tax_shield_strategy: {
    name: 'Tax-Shielded Wealth Strategy',
    description: 'Multi-bucket portfolio (Pre-Tax 401k & Roth IRA) coupled with active Tax Engine, property tax deduction, and MID shield.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        principal: 650000,
        mortgageRate: 6.875
      },
      extraPayments: [],
      investments: [
        { id: 1, amount: 800, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_DEFERRED' },
        { id: 2, amount: 500, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_FREE' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: {
        ...defaultTaxConfig,
        enableTaxEngine: true,
        jurisdiction: 'NY_NYC',
        filingStatus: 'MFJ',
        currentMarginalRate: 34.7,
        annualPropertyTax: 14000,
        saltCapLimit: '10000'
      },
      viewMode: 'nominal'
    }
  },
  refinance_rate_drop: {
    name: 'Refinance & Rate Drop',
    description: 'Initial 7.125% mortgage refinanced in Year 3 to 4.75% with $4,500 rolled closing costs, maintaining Pre-Tax and Roth investments.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        principal: 480000,
        mortgageRate: 7.125,
        years: 30
      },
      extraPayments: [],
      investments: [
        { id: 1, amount: 600, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_DEFERRED' },
        { id: 2, amount: 400, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_FREE' }
      ],
      rateAdjustments: [],
      refinances: [
        { id: 1, newRate: 4.75, newTermYears: 30, closingCosts: 4500, startDate: '2029-08-01' }
      ],
      taxConfig: {
        ...defaultTaxConfig,
        enableTaxEngine: true,
        jurisdiction: 'CA',
        filingStatus: 'MFJ',
        currentMarginalRate: 33.0,
        annualPropertyTax: 9500,
        saltCapLimit: '10000'
      },
      viewMode: 'nominal'
    }
  },
  biweekly_roth_ladder: {
    name: 'Bi-Weekly & Roth Divert',
    description: 'Accelerated 26-period bi-weekly payments with $1,000/mo extra paydown, maxing a Roth IRA and redirecting freed cash flow after payoff.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        principal: 380000,
        mortgageRate: 6.5,
        isBiweekly: true,
        divertAfterPayoff: true
      },
      extraPayments: [
        { id: 1, amount: 1000, frequency: 1, startDate: defaultStartDate }
      ],
      investments: [
        { id: 1, amount: 550, frequency: 1, startDate: defaultStartDate, accountType: 'TAX_FREE' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: {
        ...defaultTaxConfig,
        enableTaxEngine: true,
        jurisdiction: 'TX_FL',
        filingStatus: 'MFJ',
        currentMarginalRate: 24.0,
        annualPropertyTax: 8000,
        saltCapLimit: '10000'
      },
      viewMode: 'real'
    }
  },
  coast_fire_target: {
    name: 'Coast FIRE Target Strategy',
    description: 'Models reaching a Coast FIRE portfolio threshold by age 60 to cover $60,000/yr retirement expenses with compound growth.',
    data: {
      loanConfig: {
        ...defaultLoanConfig,
        enableRetirement: true,
        retirementDate: '2056-08-01',
        enableCoastFire: true,
        coastFireCurrentAge: 30,
        coastFireTargetAge: 60,
        coastFireTargetAnnualExpense: 60000,
        coastFireWithdrawalRate: 4.0,
        coastFireTargetAmount: 1500000,
        initialInvestment: 75000,
        investRateMed: 8.0,
        simulationYears: 40
      },
      extraPayments: [
        { id: 1, amount: 200, frequency: 1, startDate: defaultStartDate }
      ],
      investments: [
        { id: 1, amount: 800, frequency: 1, startDate: defaultStartDate, accountType: 'TAXABLE' }
      ],
      rateAdjustments: [],
      refinances: [],
      taxConfig: { ...defaultTaxConfig },
      socialSecurityConfig: { ...defaultSocialSecurityConfig },
      viewMode: 'nominal'
    }
  }
};
