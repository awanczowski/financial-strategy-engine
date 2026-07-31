export const ACTIVE_SESSION_KEY = 'financialEngine_activeSession_v13';
export const defaultStartDate = "2026-08-01";
export const defaultRetirementDate = "2051-08-01";

export const defaultLoanConfig = {
  principal: 400000,
  mortgageRate: 6.5,
  years: 30,
  simulationYears: 55,
  initialInvestment: 0,
  investRateLow: 5.0,
  investRateMed: 8.0,
  investRateHigh: 11.0,
  initialHomeValue: 500000,
  homeGrowthRateLow: 2.0,
  homeGrowthRateMed: 3.5,
  homeGrowthRateHigh: 5.0,
  divertAfterPayoff: true,
  isBiweekly: false,
  loanStartDate: defaultStartDate,
  enableRetirement: false,
  retirementDate: defaultRetirementDate,
  withdrawalType: 'percent_fixed', // 'percent_fixed', 'percent_dynamic', or 'fixed'
  retirementWithdrawalRate: 4.0,
  retirementFixedWithdrawal: 60000,
  retirementGrowthRate: 5.0,
  stopContributionsInRetirement: true,
  estimatedInflationRate: 2.5,
  monteCarloVolatility: 15.0,
  monteCarloIterations: 1000
};

export const defaultExtraPayments = [
  { id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }
];

export const defaultInvestments = [
  { id: 1, amount: 500, frequency: 1, startDate: defaultStartDate }
];
