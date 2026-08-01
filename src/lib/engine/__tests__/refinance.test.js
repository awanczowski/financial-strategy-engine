import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { defaultLoanConfig } from '../../constants.js';

describe('Mortgage Refinance Engine & Breakeven Analysis', () => {
  it('calculates updated payment, monthly interest savings, and breakeven point upon refinance', () => {
    const refinances = [
      { id: 1, newRate: 4.5, newTermYears: 30, closingCosts: 5000, startDate: "2029-08-01" } // 3 years (36 months) in
    ];

    const result = runSimulationEngine(defaultLoanConfig, [], [], [], refinances);
    
    expect(result.summary.refinanceEvents).toBeDefined();
    expect(result.summary.refinanceEvents).toHaveLength(1);

    const refEvent = result.summary.refinanceEvents[0];
    expect(refEvent.month).toBe(37); // Month 37 offset
    expect(refEvent.newRate).toBe(4.5);
    expect(refEvent.closingCosts).toBe(5000);
    expect(refEvent.monthlyInterestSavings).toBeGreaterThan(0);
    expect(refEvent.breakevenMonthsInterest).toBeGreaterThan(0);
    expect(refEvent.breakevenYearsInterest).toBeCloseTo(refEvent.breakevenMonthsInterest / 12, 1);
  });

  it('correctly recalculates amortization schedule when refinancing to a shorter 15-year term', () => {
    const refinances = [
      { id: 1, newRate: 5.0, newTermYears: 15, closingCosts: 3000, startDate: "2031-08-01" } // 5 years in
    ];

    const baseResult = runSimulationEngine(defaultLoanConfig, [], [], [], []);
    const refResult = runSimulationEngine(defaultLoanConfig, [], [], [], refinances);

    // Payoff string should reflect accelerated term from 15-year refinance
    expect(refResult.summary.payoffString).not.toBe(baseResult.summary.payoffString);
  });

  it('handles multiple sequential refinances over loan life', () => {
    const refinances = [
      { id: 1, newRate: 5.5, newTermYears: 30, closingCosts: 4000, startDate: "2028-08-01" }, // Year 2
      { id: 2, newRate: 4.25, newTermYears: 30, closingCosts: 3500, startDate: "2031-08-01" } // Year 5
    ];

    const result = runSimulationEngine(defaultLoanConfig, [], [], [], refinances);

    expect(result.summary.refinanceEvents).toHaveLength(2);
    expect(result.summary.refinanceEvents[0].newRate).toBe(5.5);
    expect(result.summary.refinanceEvents[1].newRate).toBe(4.25);
  });
});
