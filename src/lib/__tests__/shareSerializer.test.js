import { describe, it, expect } from 'vitest';
import { encodeScenario, decodeScenario, importScenarioFromJson, presetScenarios } from '../shareSerializer.js';
import { defaultLoanConfig, defaultTaxConfig } from '../constants.js';

describe('shareSerializer', () => {
  it('encodes and decodes full scenario payload including refinances, multi-bucket investments, and taxConfig', () => {
    const payload = {
      loanConfig: { ...defaultLoanConfig, principal: 550000, mortgageRate: 5.8 },
      extraPayments: [{ id: 1, amount: 750, frequency: 1, startDate: '2026-09-01' }],
      investments: [
        { id: 1, amount: 1000, frequency: 1, startDate: '2026-09-01', accountType: 'TAX_DEFERRED' },
        { id: 2, amount: 500, frequency: 1, startDate: '2026-09-01', accountType: 'TAX_FREE' }
      ],
      rateAdjustments: [{ id: 1, rate: 7.2, startDate: '2031-09-01' }],
      refinances: [{ id: 1, newRate: 4.5, newTermYears: 30, closingCosts: 4000, startDate: '2029-08-01' }],
      taxConfig: {
        ...defaultTaxConfig,
        enableTaxEngine: true,
        jurisdiction: 'NY_NYC',
        currentMarginalRate: 34.7,
        annualPropertyTax: 15000,
        saltCapLimit: 'CUSTOM',
        customSaltCap: 25000
      },
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
    expect(decoded.investments[0].accountType).toBe('TAX_DEFERRED');
    expect(decoded.investments[1].accountType).toBe('TAX_FREE');
    expect(decoded.rateAdjustments[0].rate).toBe(7.2);
    expect(decoded.refinances[0].newRate).toBe(4.5);
    expect(decoded.taxConfig.enableTaxEngine).toBe(true);
    expect(decoded.taxConfig.jurisdiction).toBe('NY_NYC');
    expect(decoded.taxConfig.saltCapLimit).toBe('CUSTOM');
    expect(decoded.taxConfig.customSaltCap).toBe(25000);
    expect(decoded.viewMode).toBe('real');
  });

  it('imports scenario payload from JSON content string', () => {
    const rawJson = JSON.stringify({
      v: 1,
      loanConfig: { principal: 450000, mortgageRate: 6.25 },
      extraPayments: [],
      investments: [{ id: 10, amount: 600, frequency: 1, startDate: '2026-08-01', accountType: 'TAXABLE' }],
      refinances: [{ id: 1, newRate: 5.0, newTermYears: 15, closingCosts: 3000, startDate: '2028-08-01' }],
      taxConfig: { enableTaxEngine: true, jurisdiction: 'CA', currentMarginalRate: 33.0 },
      viewMode: 'nominal'
    });

    const imported = importScenarioFromJson(rawJson);
    expect(imported).not.toBeNull();
    expect(imported.loanConfig.principal).toBe(450000);
    expect(imported.investments[0].accountType).toBe('TAXABLE');
    expect(imported.refinances[0].newRate).toBe(5.0);
    expect(imported.taxConfig.jurisdiction).toBe('CA');
  });

  it('handles invalid or corrupted encoded strings gracefully', () => {
    expect(decodeScenario(null)).toBeNull();
    expect(decodeScenario('')).toBeNull();
    expect(decodeScenario('invalid-base64-content!@#$')).toBeNull();
    expect(importScenarioFromJson('invalid-json')).toBeNull();
  });

  it('provides built-in presets with valid data schemas', () => {
    expect(presetScenarios.balanced).toBeDefined();
    expect(presetScenarios.aggressive_paydown).toBeDefined();
    expect(presetScenarios.fire_retirement).toBeDefined();
    expect(presetScenarios.tax_shield_strategy).toBeDefined();

    const taxPreset = presetScenarios.tax_shield_strategy.data;
    expect(taxPreset.taxConfig.enableTaxEngine).toBe(true);
    expect(taxPreset.taxConfig.jurisdiction).toBe('NY_NYC');
    expect(taxPreset.investments).toHaveLength(2);
  });
});
