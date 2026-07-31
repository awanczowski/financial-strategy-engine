import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { defaultLoanConfig, defaultExtraPayments, defaultInvestments } from '../../constants.js';

describe('runSimulationEngine', () => {
  it('runs deterministic simulation and produces valid summary output', () => {
    const result = runSimulationEngine(defaultLoanConfig, defaultExtraPayments, defaultInvestments, []);
    
    expect(result.scheduleData.length).toBe(defaultLoanConfig.simulationYears);
    expect(result.monthContributions.length).toBe(defaultLoanConfig.simulationYears * 12);
    expect(result.initialBreakdown).toBeDefined();
    expect(result.summary.totalInterestPaid).toBeGreaterThan(0);
    expect(result.summary.payoffString).toMatch(/Yr \d+, Mo \d+/);
  });

  it('accelerates loan payoff when biweekly payments are enabled', () => {
    const monthlyResult = runSimulationEngine({ ...defaultLoanConfig, isBiweekly: false }, [], [], []);
    const biweeklyResult = runSimulationEngine({ ...defaultLoanConfig, isBiweekly: true }, [], [], []);
    
    expect(biweeklyResult.summary.totalInterestPaid).toBeLessThan(monthlyResult.summary.totalInterestPaid);
  });

  it('handles retirement decumulation phase correctly', () => {
    const configWithRetirement = {
      ...defaultLoanConfig,
      enableRetirement: true,
      retirementDate: "2036-08-01", // Retire 10 yrs in
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 50000,
      stopContributionsInRetirement: true
    };

    const result = runSimulationEngine(configWithRetirement, defaultExtraPayments, defaultInvestments, []);
    expect(result.summary.totalWithdrawnOverall).toBeGreaterThan(0);
  });
});
