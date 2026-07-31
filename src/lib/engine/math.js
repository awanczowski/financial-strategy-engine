export const calculateStandardPayment = (principal, annualRate, remainingMonths) => {
  if (annualRate === 0 || remainingMonths <= 0) return principal / (remainingMonths || 1);
  const r = (annualRate / 100) / 12;
  return principal * (r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
};

export const getMonthOffset = (baseStr, targetStr) => {
  if (!baseStr || !targetStr) return 1;
  const [by, bm] = baseStr.split('-').map(Number);
  const [ty, tm] = targetStr.split('-').map(Number);
  return (ty - by) * 12 + (tm - bm) + 1;
};

// Box-Muller transform for generating normally distributed random market returns
export const randomNormal = (mean, stdDev) => {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
};
