import { describe, it, expect } from 'vitest';
import { encodeScenario, decodeScenario, presetScenarios } from '../shareSerializer.js';
import { defaultLoanConfig } from '../constants.js';

describe('shareSerializer', () => {
  it('encodes and decodes scenario payload correctly', () => {
    const payload = {
      loanConfig: { ...defaultLoanConfig, principal: 550000, mortgageRate: 5.8 },
      extraPayments: [{ id: 1, amount: 750, frequency: 1, startDate: '2026-09-01' }],
      investments: [{ id: 1, amount: 1000, frequency: 1, startDate: '2026-09-01' }],
      rateAdjustments: [{ id: 1, rate: 7.2, startDate: '2031-09-01' }],
      viewMode: 'real'
    };

    const encoded = encodeScenario(payload);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeScenario(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded.loanConfig.principal).toBe(550000);
    expect(decoded.loanConfig.mortgageRate).toBe(5.8);
    expect(decoded.extraPayments[0].amount).toBe(750);
    expect(decoded.investments[0].amount).toBe(1000);
    expect(decoded.rateAdjustments[0].rate).toBe(7.2);
    expect(decoded.viewMode).toBe('real');
  });

  it('handles invalid or corrupted encoded strings gracefully', () => {
    expect(decodeScenario(null)).toBeNull();
    expect(decodeScenario('')).toBeNull();
    expect(decodeScenario('invalid-base64-content!@#$')).toBeNull();
  });

  it('provides built-in presets with valid data schemas', () => {
    expect(presetScenarios.balanced).toBeDefined();
    expect(presetScenarios.aggressive_paydown).toBeDefined();
    expect(presetScenarios.fire_retirement).toBeDefined();

    const firePreset = presetScenarios.fire_retirement.data;
    expect(firePreset.loanConfig.enableRetirement).toBe(true);
    expect(firePreset.viewMode).toBe('real');
  });
});
