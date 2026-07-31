import { describe, it, expect } from 'vitest';
import { calculateStandardPayment, getMonthOffset, randomNormal } from '../math.js';

describe('math engine utilities', () => {
  it('calculates standard monthly mortgage payment correctly', () => {
    // $400k at 6.5% for 30 yrs (360 mo) => approx $2528.27
    const pmt = calculateStandardPayment(400000, 6.5, 360);
    expect(pmt).toBeCloseTo(2528.27, 1);
  });

  it('handles 0% annual interest rate correctly', () => {
    const pmt = calculateStandardPayment(120000, 0, 120);
    expect(pmt).toBe(1000);
  });

  it('calculates month offset between dates correctly', () => {
    expect(getMonthOffset('2026-08-01', '2026-08-01')).toBe(1);
    expect(getMonthOffset('2026-08-01', '2027-08-01')).toBe(13);
    expect(getMonthOffset('2026-08-01', '2026-09-01')).toBe(2);
  });

  it('generates normally distributed random numbers with randomNormal', () => {
    const samples = Array.from({ length: 1000 }, () => randomNormal(0.08, 0.05));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeCloseTo(0.08, 1);
  });
});
