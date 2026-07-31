import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { runMonteCarloSimulation } from '../monteCarlo.js';
import { defaultLoanConfig } from '../../constants.js';

describe('runMonteCarloSimulation', () => {
  it('runs Monte Carlo simulations and returns low, med, high results', () => {
    const simResult = runSimulationEngine(defaultLoanConfig, [], [], []);
    const mcResults = runMonteCarloSimulation(simResult.monthContributions, defaultLoanConfig);

    expect(mcResults.low).toBeDefined();
    expect(mcResults.med).toBeDefined();
    expect(mcResults.high).toBeDefined();

    expect(mcResults.low.successRate).toBeGreaterThanOrEqual(0);
    expect(mcResults.low.successRate).toBeLessThanOrEqual(100);

    expect(mcResults.med.chartData.length).toBeGreaterThan(0);
    expect(mcResults.med.chartData[0]).toHaveProperty('p10');
    expect(mcResults.med.chartData[0]).toHaveProperty('p50');
    expect(mcResults.med.chartData[0]).toHaveProperty('p90');
  });
});
