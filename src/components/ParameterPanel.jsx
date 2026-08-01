import React, { useState } from 'react';
import StrategyRow from './StrategyRow.jsx';
import RateAdjustmentRow from './RateAdjustmentRow.jsx';
import RefinanceRow from './RefinanceRow.jsx';
import TaxControlPanel from './TaxControlPanel.jsx';
import SocialSecurityControlPanel from './SocialSecurityControlPanel.jsx';
import InfoTooltip from './InfoTooltip.jsx';
import { defaultStartDate } from '../lib/constants.js';

export default function ParameterPanel({
  loanConfig,
  handleConfigChange,
  extraPayments,
  setExtraPayments,
  investments,
  setInvestments,
  rateAdjustments,
  setRateAdjustments,
  refinances = [],
  setRefinances,
  taxConfig,
  handleTaxConfigChange,
  socialSecurityConfig,
  handleSocialSecurityConfigChange,
  addStrategy,
  removeStrategy,
  updateStrategy,
  handleOpenMonteCarlo
}) {
  // Start with Real Estate & Mortgage form by default
  const [activeTab, setActiveTab] = useState('mortgage');

  const showMortgage = activeTab === 'all' || activeTab === 'mortgage';
  const showWealth = activeTab === 'all' || activeTab === 'wealth';
  const showRetirement = activeTab === 'all' || activeTab === 'retirement';
  const showTaxes = activeTab === 'all' || activeTab === 'taxes';

  return (
    <div className="card bg-white border-dark mb-5 border-2 shadow-sm">
      {/* Header & Tab Controls */}
      <div className="card-header border-dark bg-transparent p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1 scandi-header text-black">Strategy Engine Controls</h5>
            <span className="text-muted small d-block">Configure property, mortgage terms, wealth growth, retirement, and tax assumptions</span>
          </div>
          <span className="badge bg-dark text-white rounded-0 px-3 py-2 text-uppercase scandi-label">
            {activeTab === 'all' ? 'Showing All Controls' : `Filtered: ${activeTab}`}
          </span>
        </div>

        {/* Tabbed Segmented Controls (Real Estate First, All Controls Last) */}
        <div className="d-flex flex-wrap gap-2 pt-3 border-top border-dark">
          <button 
            type="button"
            className={`btn btn-sm text-uppercase scandi-label py-2 px-3 border border-dark rounded-0 transition-all ${
              activeTab === 'mortgage' ? 'btn-dark text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveTab('mortgage')}
          >
            Real Estate & Mortgage
          </button>
          <button 
            type="button"
            className={`btn btn-sm text-uppercase scandi-label py-2 px-3 border border-dark rounded-0 transition-all ${
              activeTab === 'wealth' ? 'btn-dark text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveTab('wealth')}
          >
            Wealth & Investing
          </button>
          <button 
            type="button"
            className={`btn btn-sm text-uppercase scandi-label py-2 px-3 border border-dark rounded-0 transition-all ${
              activeTab === 'retirement' ? 'btn-dark text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveTab('retirement')}
          >
            Retirement & Social Security
          </button>
          <button 
            type="button"
            className={`btn btn-sm text-uppercase scandi-label py-2 px-3 border border-dark rounded-0 transition-all ${
              activeTab === 'taxes' ? 'btn-dark text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveTab('taxes')}
          >
            Tax & Jurisdiction
          </button>
          <button 
            type="button"
            className={`btn btn-sm text-uppercase scandi-label py-2 px-3 border border-dark rounded-0 transition-all ${
              activeTab === 'all' ? 'btn-dark text-white fw-bold shadow-sm' : 'btn-light text-dark'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Controls
          </button>
        </div>
      </div>
      
      <div className="card-body p-4 p-xl-5">
        {/* Vertically Stacked Controls View */}
        <div className="row g-4">
          
          {/* SECTION 1: REAL ESTATE & MORTGAGE STRATEGIES */}
          {showMortgage && (
            <div className="col-12">
              <div className="bg-light p-4 border border-dark">
                <div>
                  <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-4">
                    <h5 className="scandi-label text-black mb-0 fs-6">Real Estate & Mortgage</h5>
                    <span className="badge bg-dark text-white rounded-0 text-uppercase scandi-label">Step 1</span>
                  </div>

                  {/* 1. Real Estate Details */}
                  <div className="mb-4">
                    <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                      Property Details
                      <InfoTooltip text="Models initial home value and compound annual appreciation across Low, Medium, and High market scenarios." />
                    </h6>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-6">
                        <label className="form-label scandi-label">Initial Home Value ($)</label>
                        <input name="initialHomeValue" type="number" className="form-control scandi-input border-dark bg-white" value={loanConfig.initialHomeValue} onChange={handleConfigChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label scandi-label">Appreciation Scenarios (Low / Med / High %)</label>
                        <div className="input-group">
                          <input name="homeGrowthRateLow" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.homeGrowthRateLow} onChange={handleConfigChange} />
                          <span className="input-group-text bg-white text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                          <input name="homeGrowthRateMed" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.homeGrowthRateMed} onChange={handleConfigChange} />
                          <span className="input-group-text bg-white text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                          <input name="homeGrowthRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.homeGrowthRateHigh} onChange={handleConfigChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Base Loan Terms */}
                  <div className="mb-4 pt-3 border-top border-secondary">
                    <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                      Loan Configuration
                      <InfoTooltip text="Standard monthly P&I amortization. Check Accelerated Bi-Weekly to make 26 half-payments per year (equivalent to 13 full monthly payments)." />
                    </h6>
                    <div className="row g-3 align-items-end">
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label">Loan Start Date</label>
                        <input name="loanStartDate" type="date" className="form-control scandi-input border-dark bg-white" value={loanConfig.loanStartDate} onChange={handleConfigChange} />
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label">Principal ($)</label>
                        <input name="principal" type="number" className="form-control scandi-input border-dark bg-white" value={loanConfig.principal} onChange={handleConfigChange} />
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label">Base Rate (%)</label>
                        <input name="mortgageRate" type="number" step="0.1" className="form-control scandi-input border-dark bg-white" value={loanConfig.mortgageRate} onChange={handleConfigChange} />
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label">Term (Yrs)</label>
                        <input name="years" type="number" className="form-control scandi-input border-dark bg-white" value={loanConfig.years} onChange={handleConfigChange} />
                      </div>
            
                      <div className="col-12 mt-3">
                        <div className="d-flex align-items-center gap-3 bg-white p-3 border border-dark">
                          <input 
                            className="scandi-checkbox" 
                            type="checkbox" 
                            name="isBiweekly" 
                            id="biweeklyCheck"
                            checked={loanConfig.isBiweekly} 
                            onChange={handleConfigChange}
                          />
                          <label className="scandi-label m-0 text-black lh-sm" htmlFor="biweeklyCheck" style={{ cursor: 'pointer' }}>
                            Accelerated Bi-Weekly Payments
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Mortgage Refinances */}
                  <div className="mb-4 pt-3 border-top border-secondary">
                    <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                      Mortgage Refinances
                      <InfoTooltip text="Models future refinance events with closing cost roll-ins, updated monthly obligations, and breakeven month timelines." />
                    </h6>
                    <div className="bg-white p-3 border border-dark">
                      {refinances.length === 0 && <div className="text-muted small fst-italic mb-3">No refinances scheduled.</div>}
                      {refinances.map(item => (
                        <RefinanceRow 
                          key={item.id} 
                          item={item} 
                          onUpdate={(id, field, val) => updateStrategy(id, field, val, setRefinances)} 
                          onRemove={(id) => removeStrategy(id, setRefinances)} 
                        />
                      ))}
                      <button className="btn btn-sm btn-outline-dark fw-bold mt-2 w-100" onClick={() => addStrategy(setRefinances, { startDate: defaultStartDate, newRate: 5.5, newTermYears: 30, closingCosts: 4000 })}>+ Add Refinance</button>
                    </div>
                  </div>

                  {/* 4. ARM Adjustments & Extra Payments */}
                  <div className="pt-3 border-top border-secondary">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                          ARM Adjustments (Rate Changes)
                          <InfoTooltip text="Schedule rate shifts for Adjustable Rate Mortgages (ARMs) at specific future dates." />
                        </h6>
                        <div className="bg-white p-3 border border-dark">
                          {rateAdjustments.length === 0 && <div className="text-muted small fst-italic mb-3">No rate changes scheduled.</div>}
                          {rateAdjustments.map(item => (
                            <RateAdjustmentRow 
                              key={item.id} 
                              item={item} 
                              onUpdate={(id, field, val) => updateStrategy(id, field, val, setRateAdjustments)} 
                              onRemove={(id) => removeStrategy(id, setRateAdjustments)} 
                            />
                          ))}
                          <button className="btn btn-sm btn-outline-dark fw-bold mt-2 w-100" onClick={() => addStrategy(setRateAdjustments, { rate: 7.0, startDate: "2031-08-01" })}>+ Add Rate Change</button>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                          Extra Mortgage Payments
                          <InfoTooltip text="Schedule recurring or one-off extra principal payments to accelerate debt payoff." />
                        </h6>
                        <div className="bg-white p-3 border border-dark">
                          {extraPayments.length === 0 && <div className="text-muted small fst-italic mb-3">No extra payments scheduled.</div>}
                          {extraPayments.map(item => (
                            <StrategyRow 
                              key={item.id} 
                              item={item} 
                              onUpdate={(id, field, val) => updateStrategy(id, field, val, setExtraPayments)} 
                              onRemove={(id) => removeStrategy(id, setExtraPayments)} 
                            />
                          ))}
                          <button className="btn btn-sm btn-outline-dark fw-bold mt-2 w-100" onClick={() => addStrategy(setExtraPayments, { amount: 0, frequency: 1, startDate: defaultStartDate })}>+ Add Payment</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WEALTH & INVESTING */}
          {showWealth && (
            <div className="col-12">
              <div className="bg-light p-4 border border-dark">
                <div>
                  <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-4">
                    <h5 className="scandi-label text-black mb-0 fs-6">Wealth & Investing</h5>
                    <span className="badge bg-dark text-white rounded-0 text-uppercase scandi-label">Step 2</span>
                  </div>

                  {/* 1. Portfolio Base */}
                  <div className="mb-4">
                    <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                      Portfolio Base
                      <InfoTooltip text="Simulation horizon years, starting liquid balance, and Low/Medium/High compound annual return assumptions." />
                    </h6>
                    <div className="row g-3 align-items-end">
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label text-black fw-bolder">Sim Term (Yrs)</label>
                        <input name="simulationYears" type="number" className="form-control scandi-input border-dark bg-white fw-bold" value={loanConfig.simulationYears} onChange={handleConfigChange} />
                      </div>
                      <div className="col-sm-6 col-md-3">
                        <label className="form-label scandi-label">Init. Port. ($)</label>
                        <input name="initialInvestment" type="number" className="form-control scandi-input border-dark bg-white" value={loanConfig.initialInvestment} onChange={handleConfigChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label scandi-label">Yield Estimates (Low / Med / High %)</label>
                        <div className="input-group">
                          <input name="investRateLow" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.investRateLow} onChange={handleConfigChange} />
                          <span className="input-group-text bg-white text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                          <input name="investRateMed" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.investRateMed} onChange={handleConfigChange} />
                          <span className="input-group-text bg-white text-dark fw-bold border-dark border-start-0 border-end-0">/</span>
                          <input name="investRateHigh" type="number" step="0.1" className="form-control scandi-input border-dark bg-white px-2 text-center" value={loanConfig.investRateHigh} onChange={handleConfigChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Ongoing Contributions */}
                  <div className="mb-4 pt-3 border-top border-secondary">
                    <h6 className="scandi-label text-muted mb-3 d-flex align-items-center">
                      Ongoing Contributions
                      <InfoTooltip text="Schedule contributions and assign tax account types: Taxable Brokerage, Pre-Tax (401k/IRA), or Roth IRA (Tax-Free)." />
                    </h6>
                    <div className="bg-white p-3 border border-dark">
                      {investments.length === 0 && <div className="text-muted small fst-italic mb-3">No direct investments scheduled.</div>}
                      {investments.map(item => (
                        <StrategyRow 
                          key={item.id} 
                          item={item} 
                          isInvestment={true}
                          onUpdate={(id, field, val) => updateStrategy(id, field, val, setInvestments)} 
                          onRemove={(id) => removeStrategy(id, setInvestments)} 
                        />
                      ))}
                      <button className="btn btn-sm btn-outline-dark fw-bold mt-2 mb-3 w-100" onClick={() => addStrategy(setInvestments, { amount: 0, frequency: 1, startDate: defaultStartDate, accountType: 'TAXABLE' })}>+ Add Investment</button>
                      
                      <div className="d-flex align-items-center gap-3 p-3 bg-light border border-dark">
                        <input 
                          className="scandi-checkbox" 
                          type="checkbox" 
                          name="divertAfterPayoff" 
                          id="divertCheck"
                          checked={loanConfig.divertAfterPayoff} 
                          onChange={handleConfigChange}
                        />
                        <label className="scandi-label m-0 text-black lh-sm" htmlFor="divertCheck" style={{ cursor: 'pointer' }}>
                          Auto-invest freed cash post-mortgage
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: RETIREMENT & SOCIAL SECURITY */}
          {showRetirement && (
            <div className="col-12">
              <div className="bg-light p-4 border border-dark">
                <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-4">
                  <h5 className="scandi-label text-black mb-0 fs-6">Retirement & Social Security</h5>
                  <span className="badge bg-dark text-white rounded-0 text-uppercase scandi-label">Step 3</span>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3 bg-white p-3 border border-dark">
                  <input 
                    className="scandi-checkbox" 
                    type="checkbox" 
                    name="enableRetirement" 
                    id="enableRetirementCheck"
                    checked={loanConfig.enableRetirement} 
                    onChange={handleConfigChange}
                  />
                  <label className="scandi-label m-0 text-black lh-sm fs-6" htmlFor="enableRetirementCheck" style={{ cursor: 'pointer' }}>
                    Enable Retirement Withdrawals
                  </label>
                </div>

                {loanConfig.enableRetirement && (
                  <div className="row g-3 align-items-end mt-1 bg-white p-4 border border-dark">
                    <div className="col-md-6">
                      <label className="form-label scandi-label">Retirement Date</label>
                      <input name="retirementDate" type="date" className="form-control scandi-input border-dark" value={loanConfig.retirementDate} onChange={handleConfigChange} />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label scandi-label">Withdrawal Type</label>
                      <select name="withdrawalType" className="form-select scandi-input border-dark" value={loanConfig.withdrawalType} onChange={handleConfigChange}>
                        <option value="percent_fixed">% of Starting Balance (Locked)</option>
                        <option value="percent_dynamic">% of Current Balance (Dynamic)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      {loanConfig.withdrawalType === 'fixed' ? (
                        <>
                          <label className="form-label scandi-label">Yearly Pull ($)</label>
                          <input name="retirementFixedWithdrawal" type="number" step="1000" className="form-control scandi-input border-dark" value={loanConfig.retirementFixedWithdrawal} onChange={handleConfigChange} />
                        </>
                      ) : (
                        <>
                          <label className="form-label scandi-label">Yearly Pull (%)</label>
                          <input name="retirementWithdrawalRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.retirementWithdrawalRate} onChange={handleConfigChange} />
                        </>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label scandi-label">Ret. Growth (%)</label>
                      <input name="retirementGrowthRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.retirementGrowthRate} onChange={handleConfigChange} />
                    </div>

                    <div className="col-12 mt-3">
                      <div className="d-flex align-items-center gap-3 p-3 bg-light border border-dark">
                        <input 
                          className="scandi-checkbox" 
                          type="checkbox" 
                          name="stopContributionsInRetirement" 
                          id="stopContribCheck"
                          checked={loanConfig.stopContributionsInRetirement} 
                          onChange={handleConfigChange}
                        />
                        <label className="scandi-label m-0 text-black lh-sm" htmlFor="stopContribCheck" style={{ cursor: 'pointer' }}>
                          Stop all new contributions at retirement
                        </label>
                      </div>
                    </div>

                    {/* Social Security & Pension Sub-Panel */}
                    <div className="col-12 mt-3 border-top border-dark pt-3">
                      {socialSecurityConfig && (
                        <SocialSecurityControlPanel 
                          socialSecurityConfig={socialSecurityConfig} 
                          handleSocialSecurityConfigChange={handleSocialSecurityConfigChange} 
                        />
                      )}
                    </div>
                    
                    {/* MONTE CARLO TRIGGER */}
                    <div className="col-12 mt-4 pt-3 border-top border-dark">
                      <button className="btn btn-dark fw-bold w-100 py-3 scandi-label fs-6 text-uppercase shadow-sm" onClick={handleOpenMonteCarlo}>
                        Run Monte Carlo Analysis
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: TAX & JURISDICTION */}
          {showTaxes && (
            <div className="col-12">
              <div className="bg-light p-4 border border-dark">
                <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-4">
                  <h5 className="scandi-label text-black mb-0 fs-6">Tax & Jurisdiction</h5>
                  <span className="badge bg-dark text-white rounded-0 text-uppercase scandi-label">Step 4</span>
                </div>
                {taxConfig && (
                  <TaxControlPanel taxConfig={taxConfig} handleTaxConfigChange={handleTaxConfigChange} />
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
