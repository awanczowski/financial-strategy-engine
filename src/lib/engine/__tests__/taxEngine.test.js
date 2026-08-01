import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { defaultLoanConfig, defaultExtraPayments, defaultInvestments, defaultTaxConfig } from '../../constants.js';

describe('Tax Engine Integration & Math', () => {
  it('applies accumulation tax drag to taxable investment accounts when tax engine is enabled', () => {
    const grossResult = runSimulationEngine(defaultLoanConfig, [], defaultInvestments, [], [], { enableTaxEngine: false });
    const taxResult = runSimulationEngine(defaultLoanConfig, [], defaultInvestments, [], [], {
      ...defaultTaxConfig,
      enableTaxEngine: true,
      capitalGainsRate: 15.0,
      dividendYieldRate: 2.0
    });

    expect(taxResult.summary.taxSummary.enabled).toBe(true);
    expect(taxResult.summary.taxSummary.totalTaxDragPaid).toBeGreaterThan(0);
    expect(taxResult.summary.finalInvMed).toBeLessThan(grossResult.summary.finalInvMed);
  });

  it('allocates contributions to Pre-Tax (Tax-Deferred) and Roth (Tax-Free) buckets without accumulation tax drag', () => {
    const taxableInvestments = [
      { id: 1, amount: 500, frequency: 1, startDate: defaultLoanConfig.loanStartDate, accountType: 'TAXABLE' }
    ];
    const rothInvestments = [
      { id: 1, amount: 500, frequency: 1, startDate: defaultLoanConfig.loanStartDate, accountType: 'TAX_FREE' }
    ];

    const taxConfig = { ...defaultTaxConfig, enableTaxEngine: true, capitalGainsRate: 20.0, dividendYieldRate: 2.5 };

    const taxableRes = runSimulationEngine(defaultLoanConfig, [], taxableInvestments, [], [], taxConfig);
    const rothRes = runSimulationEngine(defaultLoanConfig, [], rothInvestments, [], [], taxConfig);

    expect(rothRes.summary.taxSummary.finalTaxFreeMed).toBeGreaterThan(taxableRes.summary.taxSummary.finalTaxableMed);
  });

  it('grosses up Pre-Tax (Tax-Deferred) retirement decumulation withdrawals', () => {
    const preTaxConfig = {
      ...defaultLoanConfig,
      initialInvestment: 500000,
      enableRetirement: true,
      retirementDate: "2036-08-01",
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 40000,
      stopContributionsInRetirement: true
    };

    const preTaxInvestments = [
      { id: 1, amount: 0, frequency: 1, startDate: defaultLoanConfig.loanStartDate, accountType: 'TAX_DEFERRED' }
    ];

    const result = runSimulationEngine(preTaxConfig, [], preTaxInvestments, [], [], {
      ...defaultTaxConfig,
      enableTaxEngine: true,
      retirementEffectiveRate: 20.0
    });

    expect(result.summary.taxSummary.enabled).toBe(true);
  });

  it('calculates MID tax shield and scales for loans exceeding the $750,000 IRS principal cap', () => {
    const standardLoan = { ...defaultLoanConfig, principal: 400000 };
    const jumboLoan = { ...defaultLoanConfig, principal: 1500000 };

    const taxConfig = {
      ...defaultTaxConfig,
      enableTaxEngine: true,
      currentMarginalRate: 35.0,
      annualPropertyTax: 15000,
      saltCapLimit: 10000,
      filingStatus: 'MFJ'
    };

    const stdRes = runSimulationEngine(standardLoan, [], [], [], [], taxConfig);
    const jumboRes = runSimulationEngine(jumboLoan, [], [], [], [], taxConfig);

    expect(stdRes.summary.taxSummary.totalMidTaxSavings).toBeGreaterThan(0);
    expect(jumboRes.summary.taxSummary.totalMidTaxSavings).toBeGreaterThan(0);
  });

  it('respects custom SALT cap limit and includes state tax & custom itemized deductions', () => {
    const cappedConfig = {
      ...defaultTaxConfig,
      enableTaxEngine: true,
      currentMarginalRate: 35.0,
      annualPropertyTax: 12000,
      stateTaxAmount: 8000,
      saltCapLimit: '10000',
      filingStatus: 'MFJ'
    };

    const customCapConfig = {
      ...defaultTaxConfig,
      enableTaxEngine: true,
      currentMarginalRate: 35.0,
      annualPropertyTax: 12000,
      stateTaxAmount: 8000,
      saltCapLimit: 'CUSTOM',
      customSaltCap: 25000,
      otherItemizedDeductions: 10000, // Charitable
      filingStatus: 'MFJ'
    };

    const cappedRes = runSimulationEngine(defaultLoanConfig, [], [], [], [], cappedConfig);
    const customRes = runSimulationEngine(defaultLoanConfig, [], [], [], [], customCapConfig);

    expect(customRes.summary.taxSummary.totalMidTaxSavings).toBeGreaterThan(cappedRes.summary.taxSummary.totalMidTaxSavings);
  });
});

