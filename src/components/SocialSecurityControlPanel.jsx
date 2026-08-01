import React from 'react';
import InfoTooltip from './InfoTooltip.jsx';

export default function SocialSecurityControlPanel({ socialSecurityConfig, handleSocialSecurityConfigChange }) {
  if (!socialSecurityConfig) return null;

  return (
    <div className="card p-3 mb-4 border-dark bg-white shadow-sm">
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark pb-2 mb-3">
        <h6 className="scandi-label text-black mb-0 fs-6 d-flex align-items-center">
          Social Security & Pension Income
          <InfoTooltip text="Models monthly Social Security distributions for Self and Spouse. Benefit inputs are in today's dollars (matching ssa.gov statements); annual COLA compounding starts from the base date through retirement to maintain purchasing power and offset portfolio withdrawals." />
        </h6>
        <div className="d-flex align-items-center gap-2">
          <input 
            className="scandi-checkbox" 
            type="checkbox" 
            name="enableSocialSecurity" 
            id="enableSSCheck"
            checked={socialSecurityConfig.enableSocialSecurity} 
            onChange={handleSocialSecurityConfigChange}
          />
          <label className="scandi-label m-0 text-black lh-sm" htmlFor="enableSSCheck" style={{ cursor: 'pointer' }}>
            Enable Social Security
          </label>
        </div>
      </div>

      {!socialSecurityConfig.enableSocialSecurity ? (
        <div className="text-muted small fst-italic">
          Social Security engine is currently <strong>disabled</strong>. Enable above to model Self & Spouse benefits, claim start dates, and COLA adjustments during decumulation.
        </div>
      ) : (
        <div className="row g-3">
          {/* Self Benefit Details */}
          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Self Monthly Benefit ($)</label>
            <input 
              name="selfMonthlyBenefit" 
              type="number" 
              step="50" 
              className="form-control scandi-input border-dark" 
              value={socialSecurityConfig.selfMonthlyBenefit} 
              onChange={handleSocialSecurityConfigChange} 
            />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Self Claim Start Date</label>
            <input 
              name="selfStartDate" 
              type="date" 
              className="form-control scandi-input border-dark" 
              value={socialSecurityConfig.selfStartDate} 
              onChange={handleSocialSecurityConfigChange} 
            />
          </div>

          <div className="col-sm-6 col-md-4">
            <label className="form-label scandi-label">Annual COLA Rate (%)</label>
            <input 
              name="annualColaRate" 
              type="number" 
              step="0.1" 
              className="form-control scandi-input border-dark" 
              value={socialSecurityConfig.annualColaRate} 
              onChange={handleSocialSecurityConfigChange} 
            />
          </div>

          {/* Spouse Checkbox */}
          <div className="col-12 pt-2 border-top border-light">
            <div className="d-flex align-items-center gap-2">
              <input 
                className="scandi-checkbox" 
                type="checkbox" 
                name="enableSpouseSS" 
                id="enableSpouseSSCheck"
                checked={socialSecurityConfig.enableSpouseSS} 
                onChange={handleSocialSecurityConfigChange}
              />
              <label className="scandi-label m-0 text-black lh-sm" htmlFor="enableSpouseSSCheck" style={{ cursor: 'pointer' }}>
                Include Spouse Benefit Distribution
              </label>
            </div>
          </div>

          {/* Spouse Details (Conditional) */}
          {socialSecurityConfig.enableSpouseSS && (
            <>
              <div className="col-sm-6 col-md-6">
                <label className="form-label scandi-label">Spouse Monthly Benefit ($)</label>
                <input 
                  name="spouseMonthlyBenefit" 
                  type="number" 
                  step="50" 
                  className="form-control scandi-input border-dark" 
                  value={socialSecurityConfig.spouseMonthlyBenefit} 
                  onChange={handleSocialSecurityConfigChange} 
                />
              </div>

              <div className="col-sm-6 col-md-6">
                <label className="form-label scandi-label">Spouse Claim Start Date</label>
                <input 
                  name="spouseStartDate" 
                  type="date" 
                  className="form-control scandi-input border-dark" 
                  value={socialSecurityConfig.spouseStartDate} 
                  onChange={handleSocialSecurityConfigChange} 
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
