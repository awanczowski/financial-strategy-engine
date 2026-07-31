import React from 'react';
import { useStrategy } from '../context/useStrategy.js';

export default function Navbar({ loanConfig, handleConfigChange }) {
  const { viewMode, setViewMode } = useStrategy();

  return (
    <header className="w-100 border-bottom border-dark bg-white px-4 py-3" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 max-w-100 mx-auto">
        <h1 className="h4 mb-0 scandi-header text-black">Strategy Engine</h1>

        <div className="d-flex align-items-center gap-2">
          <span className="scandi-label text-muted d-none d-sm-inline">Display Mode:</span>
          <div className="btn-group border border-dark" role="group" aria-label="Inflation View Mode">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'nominal' ? 'btn-dark' : 'btn-white text-dark'} fw-bold scandi-label px-3`}
              onClick={() => setViewMode('nominal')}
            >
              💵 Nominal Dollars
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'real' ? 'btn-dark' : 'btn-white text-dark'} fw-bold scandi-label px-3`}
              onClick={() => setViewMode('real')}
            >
              🏷️ Today's Dollars (Real)
            </button>

          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="scandi-label text-muted d-none d-sm-inline">Est. Inflation (%):</span>
            <div className="btn-group border border-dark" role="group" aria-label="Inflation View Mode">
              <input name="estimatedInflationRate" type="number" step="0.1" className="form-control scandi-input border-dark" value={loanConfig.estimatedInflationRate} onChange={handleConfigChange} />
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}
