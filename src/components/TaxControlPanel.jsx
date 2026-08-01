import React from 'react';

export default function TaxControlPanel({ taxConfig, handleTaxConfigChange }) {
  const isCustomSalt = taxConfig.saltCapLimit === 'CUSTOM';

  return (
    <div className="card p-3 mb-4 border-dark bg-white shadow-sm">
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-3">
        <h6 className="scandi-label text-black mb-0 fs-6">🏛️ Tax & Jurisdiction Strategy</h6>
        <div className="d-flex align-items-center gap-2">
          <input 
            className="scandi-checkbox" 
            type="checkbox" 
            name="enableTaxEngine" 
            id="enableTaxEngineCheck"
            checked={taxConfig.enableTaxEngine} 
            onChange={handleTaxConfigChange}
          />
          <label className="scandi-label m-0 text-black lh-sm" htmlFor="enableTaxEngineCheck" style={{ cursor: 'pointer' }}>
            Enable Tax Engine
          </label>
        </div>
      </div>

      {!taxConfig.enableTaxEngine ? (
        <div className="text-muted small fst-italic">
          Tax Engine is currently <strong>disabled</strong> (simulation runs in gross mode). Enable above to account for Tax Drag, Multi-Bucket decumulation, and MID / SALT tax shields.
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Jurisdiction Preset</label>
            <select name="jurisdiction" className="form-select scandi-input border-dark" value={taxConfig.jurisdiction} onChange={handleTaxConfigChange}>
              <option value="NY_NYC">🗽 New York (NY State + NYC)</option>
              <option value="CA">🌴 California (CA State)</option>
              <option value="TX_FL">🤠 Texas / Florida (No State Tax)</option>
              <option value="CUSTOM">⚙️ Custom Jurisdiction</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Filing Status</label>
            <select name="filingStatus" className="form-select scandi-input border-dark" value={taxConfig.filingStatus} onChange={handleTaxConfigChange}>
              <option value="MFJ">Married Jointly ($30k Std Ded)</option>
              <option value="SINGLE">Single ($15k Std Ded)</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Current Marginal Rate (%)</label>
            <input name="currentMarginalRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={taxConfig.currentMarginalRate} onChange={handleTaxConfigChange} />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Ret. Effective Tax Rate (%)</label>
            <input name="retirementEffectiveRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={taxConfig.retirementEffectiveRate} onChange={handleTaxConfigChange} />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Capital Gains Rate (%)</label>
            <input name="capitalGainsRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={taxConfig.capitalGainsRate} onChange={handleTaxConfigChange} />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Annual Property Tax ($)</label>
            <input name="annualPropertyTax" type="number" step="500" className="form-control scandi-input border-dark" value={taxConfig.annualPropertyTax} onChange={handleTaxConfigChange} />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Annual State Income Tax ($)</label>
            <input name="stateTaxAmount" type="number" step="500" className="form-control scandi-input border-dark" value={taxConfig.stateTaxAmount || 0} onChange={handleTaxConfigChange} />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">SALT Deduction Cap ($)</label>
            <select name="saltCapLimit" className="form-select scandi-input border-dark" value={taxConfig.saltCapLimit} onChange={handleTaxConfigChange}>
              <option value="10000">$10,000 (Standard TCJA Cap)</option>
              <option value="20000">$20,000 (Adjusted Proposal)</option>
              <option value="5000">$5,000 (Single Cap)</option>
              <option value="UNLIMITED">Unlimited / Pre-2018 (PTET)</option>
              <option value="CUSTOM">Custom Amount...</option>
            </select>
          </div>

          {isCustomSalt && (
            <div className="col-sm-6 col-md-4">
              <label className="form-label scandi-label">Custom SALT Cap ($)</label>
              <input name="customSaltCap" type="number" step="500" className="form-control scandi-input border-dark" value={taxConfig.customSaltCap} onChange={handleTaxConfigChange} />
            </div>
          )}

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Other Itemized Deductions ($)</label>
            <input name="otherItemizedDeductions" type="number" step="500" className="form-control scandi-input border-dark" value={taxConfig.otherItemizedDeductions || 0} onChange={handleTaxConfigChange} placeholder="Charitable, etc." />
          </div>
        </div>
      )}
    </div>
  );
}
