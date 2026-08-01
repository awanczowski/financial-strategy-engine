/**
 * Calculates standard monthly amortized mortgage payment using the standard annuity formula:
 * P = L * [r(1+r)^n] / [(1+r)^n - 1]
 * 
 * @param {number} principal Remaining loan principal ($).
 * @param {number} annualRate Annual interest rate percentage (e.g. 6.5 for 6.5%).
 * @param {number} remainingMonths Remaining loan term in months.
 * @returns {number} Standard monthly payment ($).
 */
export const calculateStandardPayment = (principal, annualRate, remainingMonths) => {
  if (annualRate === 0 || remainingMonths <= 0) return principal / (remainingMonths || 1);
  const r = (annualRate / 100) / 12;
  return principal * (r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
};

/**
 * Calculates 1-based month offset index relative to a baseline start date string (YYYY-MM-DD).
 * 
 * @param {string} baseStr Start date string (e.g., '2026-08-01').
 * @param {string} targetStr Target event date string (e.g., '2028-08-01').
 * @returns {number} 1-indexed month number (e.g., 25 for 2 years later).
 */
export const getMonthOffset = (baseStr, targetStr) => {
  if (!baseStr || !targetStr) return 1;
  const [by, bm] = baseStr.split('-').map(Number);
  const [ty, tm] = targetStr.split('-').map(Number);
  return (ty - by) * 12 + (tm - bm) + 1;
};

/**
 * Box-Muller transform for generating normally distributed random market returns (Gaussian N(μ, σ)).
 * Used in Monte Carlo stochastic simulations.
 * 
 * @param {number} mean Expected mean value μ (e.g. annual yield / 12).
 * @param {number} stdDev Standard deviation σ (monthly volatility).
 * @returns {number} Random normal sample value.
 */
export const randomNormal = (mean, stdDev) => {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
};

/**
 * Computes calendar date string (YYYY-MM-DD) from baseline date string and 1-indexed month offset.
 * 
 * @param {string} baseStr Start date string (e.g., '2026-08-01').
 * @param {number} monthOffset 1-indexed month number.
 * @returns {string} Calendar date string (YYYY-MM-DD).
 */
export const computeDateFromOffset = (baseStr, monthOffset) => {
  if (!baseStr || !monthOffset) return null;
  const [by, bm, bd] = baseStr.split('-').map(Number);
  if (!by || !bm) return null;
  const totalMonths = (by * 12 + (bm - 1)) + (monthOffset - 1);
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(bd || 1).padStart(2, '0')}`;
};
