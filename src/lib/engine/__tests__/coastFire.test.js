import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { defaultLoanConfig } from '../../constants.js';

describe('Coast FIRE Simulation Engine', () => {
  it('correctly calculates Coast FIRE required target today and marks when achieved', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      initialInvestment: 100000,
      investRateMed: 8.0,
      simulationYears: 40,
      enableCoastFire: true,
      coastFireCurrentAge: 30,
      coastFireTargetAge: 60,
      coastFireTargetAnnualExpense: 60000,
      coastFireWithdrawalRate: 4.0,
      coastFireTargetAmount: 1500000
    };

    const investments = [
      { id: 1, amount: 1000, frequency: 1, startDate: defaultLoanConfig.loanStartDate, accountType: 'TAXABLE' }
    ];

    const result = runSimulationEngine(loanConfig, [], investments);
    const { coastFireSummary } = result.summary;

    expect(coastFireSummary).toBeDefined();
    expect(coastFireSummary.enabled).toBe(true);
    expect(coastFireSummary.fullFireTarget).toBe(1500000);
    
    // $1.5M / (1.08)^30 = ~$149,066 required today
    expect(coastFireSummary.requiredToday).toBeGreaterThan(140000);
    expect(coastFireSummary.requiredToday).toBeLessThan(160000);

    // Initial investment is $100k plus $1,000/mo ongoing -> achieved within first few years
    expect(coastFireSummary.achieved).toBe(true);
    expect(coastFireSummary.achievedAge).toBeGreaterThanOrEqual(30);
    expect(coastFireSummary.achievedAge).toBeLessThan(40);
  });

  it('handles scenario where Coast FIRE is already achieved at start', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      initialInvestment: 300000, // Starting above required target of ~$149k
      investRateMed: 8.0,
      simulationYears: 30,
      enableCoastFire: true,
      coastFireCurrentAge: 30,
      coastFireTargetAge: 60,
      coastFireTargetAmount: 1500000
    };

    const result = runSimulationEngine(loanConfig);
    const { coastFireSummary } = result.summary;

    expect(coastFireSummary.achieved).toBe(true);
    expect(coastFireSummary.achievedAge).toBe(30);
    expect(coastFireSummary.achievedYear).toBe(1);
    expect(coastFireSummary.percentAchievedToday).toBeGreaterThanOrEqual(100);
  });

  it('returns achieved = false if portfolio never reaches required target', () => {
    const loanConfig = {
      ...defaultLoanConfig,
      initialInvestment: 0,
      investRateMed: 2.0, // Low growth
      simulationYears: 10,
      enableCoastFire: true,
      coastFireCurrentAge: 30,
      coastFireTargetAge: 60,
      coastFireTargetAmount: 2000000
    };

    const result = runSimulationEngine(loanConfig);
    const { coastFireSummary } = result.summary;

    expect(coastFireSummary.enabled).toBe(true);
    expect(coastFireSummary.achieved).toBe(false);
    expect(coastFireSummary.achievedAge).toBeNull();
  });
});
