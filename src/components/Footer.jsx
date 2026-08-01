import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-5 pt-4 border-top border-dark text-muted small" style={{ lineHeight: '1.6' }}>
      {/* Open Source Banner & GitHub Repository Link */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 p-3 bg-white border border-dark">
        <div>
          <h6 className="scandi-label text-black mb-1 fs-6">Open-Source Financial Engine</h6>
          <p className="mb-0 text-muted small">
            Strategy Engine is an open-source project licensed under the <strong>Apache License 2.0</strong>. Community contributions, suggestions, and feedback are welcome.
          </p>
        </div>
        <a 
          href="https://github.com/awanczowski/financial-strategy-engine" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline-dark btn-sm fw-bold scandi-label d-inline-flex align-items-center gap-2 px-3 py-2 text-nowrap"
          title="View Strategy Engine source code on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          View on GitHub
        </a>
      </div>

      {/* Legal & Financial Disclaimer */}
      <div>
        <strong>Disclaimer:</strong> The information, projections, and calculations provided by this application are for educational and informational purposes only and do not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, compounding discrepancies, inflation, and tax implications will vary over time and may significantly alter these figures. You should not make any financial or investment decisions based solely on this tool. Please consult with a qualified, licensed financial advisor or legal professional before making any major financial decisions or entering into any binding agreements.
      </div>
    </footer>
  );
}
