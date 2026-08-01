import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { runMonteCarloSimulation } from '../monteCarlo.js';
import { defaultLoanConfig, defaultTaxConfig, defaultSocialSecurityConfig } from '../../constants.js';
import { encodeScenario, decodeScenario } from '../../shareSerializer.js';

describe('Social Security Engine', () => {
  it('calculates Self and Spouse monthly Social Security benefits and offsets required retirement withdrawals', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      initialInvestment: 500000,
      simulationYears: 30,
      enableRetirement: true,
      retirementDate: '2046-08-01', // Year 20 in retirement
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 48000 // $4,000/mo requested
    };

    const ssConfig = {
      enableSocialSecurity: true,
      selfMonthlyBenefit: 2000,
      selfStartDate: '2046-08-01',
      enableSpouseSS: true,
      spouseMonthlyBenefit: 1500,
      spouseStartDate: '2046-08-01',
      annualColaRate: 0 // Keep COLA at 0 for deterministic monthly math
    };

    const resultWithSS = runSimulationEngine(
      loanConfig,
      [],
      [],
      [],
      [],
      defaultTaxConfig,
      ssConfig
    );

    const resultWithoutSS = runSimulationEngine(
      loanConfig,
      [],
      [],
      [],
      [],
      defaultTaxConfig,
      { ...ssConfig, enableSocialSecurity: false }
    );

    expect(resultWithSS.summary.totalSocialSecurityIncome).toBeGreaterThan(0);
    // With $3,500/mo ($42k/yr) Social Security income, portfolio withdrawals drop from $48k/yr to $6k/yr ($500/mo)
    expect(resultWithSS.summary.totalWithdrawnOverall).toBeLessThan(resultWithoutSS.summary.totalWithdrawnOverall);
    expect(resultWithSS.summary.finalInvMed).toBeGreaterThan(resultWithoutSS.summary.finalInvMed);
  });

  it('reinvests excess Social Security income into investments when Social Security exceeds requested withdrawal', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      simulationYears: 30,
      enableRetirement: true,
      retirementDate: '2046-08-01',
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 12000 // $1,000/mo requested
    };

    const ssConfig = {
      enableSocialSecurity: true,
      selfMonthlyBenefit: 2500, // $2,500/mo SS > $1,000/mo requested
      selfStartDate: '2046-08-01',
      enableSpouseSS: false,
      annualColaRate: 0
    };

    const result = runSimulationEngine(
      loanConfig,
      [],
      [],
      [],
      [],
      defaultTaxConfig,
      ssConfig
    );

    // Requested withdrawal is $0 from portfolio because SS covers it entirely ($1,500/mo excess reinvested)
    expect(result.summary.totalWithdrawnOverall).toBe(0);
    expect(result.summary.totalSocialSecurityIncome).toBe(2500 * 12 * 10); // 10 years in retirement
  });

  it('encodes and decodes socialSecurityConfig in URL scenario payload', () => {
    const statePayload = {
      loanConfig: defaultLoanConfig,
      socialSecurityConfig: {
        enableSocialSecurity: true,
        selfMonthlyBenefit: 3100,
        selfStartDate: '2048-08-01',
        enableSpouseSS: true,
        spouseMonthlyBenefit: 2200,
        spouseStartDate: '2050-08-01',
        annualColaRate: 2.8
      }
    };

    const encoded = encodeScenario(statePayload);
    expect(typeof encoded).toBe('string');

    const decoded = decodeScenario(encoded);
    expect(decoded.socialSecurityConfig.enableSocialSecurity).toBe(true);
    expect(decoded.socialSecurityConfig.selfMonthlyBenefit).toBe(3100);
    expect(decoded.socialSecurityConfig.selfStartDate).toBe('2048-08-01');
    expect(decoded.socialSecurityConfig.spouseMonthlyBenefit).toBe(2200);
    expect(decoded.socialSecurityConfig.annualColaRate).toBe(2.8);
  });

  it('incorporates Social Security income into Monte Carlo simulation risk modeling', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      initialInvestment: 200000,
      simulationYears: 30,
      enableRetirement: true,
      retirementDate: '2036-08-01',
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 40000
    };

    const ssConfig = {
      enableSocialSecurity: true,
      selfMonthlyBenefit: 2500,
      selfStartDate: '2036-08-01',
      enableSpouseSS: true,
      spouseMonthlyBenefit: 1500,
      spouseStartDate: '2036-08-01',
      annualColaRate: 2.5
    };

    const monthContributions = new Array(360).fill(0);

    const mcWithSS = runMonteCarloSimulation(monthContributions, loanConfig, { iterations: 100 }, ssConfig);
    const mcWithoutSS = runMonteCarloSimulation(monthContributions, loanConfig, { iterations: 100 }, { ...ssConfig, enableSocialSecurity: false });

    expect(mcWithSS.med.successRate).toBeGreaterThanOrEqual(mcWithoutSS.med.successRate);
  });
});
