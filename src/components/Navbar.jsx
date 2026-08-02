import React from 'react';
import { useStrategy } from '../context/useStrategy.js';

export default function Navbar({ loanConfig: propLoanConfig, handleConfigChange: propHandleConfigChange }) {
  const strategyCtx = useStrategy() || {};
  const loanConfig = propLoanConfig || strategyCtx.loanConfig || {};
  const handleConfigChange = propHandleConfigChange || strategyCtx.handleConfigChange;
  const viewMode = strategyCtx.viewMode || 'nominal';
  const setViewMode = strategyCtx.setViewMode || (() => {});
  const theme = strategyCtx.theme || 'light';
  const toggleTheme = strategyCtx.toggleTheme || (() => {});

  return (
    <header className="w-100 border-bottom border-dark navbar-header px-3 px-md-4 py-2 py-md-3" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 gap-sm-3 max-w-100 mx-auto">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="h4 mb-0 scandi-header brand-header">Strategy Engine</h1>
        </div>

        <div className="d-flex align-items-center justify-content-between justify-content-sm-end flex-wrap gap-2 gap-sm-3">
          {/* Display Mode Toggle */}
          <div className="d-flex align-items-center gap-1 gap-sm-2">
            <span className="scandi-label text-muted d-none d-md-inline">Display:</span>
            <div className="btn-group border border-dark" role="group" aria-label="Inflation View Mode">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'nominal' ? 'btn-dark' : 'bg-white text-dark'} fw-bold scandi-label px-2 px-sm-3`}
                onClick={() => setViewMode('nominal')}
              >
                <span className="d-none d-sm-inline">Nominal Dollars</span>
                <span className="d-sm-none">Nominal</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'real' ? 'btn-dark' : 'bg-white text-dark'} fw-bold scandi-label px-2 px-sm-3`}
                onClick={() => setViewMode('real')}
              >
                <span className="d-none d-sm-inline">Today's Dollars (Real)</span>
                <span className="d-sm-none">Real ($ Today)</span>
              </button>
            </div>
          </div>

          {/* Est. Inflation Input */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="navInflationRate" className="scandi-label text-muted mb-0 text-nowrap">
              <span className="d-none d-md-inline">Est. Inflation:</span>
              <span className="d-md-none">Inflation:</span>
            </label>
            <div className="input-group input-group-sm" style={{ width: '105px' }}>
              <input
                id="navInflationRate"
                name="estimatedInflationRate"
                type="number"
                step="0.1"
                className="form-control scandi-input border-dark text-center px-1 fw-bold"
                value={loanConfig.estimatedInflationRate ?? ''}
                onChange={handleConfigChange}
                aria-label="Estimated Inflation Rate Percentage"
              />
              <span className="input-group-text bg-light text-dark fw-bold border-dark px-2">%</span>
            </div>
          </div>

          {/* Guided Onboarding Tour Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-dark fw-bold scandi-label px-2 px-sm-3 d-inline-flex align-items-center gap-1"
            onClick={() => strategyCtx.setShowOnboardingModal && strategyCtx.setShowOnboardingModal(true)}
            title="Launch interactive guided onboarding tour"
          >
            <span>Guided Tour</span>
          </button>

          {/* Share Scenario Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-dark fw-bold scandi-label px-2 px-sm-3"
            onClick={() => strategyCtx.setShowShareModal && strategyCtx.setShowShareModal(true)}
          >
            <span className="d-none d-sm-inline">Share Scenario</span><span className="d-sm-none">Share</span>
          </button>

          {/* Dark Mode Toggle Button with Flat SVG Icons */}
          <button
            type="button"
            className="btn btn-sm btn-outline-dark fw-bold scandi-label px-2 px-sm-3 d-inline-flex align-items-center gap-1 theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" fill="currentColor"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
            <span className="d-none d-sm-inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

        </div>
      </div>

      {/* Floating Toast Notification */}
      {strategyCtx.toastMessage && (
        <div 
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white border border-white shadow-lg"
          style={{ zIndex: 1060, fontSize: '0.85rem', fontWeight: 'bold' }}
        >
          {strategyCtx.toastMessage}
        </div>
      )}
    </header>
  );
}

