import { calculateStandardPayment, getMonthOffset } from './math.js';

export const runSimulationEngine = (loanConfig, extraPayments = [], investments = [], rateAdjustments = []) => {
  const loanMonths = (Number(loanConfig.years) || 0) * 12;
  const simulationMonths = (Number(loanConfig.simulationYears) || 0) * 12;
  const isBiweekly = loanConfig.isBiweekly;
  const baseDate = loanConfig.loanStartDate;
  const retirementStartMonth = loanConfig.enableRetirement ? getMonthOffset(baseDate, loanConfig.retirementDate) : Infinity;
  const inflationRateAnnual = (Number(loanConfig.estimatedInflationRate) || 0) / 100;
  
  const activeExtra = extraPayments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));
  const activeInvestments = investments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));
  const activeRates = rateAdjustments.map(p => ({ ...p, startMonth: getMonthOffset(baseDate, p.startDate) }));

  const monthlyInvestRateLow = ((Number(loanConfig.investRateLow) || 0) / 100) / 12;
  const monthlyInvestRateMed = ((Number(loanConfig.investRateMed) || 0) / 100) / 12;
  const monthlyInvestRateHigh = ((Number(loanConfig.investRateHigh) || 0) / 100) / 12;
  
  const monthlyHomeGrowthLow = ((Number(loanConfig.homeGrowthRateLow) || 0) / 100) / 12;
  const monthlyHomeGrowthMed = ((Number(loanConfig.homeGrowthRateMed) || 0) / 100) / 12;
  const monthlyHomeGrowthHigh = ((Number(loanConfig.homeGrowthRateHigh) || 0) / 100) / 12;
  
  let currentPrincipal = Number(loanConfig.principal) || 0;
  let currentAnnualRate = Number(loanConfig.mortgageRate) || 0;
  let standardMonthlyPayment = calculateStandardPayment(currentPrincipal, currentAnnualRate, loanMonths);
  
  let currentInvestmentLow = Number(loanConfig.initialInvestment) || 0;
  let currentInvestmentMed = Number(loanConfig.initialInvestment) || 0;
  let currentInvestmentHigh = Number(loanConfig.initialInvestment) || 0;
  
  let currentHomeValueLow = Number(loanConfig.initialHomeValue) || 0;
  let currentHomeValueMed = Number(loanConfig.initialHomeValue) || 0;
  let currentHomeValueHigh = Number(loanConfig.initialHomeValue) || 0;
  
  let yearlyData = [];
  let trackedMonthContributions = [];
  
  let yearMortgagePaid = 0;
  let yearInterestPaid = 0;
  let yearInvestContributed = 0;
  let yearWithdrawn = 0;

  let yearMortgagePaidReal = 0;
  let yearInterestPaidReal = 0;
  let yearInvestContributedReal = 0;
  let yearWithdrawnReal = 0;

  let totalInterestPaid = 0;
  let totalInvestContributed = 0;
  let totalWithdrawnOverall = 0;
  let totalInterestPaidReal = 0;
  let totalInvestContributedReal = 0;
  let totalWithdrawnOverallReal = 0;

  let payoffMonth = null;
  let firstMonthBreakdown = null;

  let lockedWithdrawalLow = null;
  let lockedWithdrawalMed = null;
  let lockedWithdrawalHigh = null;
  let currentFixedMonthlyWithdrawal = (Number(loanConfig.retirementFixedWithdrawal) || 0) / 12;

  for (let month = 1; month <= simulationMonths; month++) {
    const isRetired = month >= retirementStartMonth;
    const discountFactor = Math.pow(1 + inflationRateAnnual, -(month / 12));

    const adjustmentThisMonth = activeRates.find(adj => adj.startMonth === month);
    if (adjustmentThisMonth && currentPrincipal > 0) {
      currentAnnualRate = Number(adjustmentThisMonth.rate) || 0;
      const remainingLoanMonths = loanMonths - month + 1;
      standardMonthlyPayment = calculateStandardPayment(currentPrincipal, currentAnnualRate, remainingLoanMonths);
    }

    let monthlyMortgageRate = (currentAnnualRate / 100) / 12;
    let interestThisMonth = currentPrincipal > 0 ? currentPrincipal * monthlyMortgageRate : 0;
    
    let basePaymentCount = isBiweekly ? (month % 6 === 0 ? 3 : 2) : 1;
    let periodicBasePayment = isBiweekly ? standardMonthlyPayment / 2 : standardMonthlyPayment;
    let totalBasePaymentThisMonth = periodicBasePayment * basePaymentCount;

    let extraThisMonth = activeExtra.reduce((total, pay) => {
      if (month >= pay.startMonth && (month - pay.startMonth) % (Number(pay.frequency) || 1) === 0) {
        return total + (Number(pay.amount) || 0);
      }
      return total;
    }, 0);

    let investContributionThisMonth = activeInvestments.reduce((total, inv) => {
      if (month >= inv.startMonth && (month - inv.startMonth) % (Number(inv.frequency) || 1) === 0) {
        return total + (Number(inv.amount) || 0);
      }
      return total;
    }, 0);

    if (month === 1) {
      firstMonthBreakdown = {
        frequency: isBiweekly ? "Bi-Weekly" : "Monthly",
        periodicPayment: periodicBasePayment,
        interestPortion: interestThisMonth / (isBiweekly ? 2 : 1),
        principalPortion: periodicBasePayment - (interestThisMonth / (isBiweekly ? 2 : 1)),
        extraInMonth1: extraThisMonth
      };
    }

    let principalThisMonth = 0;

    if (currentPrincipal > 0) {
      let totalPaymentThisMonth = totalBasePaymentThisMonth + extraThisMonth;
      
      if (currentPrincipal + interestThisMonth <= totalPaymentThisMonth) {
        totalPaymentThisMonth = currentPrincipal + interestThisMonth;
        principalThisMonth = currentPrincipal;
        currentPrincipal = 0;
        payoffMonth = month; 
        
        if (loanConfig.divertAfterPayoff) {
          let leftover = (totalBasePaymentThisMonth + extraThisMonth) - totalPaymentThisMonth;
          investContributionThisMonth += leftover;
        }
      } else {
        principalThisMonth = totalBasePaymentThisMonth - interestThisMonth + extraThisMonth;
        currentPrincipal -= principalThisMonth;
      }
      
      yearMortgagePaid += totalPaymentThisMonth;
      yearInterestPaid += interestThisMonth;
      totalInterestPaid += interestThisMonth;

      yearMortgagePaidReal += totalPaymentThisMonth * discountFactor;
      yearInterestPaidReal += interestThisMonth * discountFactor;
      totalInterestPaidReal += interestThisMonth * discountFactor;
    } else {
      if (loanConfig.divertAfterPayoff) {
        let divertedStandard = month <= loanMonths ? totalBasePaymentThisMonth : 0;
        investContributionThisMonth += divertedStandard + extraThisMonth;
      }
    }

    if (isRetired && loanConfig.stopContributionsInRetirement) {
      investContributionThisMonth = 0;
    }

    // Store pure liquid cash flow additions for Monte Carlo simulation
    trackedMonthContributions.push(investContributionThisMonth);

    let yieldLow = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateLow;
    let yieldMed = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateMed;
    let yieldHigh = isRetired ? ((Number(loanConfig.retirementGrowthRate) || 0) / 100) / 12 : monthlyInvestRateHigh;

    let withdrawalLow = 0, withdrawalMed = 0, withdrawalHigh = 0;
    let actualWithdrawnMed = 0; 

    if (isRetired) {
      // Annual COLA escalation for fixed and locked percentage withdrawals every 12 months in retirement
      const monthsInRetirement = month - retirementStartMonth;
      if (monthsInRetirement > 0 && monthsInRetirement % 12 === 0) {
        currentFixedMonthlyWithdrawal *= (1 + inflationRateAnnual);
        if (lockedWithdrawalLow !== null) lockedWithdrawalLow *= (1 + inflationRateAnnual);
        if (lockedWithdrawalMed !== null) lockedWithdrawalMed *= (1 + inflationRateAnnual);
        if (lockedWithdrawalHigh !== null) lockedWithdrawalHigh *= (1 + inflationRateAnnual);
      }

      if (loanConfig.withdrawalType === 'fixed') {
        withdrawalLow = currentFixedMonthlyWithdrawal;
        withdrawalMed = currentFixedMonthlyWithdrawal;
        withdrawalHigh = currentFixedMonthlyWithdrawal;
      } 
      else if (loanConfig.withdrawalType === 'percent_fixed') {
        if (lockedWithdrawalMed === null) {
          const pullRateAnnual = (Number(loanConfig.retirementWithdrawalRate) || 0) / 100;
          lockedWithdrawalLow = (currentInvestmentLow * pullRateAnnual) / 12;
          lockedWithdrawalMed = (currentInvestmentMed * pullRateAnnual) / 12;
          lockedWithdrawalHigh = (currentInvestmentHigh * pullRateAnnual) / 12;
        }
        withdrawalLow = lockedWithdrawalLow;
        withdrawalMed = lockedWithdrawalMed;
        withdrawalHigh = lockedWithdrawalHigh;
      }
      else if (loanConfig.withdrawalType === 'percent_dynamic') {
        const pullRateAnnual = (Number(loanConfig.retirementWithdrawalRate) || 0) / 100;
        withdrawalLow = (currentInvestmentLow * pullRateAnnual) / 12;
        withdrawalMed = (currentInvestmentMed * pullRateAnnual) / 12;
        withdrawalHigh = (currentInvestmentHigh * pullRateAnnual) / 12;
      }

      // Prevent ghost withdrawals tracking if the portfolio hits zero
      const availableMed = currentInvestmentMed + (currentInvestmentMed * yieldMed) + investContributionThisMonth;
      actualWithdrawnMed = Math.min(withdrawalMed, availableMed);
    }

    // Real estate is isolated. Withdrawals ONLY pull from liquid investments.
    currentInvestmentLow = Math.max(0, currentInvestmentLow + (currentInvestmentLow * yieldLow) + investContributionThisMonth - withdrawalLow);
    currentInvestmentMed = Math.max(0, currentInvestmentMed + (currentInvestmentMed * yieldMed) + investContributionThisMonth - withdrawalMed);
    currentInvestmentHigh = Math.max(0, currentInvestmentHigh + (currentInvestmentHigh * yieldHigh) + investContributionThisMonth - withdrawalHigh);
    
    currentHomeValueLow += currentHomeValueLow * monthlyHomeGrowthLow;
    currentHomeValueMed += currentHomeValueMed * monthlyHomeGrowthMed;
    currentHomeValueHigh += currentHomeValueHigh * monthlyHomeGrowthHigh;

    yearInvestContributed += investContributionThisMonth;
    totalInvestContributed += investContributionThisMonth;
    yearInvestContributedReal += investContributionThisMonth * discountFactor;
    totalInvestContributedReal += investContributionThisMonth * discountFactor;
    
    yearWithdrawn += actualWithdrawnMed;
    totalWithdrawnOverall += actualWithdrawnMed;
    yearWithdrawnReal += actualWithdrawnMed * discountFactor;
    totalWithdrawnOverallReal += actualWithdrawnMed * discountFactor;

    if (month % 12 === 0) {
      const yearIndex = month / 12;
      const yearDiscountFactor = Math.pow(1 + inflationRateAnnual, -yearIndex);

      yearlyData.push({
        year: yearIndex,
        mortgageBalance: Math.max(0, currentPrincipal),
        homeMed: currentHomeValueMed,
        invLow: currentInvestmentLow,
        invMed: currentInvestmentMed,
        invHigh: currentInvestmentHigh,
        netWorthLow: (currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal),
        netWorthMed: (currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal),
        netWorthHigh: (currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal),
        mortgagePaid: yearMortgagePaid,
        interestPaid: yearInterestPaid,
        investContributed: yearInvestContributed,
        withdrawn: yearWithdrawn,
        activeRate: currentAnnualRate,

        // Real (Discounted to Present Value) equivalents
        mortgageBalanceReal: Math.max(0, currentPrincipal) * yearDiscountFactor,
        homeMedReal: currentHomeValueMed * yearDiscountFactor,
        invLowReal: currentInvestmentLow * yearDiscountFactor,
        invMedReal: currentInvestmentMed * yearDiscountFactor,
        invHighReal: currentInvestmentHigh * yearDiscountFactor,
        netWorthLowReal: ((currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal)) * yearDiscountFactor,
        netWorthMedReal: ((currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal)) * yearDiscountFactor,
        netWorthHighReal: ((currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal)) * yearDiscountFactor,
        mortgagePaidReal: yearMortgagePaidReal,
        interestPaidReal: yearInterestPaidReal,
        investContributedReal: yearInvestContributedReal,
        withdrawnReal: yearWithdrawnReal
      });
      
      yearMortgagePaid = 0;
      yearInterestPaid = 0;
      yearInvestContributed = 0;
      yearWithdrawn = 0;
      yearMortgagePaidReal = 0;
      yearInterestPaidReal = 0;
      yearInvestContributedReal = 0;
      yearWithdrawnReal = 0;
    }
  }

  const finalDiscountFactor = Math.pow(1 + inflationRateAnnual, -(simulationMonths / 12));

  return {
    scheduleData: yearlyData,
    initialBreakdown: firstMonthBreakdown,
    monthContributions: trackedMonthContributions,
    summary: {
      totalInterestPaid,
      totalInvestContributed,
      totalWithdrawnOverall,
      totalInterestPaidReal,
      totalInvestContributedReal,
      totalWithdrawnOverallReal,
      payoffString: payoffMonth 
        ? `Yr ${Math.ceil(payoffMonth / 12)}, Mo ${payoffMonth % 12 === 0 ? 12 : payoffMonth % 12}` 
        : "Not paid off",
      finalHomeLow: currentHomeValueLow,
      finalHomeMed: currentHomeValueMed,
      finalHomeHigh: currentHomeValueHigh,
      finalInvLow: currentInvestmentLow,
      finalInvMed: currentInvestmentMed,
      finalInvHigh: currentInvestmentHigh,
      finalNetWorthLow: (currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal),
      finalNetWorthMed: (currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal),
      finalNetWorthHigh: (currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal),

      // Real discounted summary figures
      finalHomeLowReal: currentHomeValueLow * finalDiscountFactor,
      finalHomeMedReal: currentHomeValueMed * finalDiscountFactor,
      finalHomeHighReal: currentHomeValueHigh * finalDiscountFactor,
      finalInvLowReal: currentInvestmentLow * finalDiscountFactor,
      finalInvMedReal: currentInvestmentMed * finalDiscountFactor,
      finalInvHighReal: currentInvestmentHigh * finalDiscountFactor,
      finalNetWorthLowReal: ((currentInvestmentLow + currentHomeValueLow) - Math.max(0, currentPrincipal)) * finalDiscountFactor,
      finalNetWorthMedReal: ((currentInvestmentMed + currentHomeValueMed) - Math.max(0, currentPrincipal)) * finalDiscountFactor,
      finalNetWorthHighReal: ((currentInvestmentHigh + currentHomeValueHigh) - Math.max(0, currentPrincipal)) * finalDiscountFactor
    }
  };
};
