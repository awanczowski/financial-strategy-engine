import React from 'react';
import { useStrategy } from '../context/useStrategy.js';

export default function Navbar({ loanConfig: propLoanConfig, handleConfigChange: propHandleConfigChange }) {
  const strategyCtx = useStrategy() || {};
  const loanConfig = propLoanConfig || strategyCtx.loanConfig || {};
  const handleConfigChange = propHandleConfigChange || strategyCtx.handleConfigChange;
  const viewMode = strategyCtx.viewMode || 'nominal';
  const setViewMode = strategyCtx.setViewMode || (() => {});

  return (
    <header className="w-100 border-bottom border-dark bg-white px-3 px-md-4 py-2 py-md-3" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 gap-sm-3 max-w-100 mx-auto">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="h4 mb-0 scandi-header text-black">Strategy Engine</h1>
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
                <span className="d-none d-sm-inline">💵 Nominal Dollars</span>
                <span className="d-sm-none">💵 Nominal</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'real' ? 'btn-dark' : 'bg-white text-dark'} fw-bold scandi-label px-2 px-sm-3`}
                onClick={() => setViewMode('real')}
              >
                <span className="d-none d-sm-inline">🏷️ Today's Dollars (Real)</span>
                <span className="d-sm-none">🏷️ Real ($ Today)</span>
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
        </div>
      </div>
    </header>
  );
}

