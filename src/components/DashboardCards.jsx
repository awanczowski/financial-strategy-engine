import React from 'react';
import { formatCurrency } from '../lib/formatters.js';
import InfoTooltip from './InfoTooltip.jsx';

export default function DashboardCards({ 
  initialBreakdown, 
  summary, 
  loanConfig, 
  socialSecurityConfig,
  refinances = [],
  rateAdjustments = []
}) {
  const getEndDate = () => {
    if (!loanConfig?.loanStartDate) return 'N/A';
    const [y, m, d] = loanConfig.loanStartDate.split('-').map(Number);
    if (!y || !m || !d) return 'N/A';
    const endYear = y + (Number(loanConfig.simulationYears) || 30);
    return `${endYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const endDate = getEndDate();
  const payoffDate = summary?.payoffDate || summary?.payoffString || 'Not Paid Off';

  const refinanceDatesList = refinances.map(r => r.startDate).filter(Boolean);
  const rateAdjDatesList = rateAdjustments.map(r => r.startDate).filter(Boolean);

  return (
    <>
      {/* Lined Up Summary Dashboard */}
      <div className="row g-4 mb-4">
        {initialBreakdown && (
          <div className="col-lg-4">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4">
                <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Base Payment Breakdown ({initialBreakdown.frequency})</h6>
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span className="text-black small text-uppercase">Total Payment</span>
                  <span className="text-black fs-4">{formatCurrency(initialBreakdown.periodicPayment)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Principal Portion (P.1)</span>
                  <span className="text-muted">{formatCurrency(initialBreakdown.principalPortion)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Interest Portion (P.1)</span>
                  <span className="text-muted">{formatCurrency(initialBreakdown.interestPortion)}</span>
                </div>
                {initialBreakdown.extraInMonth1 > 0 && (
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top border-dark">
                    <span className="text-black small">Extra Applied (Date 1)</span>
                    <span className="text-black">+{formatCurrency(initialBreakdown.extraInMonth1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-lg-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Cash Flow & Debt</h6>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small text-uppercase">Payoff Date</span>
                <span className="text-black fs-4">{payoffDate}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small text-uppercase">Total Interest</span>
                <span className="text-danger">{formatCurrency(summary.totalInterestPaid)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small text-uppercase">Total Invested</span>
                <span className="text-black">{formatCurrency(summary.totalInvestContributed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small text-uppercase">Total Withdrawn</span>
                <span className="text-success">{formatCurrency(summary.totalWithdrawnOverall)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Important Timeline Dates</h6>
              
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small text-uppercase">Simulation Start</span>
                <span className="text-black fs-6">{loanConfig?.loanStartDate || '2026-08-01'}</span>
              </div>

              {refinanceDatesList.length > 0 && (
                <div className="d-flex justify-content-between mb-2 align-items-start">
                  <span className="text-muted small text-uppercase">Refinance Event(s)</span>
                  <div className="text-end">
                    {refinanceDatesList.map((d, idx) => (
                      <div key={idx} className="text-black fs-6">{d}</div>
                    ))}
                  </div>
                </div>
              )}

              {rateAdjDatesList.length > 0 && (
                <div className="d-flex justify-content-between mb-2 align-items-start">
                  <span className="text-muted small text-uppercase">ARM Rate Shift(s)</span>
                  <div className="text-end">
                    {rateAdjDatesList.map((d, idx) => (
                      <div key={idx} className="text-black fs-6">{d}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-muted small text-uppercase">Mortgage Payoff</span>
                <span className="text-black fs-6">{payoffDate}</span>
              </div>

              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-muted small text-uppercase">Retirement Start</span>
                <span className="text-black fs-6">
                  {loanConfig?.enableRetirement ? (loanConfig.retirementDate || 'Not Set') : 'Disabled'}
                </span>
              </div>

              {summary?.coastFireSummary?.enabled && (
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span className="text-muted small text-uppercase">Coast FIRE Achieved</span>
                  <span className="text-black fs-6">
                    {summary.coastFireSummary.achieved 
                      ? `Age ${summary.coastFireSummary.achievedAge} (${summary.coastFireSummary.achievedDate?.slice(0, 4) || `Yr ${summary.coastFireSummary.achievedYear}`})`
                      : 'In Progress'}
                  </span>
                </div>
              )}

              {socialSecurityConfig?.enableSocialSecurity && (
                <>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                    <span className="text-muted small text-uppercase">Social Security (Self)</span>
                    <span className="text-black fs-6">{socialSecurityConfig.selfStartDate || 'Not Set'}</span>
                  </div>
                  {socialSecurityConfig.enableSpouseSS && (
                    <div className="d-flex justify-content-between mb-2 align-items-center">
                      <span className="text-muted small text-uppercase">Social Security (Spouse)</span>
                      <span className="text-black fs-6">{socialSecurityConfig.spouseStartDate || 'Not Set'}</span>
                    </div>
                  )}
                </>
              )}

              <div className="d-flex justify-content-between mt-1 pt-2 border-top border-dark align-items-center">
                <span className="text-black small text-uppercase">End of Horizon</span>
                <span className="text-black fs-6">{endDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refinance Breakeven Analysis Card */}
      {summary?.refinanceEvents && summary.refinanceEvents.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card dashboard-card bg-white">
              <div className="card-body p-4">
                <h6 className="card-subtitle mb-3 scandi-label text-black border-bottom border-dark pb-2">Refinance Event & Breakeven Analysis</h6>
                <div className="row g-3">
                  {summary.refinanceEvents.map((ref, idx) => (
                    <div key={ref.id || idx} className="col-md-6 col-lg-4 border-end border-light">
                      <div className="p-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-dark text-white font-monospace">{ref.startDate}</span>
                          <span className="small text-muted fw-bold">Month {ref.month}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">New Rate / Term:</span>
                          <span className="fw-bold">{ref.newRate}% ({ref.newTermYears} yrs)</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">Closing Costs (into Principal):</span>
                          <span className="fw-bold text-danger">+{formatCurrency(ref.closingCosts)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">New Payment:</span>
                          <span className="fw-bold">{formatCurrency(ref.newPayment)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">Monthly Payment Impact:</span>
                          <span className={ref.monthlyPaymentSavings >= 0 ? "fw-bold text-success" : "fw-bold text-danger"}>
                            {ref.monthlyPaymentSavings >= 0 ? `-${formatCurrency(ref.monthlyPaymentSavings)}/mo` : `+${formatCurrency(Math.abs(ref.monthlyPaymentSavings))}/mo`}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted small">Monthly Interest Saved:</span>
                          <span className={ref.monthlyInterestSavings >= 0 ? "fw-bold text-success" : "fw-bold text-danger"}>
                            {ref.monthlyInterestSavings >= 0 ? `${formatCurrency(ref.monthlyInterestSavings)}/mo` : `-${formatCurrency(Math.abs(ref.monthlyInterestSavings))}/mo`}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mt-2 pt-2 border-top border-dark align-items-center">
                          <span className="text-black small fw-bold text-uppercase">Breakeven Point:</span>
                          <span className="fw-bolder text-black">
                            {ref.breakevenMonthsInterest 
                              ? `${ref.breakevenMonthsInterest.toFixed(1)} mos (${ref.breakevenYearsInterest.toFixed(1)} yrs)`
                              : 'No Interest Savings'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Shield & Multi-Bucket Portfolio Card */}
      {summary?.taxSummary?.enabled && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card dashboard-card bg-white">
              <div className="card-body p-4">
                <h6 className="card-subtitle mb-3 scandi-label text-black border-bottom border-dark pb-2">Tax Engine & Account Bucket Breakdown</h6>
                <div className="row g-3">
                  <div className="col-md-6 col-lg-3 border-end border-light">
                    <div className="p-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Total MID/SALT Tax Shield</span>
                      <span className="text-success fw-bolder fs-4 d-block mb-2">{formatCurrency(summary.taxSummary.totalMidTaxSavings)}</span>
                      <span className="small text-muted">Total tax savings generated via mortgage interest & property tax deduction shield.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3 border-end border-light">
                    <div className="p-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Accumulation Tax Drag</span>
                      <span className="text-danger fw-bolder fs-4 d-block mb-2">{formatCurrency(summary.taxSummary.totalTaxDragPaid)}</span>
                      <span className="small text-muted">Total dividend yield tax drag on taxable brokerage account growth.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3 border-end border-light">
                    <div className="p-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Pre-Tax (401k/IRA) Balance</span>
                      <span className="text-black fw-bolder fs-5 d-block mb-2">{formatCurrency(summary.taxSummary.finalTaxDeferredMed)}</span>
                      <span className="small text-muted">Compounds tax-free; withdrawals taxed as ordinary income.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <div className="p-2">
                      <span className="text-muted small fw-bold text-uppercase d-block mb-1">Roth (Tax-Free) Balance</span>
                      <span className="text-black fw-bolder fs-5 d-block mb-2">{formatCurrency(summary.taxSummary.finalTaxFreeMed)}</span>
                      <span className="small text-muted">Compounds tax-free; 100% tax-free retirement withdrawals.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coast FIRE Target & Milestone Analysis Card */}
      {summary?.coastFireSummary?.enabled && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="card dashboard-card bg-white">
              <div className="card-body p-4">
                <div className="border-bottom border-dark pb-2 mb-3">
                  <h6 className="card-subtitle scandi-label text-black mb-0 fs-6 d-flex align-items-center">
                    Coast FIRE Target & Milestone Analysis
                    <InfoTooltip text="Calculates present-day portfolio needed so compound interest alone grows your nest egg to target retirement expenses without additional contributions." />
                  </h6>
                </div>

                <div className="row g-4">
                  <div className="col-md-6 col-lg-3 border-lg-end">
                    <div>
                      <span className="scandi-label text-muted d-block mb-1">Required Coast FIRE Today</span>
                      <span className="text-black fw-bolder fs-4 d-block mb-1">{formatCurrency(summary.coastFireSummary.requiredToday)}</span>
                      <span className="small text-muted d-block">Needed today to grow to FIRE target by age {loanConfig?.coastFireTargetAge || 65} without extra savings.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3 border-lg-end">
                    <div>
                      <span className="scandi-label text-muted d-block mb-1">Full FIRE Target Nest Egg</span>
                      <span className="text-black fw-bolder fs-4 d-block mb-1">{formatCurrency(summary.coastFireSummary.fullFireTarget)}</span>
                      <span className="small text-muted d-block">Target nest egg at age {loanConfig?.coastFireTargetAge || 65} for retirement.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3 border-lg-end">
                    <div>
                      <span className="scandi-label text-muted d-block mb-1">Current Portfolio Balance</span>
                      <span className="text-black fw-bolder fs-4 d-block mb-1">{formatCurrency(summary.coastFireSummary.currentPortfolio)}</span>
                      <span className="small text-muted d-block">Starting liquid investment portfolio balance.</span>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <div>
                      <span className="scandi-label text-muted d-block mb-1">Coast FIRE Milestone</span>
                      <span className="text-black fw-bolder fs-4 d-block mb-1">
                        {summary.coastFireSummary.achieved 
                          ? `Age ${summary.coastFireSummary.achievedAge} (${summary.coastFireSummary.achievedDate?.slice(0, 4) || `Yr ${summary.coastFireSummary.achievedYear}`})`
                          : 'In Progress'}
                      </span>
                      <span className="small text-muted d-block">
                        {summary.coastFireSummary.achieved 
                          ? `Portfolio reaches required target in Year ${summary.coastFireSummary.achievedYear} (${summary.coastFireSummary.achievedDate || `Yr ${summary.coastFireSummary.achievedYear}`}).`
                          : 'Portfolio has not yet reached required Coast FIRE target.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Home Value</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalHomeMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeHigh)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Portfolio</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalInvLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalInvMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalInvHigh)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4 bg-light">
              <h6 className="card-subtitle mb-4 scandi-label text-black border-bottom border-dark pb-2">Final Net Worth</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bolder fs-4">{formatCurrency(summary.finalNetWorthMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthHigh)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
