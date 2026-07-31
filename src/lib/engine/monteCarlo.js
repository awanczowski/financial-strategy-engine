import { getMonthOffset, randomNormal } from './math.js';

export const runMonteCarloSimulation = (monthContributions, loanConfig, options = {}) => {
  const iterations = Number(options.iterations || loanConfig.monteCarloIterations) || 1000;
  const volatilityPct = Number(options.volatility !== undefined ? options.volatility : loanConfig.monteCarloVolatility) || 15;
  const annualStdDev = volatilityPct / 100;
  const monthlyStdDev = annualStdDev / Math.sqrt(12);
  const inflationRateAnnual = (Number(loanConfig.estimatedInflationRate) || 0) / 100;
  
  const retirementStartMonth = loanConfig.enableRetirement 
    ? getMonthOffset(loanConfig.loanStartDate, loanConfig.retirementDate) 
    : Infinity;

  const totalYears = Math.floor(monthContributions.length / 12);

  const runSimulationForRate = (accumRate, trackPaths = true) => {
    let successCount = 0;
    let finalPorts = [];
    let yearlyPaths = [];
    
    if (trackPaths) {
      for (let y = 0; y < totalYears; y++) {
        yearlyPaths.push(new Float32Array(iterations));
      }
    }

    const isFixed = loanConfig.withdrawalType === 'fixed';
    const isPercentFixed = loanConfig.withdrawalType === 'percent_fixed';
    const isPercentDynamic = loanConfig.withdrawalType === 'percent_dynamic';
    
    const pullRateAnnual = loanConfig.enableRetirement && (isPercentFixed || isPercentDynamic) ? (Number(loanConfig.retirementWithdrawalRate) || 0) / 100 : 0;
    const baseFixedMonthlyInput = isFixed ? (Number(loanConfig.retirementFixedWithdrawal) || 0) / 12 : 0;
    
    const retMean = (Number(loanConfig.retirementGrowthRate) || 0) / 100;
    const accumMean = (Number(accumRate) || 0) / 100;

    for (let i = 0; i < iterations; i++) {
      let port = Number(loanConfig.initialInvestment) || 0;
      let failed = false;
      let lockedWithdrawal = null;
      let currentFixedMonthly = baseFixedMonthlyInput;
      
      for (let m = 0; m < monthContributions.length; m++) {
        const monthNum = m + 1;
        const isRetired = monthNum >= retirementStartMonth;

        // Lock the withdrawal amount on the very first month of retirement if percent_fixed
        if (isRetired && lockedWithdrawal === null && isPercentFixed) {
          lockedWithdrawal = (port * pullRateAnnual) / 12;
        }

        // Annual COLA escalation for fixed/locked withdrawals
        if (isRetired) {
          const monthsInRetirement = monthNum - retirementStartMonth;
          if (monthsInRetirement > 0 && monthsInRetirement % 12 === 0) {
            currentFixedMonthly *= (1 + inflationRateAnnual);
            if (lockedWithdrawal !== null) lockedWithdrawal *= (1 + inflationRateAnnual);
          }
        }

        if (!failed) {
          const annualMean = isRetired ? retMean : accumMean;
          const monthlyMean = annualMean / 12;
          const r = randomNormal(monthlyMean, monthlyStdDev);
          
          let withdrawal = 0;
          if (isRetired) {
            if (isFixed) withdrawal = currentFixedMonthly;
            else if (isPercentFixed) withdrawal = lockedWithdrawal;
            else if (isPercentDynamic) withdrawal = (port * pullRateAnnual) / 12;
          }
          
          port = port * (1 + r) + monthContributions[m] - withdrawal;
          
          // If liquid cash drops below $1, declare bankrupt path
          if (port <= 1) {
            port = 0;
            failed = true; 
          }
        }

        if (monthNum % 12 === 0 && trackPaths) {
          yearlyPaths[Math.floor(m / 12)][i] = port;
        }
      }
      finalPorts.push(port);
      if (!failed && port > 0) successCount++;
    }

    finalPorts.sort((a, b) => a - b);
    
    // Calculate final metrics (Nominal and Real $ Today)
    const finalDiscountFactor = Math.pow(1 + inflationRateAnnual, totalYears);
    const finalPortsReal = finalPorts.map(v => v / finalDiscountFactor);

    let chartData = [];
    if (trackPaths) {
      for (let y = 0; y < totalYears; y++) {
        let yearDataNominal = Array.from(yearlyPaths[y]).sort((a, b) => a - b);
        let discountFactor = Math.pow(1 + inflationRateAnnual, y + 1);
        let yearDataReal = yearDataNominal.map(v => v / discountFactor);

        chartData.push({
          year: y + 1,
          p10: yearDataNominal[Math.floor(iterations * 0.10)],
          p25: yearDataNominal[Math.floor(iterations * 0.25)],
          p50: yearDataNominal[Math.floor(iterations * 0.50)],
          p75: yearDataNominal[Math.floor(iterations * 0.75)],
          p90: yearDataNominal[Math.floor(iterations * 0.90)],

          p10Real: yearDataReal[Math.floor(iterations * 0.10)],
          p25Real: yearDataReal[Math.floor(iterations * 0.25)],
          p50Real: yearDataReal[Math.floor(iterations * 0.50)],
          p75Real: yearDataReal[Math.floor(iterations * 0.75)],
          p90Real: yearDataReal[Math.floor(iterations * 0.90)]
        });
      }
    }

    return {
      successRate: (successCount / iterations) * 100,
      p10: finalPorts[Math.floor(iterations * 0.10)],
      median: finalPorts[Math.floor(iterations * 0.50)],
      p90: finalPorts[Math.floor(iterations * 0.90)],
      p10Real: finalPortsReal[Math.floor(iterations * 0.10)],
      medianReal: finalPortsReal[Math.floor(iterations * 0.50)],
      p90Real: finalPortsReal[Math.floor(iterations * 0.90)],
      chartData
    };
  };

  const lowRes = runSimulationForRate(loanConfig.investRateLow, true);
  const medRes = runSimulationForRate(loanConfig.investRateMed, true); 
  const highRes = runSimulationForRate(loanConfig.investRateHigh, true);

  return {
    volatility: volatilityPct,
    iterations: iterations,
    low: lowRes,
    med: medRes,
    high: highRes
  };
};

