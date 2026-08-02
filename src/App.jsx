import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar.jsx';
import DashboardCards from './components/DashboardCards.jsx';
import ParameterPanel from './components/ParameterPanel.jsx';
import ChartSection from './components/ChartSection.jsx';
import AmortizationTable from './components/AmortizationTable.jsx';
import MonteCarloModal from './components/MonteCarloModal.jsx';
import ShareModal from './components/ShareModal.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import Footer from './components/Footer.jsx';
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
    refinances,
    setRefinances,
    taxConfig,
    handleTaxConfigChange,
    socialSecurityConfig,
    handleSocialSecurityConfigChange,
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
    handleOpenMonteCarlo,
    showShareModal,
    setShowShareModal,
    showOnboardingModal,
    setShowOnboardingModal,
    loadScenario,
    showToast,
    viewMode
  } = useStrategy();

  return (
    <div
      className="strategy-engine text-dark font-monospace m-0 p-0 d-flex flex-column min-vh-100"
    >

      {/* Monte Carlo Modal Overlay */}
      <MonteCarloModal
        show={showMonteCarloModal}
        onClose={() => setShowMonteCarloModal(false)}
        isSimulating={isSimulating}
        results={monteCarloResults}
        loanConfig={loanConfig}
        socialSecurityConfig={socialSecurityConfig}
        onReRun={handleOpenMonteCarlo}
      />

      {/* Scenario Share & Import/Export Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        loanConfig={loanConfig}
        extraPayments={extraPayments}
        investments={investments}
        rateAdjustments={rateAdjustments}
        refinances={refinances}
        taxConfig={taxConfig}
        socialSecurityConfig={socialSecurityConfig}
        viewMode={viewMode}
        onLoadScenario={loadScenario}
        onShowToast={showToast}
      />

      {/* Guided Onboarding Tutorial Modal */}
      <OnboardingModal
        show={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />

      {/* Sticky Top Navigation Bar */}
      <Navbar />

      {/* Main Full-Width Content Area */}
      <main className="flex-grow-1 w-100 p-3 p-md-4 p-xl-5">

        {/* Lined Up Summary Dashboard */}
        <DashboardCards
          initialBreakdown={initialBreakdown}
          summary={activeSummary}
          loanConfig={loanConfig}
          socialSecurityConfig={socialSecurityConfig}
          refinances={refinances}
          rateAdjustments={rateAdjustments}
        />

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
          refinances={refinances}
          setRefinances={setRefinances}
          taxConfig={taxConfig}
          handleTaxConfigChange={handleTaxConfigChange}
          socialSecurityConfig={socialSecurityConfig}
          handleSocialSecurityConfigChange={handleSocialSecurityConfigChange}
          addStrategy={addStrategy}
          removeStrategy={removeStrategy}
          updateStrategy={updateStrategy}
          handleOpenMonteCarlo={handleOpenMonteCarlo}
        />

        {/* Chart Visualization */}
        <ChartSection scheduleData={activeScheduleData} />

        {/* Amortization Table */}
        <AmortizationTable scheduleData={activeScheduleData} />

        {/* Footer with Open Source Banner, GitHub Repository Link, and Legal Disclaimer */}
        <Footer />

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