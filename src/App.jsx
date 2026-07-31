import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar.jsx';
import DashboardCards from './components/DashboardCards.jsx';
import ParameterPanel from './components/ParameterPanel.jsx';
import ChartSection from './components/ChartSection.jsx';
import AmortizationTable from './components/AmortizationTable.jsx';
import MonteCarloModal from './components/MonteCarloModal.jsx';
import { StrategyProvider } from './context/StrategyContext.jsx';
import { useStrategy } from './context/useStrategy.js';

function MainContent() {
  const {
    loanConfig,
    handleConfigChange,
    extraPayments,
    setExtraPayments,
    investments,
    setInvestments,
    rateAdjustments,
    setRateAdjustments,
    addStrategy,
    removeStrategy,
    updateStrategy,
    activeScheduleData,
    activeSummary,
    initialBreakdown,
    showMonteCarloModal,
    setShowMonteCarloModal,
    isSimulating,
    monteCarloResults,
    handleOpenMonteCarlo
  } = useStrategy();

  return (
    <div 
      className="text-dark font-monospace m-0 p-0 d-flex flex-column min-vh-100" 
      style={{ 
        width: '100vw', 
        overflowX: 'hidden', 
        backgroundColor: '#f9f9f9',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" 
      }}
    >
      <style>{`
        body, #root { max-width: none !important; width: 100vw !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }

        .card, .form-control, .btn, .input-group-text, .form-select { border-radius: 0 !important; box-shadow: none !important; }
        .scandi-input:focus, .form-select:focus { border-color: #000 !important; box-shadow: inset 0 0 0 1px #000 !important; outline: none; }
        .btn-outline-dark:hover { background-color: #000; color: #fff; }

        .dashboard-card { border: 1px solid #000 !important; transition: transform 0.2s ease; }
        .dashboard-card:hover { transform: translateY(-4px); }

        .scandi-checkbox {
          appearance: none; width: 24px; height: 24px; border: 1px solid #000; background-color: #fff; 
          cursor: pointer; position: relative; margin: 0; display: inline-block; flex-shrink: 0;
        }
        .scandi-checkbox:checked { background-color: #000; }
        .scandi-checkbox:checked::after {
          content: ''; position: absolute; left: 6px; top: 2px; width: 8px; height: 13px; 
          border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #fff; border-left: 1px solid #e5e5e5; }
        ::-webkit-scrollbar-thumb { background: #000; }

        .scandi-header { font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .scandi-label { font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; font-size: 0.75rem; }

        @media (min-width: 992px) {
          .border-lg-end { border-right: 1px solid #e5e5e5 !important; }
        }
      `}</style>

      {/* Monte Carlo Modal Overlay */}
      <MonteCarloModal 
        show={showMonteCarloModal}
        onClose={() => setShowMonteCarloModal(false)}
        isSimulating={isSimulating}
        results={monteCarloResults}
        loanConfig={loanConfig}
      />

      {/* Sticky Top Navigation Bar */}
      <Navbar />

      {/* Main Full-Width Content Area */}
      <main className="flex-grow-1 w-100 p-3 p-md-4 p-xl-5">
        
        {/* Lined Up Summary Dashboard */}
        <DashboardCards initialBreakdown={initialBreakdown} summary={activeSummary} />

        {/* Strategy Engine Controls */}
        <ParameterPanel 
          loanConfig={loanConfig}
          handleConfigChange={handleConfigChange}
          extraPayments={extraPayments}
          setExtraPayments={setExtraPayments}
          investments={investments}
          setInvestments={setInvestments}
          rateAdjustments={rateAdjustments}
          setRateAdjustments={setRateAdjustments}
          addStrategy={addStrategy}
          removeStrategy={removeStrategy}
          updateStrategy={updateStrategy}
          handleOpenMonteCarlo={handleOpenMonteCarlo}
        />

        {/* Chart Visualization */}
        <ChartSection scheduleData={activeScheduleData} />

        {/* Amortization Table */}
        <AmortizationTable scheduleData={activeScheduleData} />

        {/* Legal Disclaimer */}
        <footer className="mt-5 pt-4 border-top border-dark text-muted small" style={{ lineHeight: '1.6' }}>
          <strong>Disclaimer:</strong> The information, projections, and calculations provided by this application are for educational and informational purposes only and do not constitute financial, investment, legal, or tax advice. Projections are inherently hypothetical, based entirely on user inputs and assumed constant rates of return, which are not guaranteed. Actual market conditions, variable interest rates, compounding discrepancies, inflation, and tax implications will vary over time and may significantly alter these figures. You should not make any financial or investment decisions based solely on this tool. Please consult with a qualified, licensed financial advisor or legal professional before making any major financial decisions or entering into any binding agreements.
        </footer>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <StrategyProvider>
      <MainContent />
    </StrategyProvider>
  );
}