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
      initialInvestment: 500000,
      enableRetirement: true,
      retirementDate: "2036-08-01", // Retire 10 yrs in
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 50000,
      stopContributionsInRetirement: true
    };

    const result = runSimulationEngine(configWithRetirement, defaultExtraPayments, defaultInvestments, []);
    expect(result.summary.totalWithdrawnOverall).toBeGreaterThan(0);
  });

  it('calculates inflation-adjusted real purchasing power fields', () => {
    const configWithInflation = {
      ...defaultLoanConfig,
      estimatedInflationRate: 3.0
    };

    const result = runSimulationEngine(configWithInflation, defaultExtraPayments, defaultInvestments, []);
    
    // Real net worth should be less than nominal net worth due to present value discounting
    expect(result.summary.finalNetWorthMedReal).toBeLessThan(result.summary.finalNetWorthMed);
    expect(result.scheduleData[10].netWorthMedReal).toBeLessThan(result.scheduleData[10].netWorthMed);
  });

  it('escalates fixed retirement withdrawals annually by estimated inflation rate', () => {
    const configNoInflation = {
      ...defaultLoanConfig,
      initialInvestment: 500000,
      enableRetirement: true,
      retirementDate: "2026-08-01", // Retire immediately
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 20000,
      estimatedInflationRate: 0.0
    };

    const configWithInflation = {
      ...defaultLoanConfig,
      initialInvestment: 500000,
      enableRetirement: true,
      retirementDate: "2026-08-01",
      withdrawalType: 'fixed',
      retirementFixedWithdrawal: 20000,
      estimatedInflationRate: 3.0
    };

    const resNoInfl = runSimulationEngine(configNoInflation, [], [], []);
    const resWithInfl = runSimulationEngine(configWithInflation, [], [], []);

    // With inflation escalation, overall nominal withdrawals will be higher over time
    expect(resWithInfl.summary.totalWithdrawnOverall).toBeGreaterThan(resNoInfl.summary.totalWithdrawnOverall);
  });

  it('handles mortgage refinance events correctly', () => {
    const refinances = [
      { id: 101, startDate: "2031-08-01", newRate: 4.5, newTermYears: 30, closingCosts: 5000 }
    ];

    const baseline = runSimulationEngine(defaultLoanConfig, [], [], [], []);
    const withRefinance = runSimulationEngine(defaultLoanConfig, [], [], [], refinances);

    expect(withRefinance.summary.refinanceEvents).toHaveLength(1);
    const refEvent = withRefinance.summary.refinanceEvents[0];

    expect(refEvent.closingCosts).toBe(5000);
    expect(refEvent.newRate).toBe(4.5);
    expect(refEvent.newTermYears).toBe(30);
    expect(refEvent.monthlyInterestSavings).toBeGreaterThan(0);
    expect(refEvent.breakevenMonthsInterest).toBeGreaterThan(0);
    expect(refEvent.newPayment).toBeLessThan(refEvent.oldPayment);
    expect(withRefinance.summary.totalInterestPaid).toBeLessThan(baseline.summary.totalInterestPaid);
  });
});

