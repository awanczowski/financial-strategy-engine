import { describe, it, expect } from 'vitest';
import { runSimulationEngine } from '../simulation.js';
import { runMonteCarloSimulation } from '../monteCarlo.js';
import { defaultLoanConfig } from '../../constants.js';

describe('runMonteCarloSimulation', () => {
  it('runs Monte Carlo simulations and returns low, med, high results with multi-percentile data', () => {
    const simResult = runSimulationEngine(defaultLoanConfig, [], [], []);
    const mcResults = runMonteCarloSimulation(simResult.monthContributions, defaultLoanConfig);

    expect(mcResults.low).toBeDefined();
    expect(mcResults.med).toBeDefined();
    expect(mcResults.high).toBeDefined();

    expect(mcResults.low.successRate).toBeGreaterThanOrEqual(0);
    expect(mcResults.low.successRate).toBeLessThanOrEqual(100);

    expect(mcResults.med.chartData.length).toBeGreaterThan(0);
    expect(mcResults.med.chartData[0]).toHaveProperty('p10');
    expect(mcResults.med.chartData[0]).toHaveProperty('p25');
    expect(mcResults.med.chartData[0]).toHaveProperty('p50');
    expect(mcResults.med.chartData[0]).toHaveProperty('p75');
    expect(mcResults.med.chartData[0]).toHaveProperty('p90');

    expect(mcResults.med.chartData[0]).toHaveProperty('p10Real');
    expect(mcResults.med.chartData[0]).toHaveProperty('p50Real');
    expect(mcResults.med.chartData[0]).toHaveProperty('p90Real');
  });

  it('supports custom volatility and iteration count overrides', () => {
    const simResult = runSimulationEngine(defaultLoanConfig, [], [], []);
    const mcResults = runMonteCarloSimulation(simResult.monthContributions, defaultLoanConfig, {
      volatility: 25,
      iterations: 500
    });

    expect(mcResults.volatility).toBe(25);
    expect(mcResults.iterations).toBe(500);
    expect(mcResults.low.chartData.length).toBeGreaterThan(0);
    expect(mcResults.high.chartData.length).toBeGreaterThan(0);
  });
});

