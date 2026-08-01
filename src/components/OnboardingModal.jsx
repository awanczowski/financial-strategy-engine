import React, { useState, useEffect } from 'react';

export const TOUR_STEPS = [
  {
    step: 1,
    title: 'Welcome to Strategy Engine',
    subtitle: 'Apples-to-Apples Debt vs. Investment Calculator',
    description: 'Strategy Engine provides a mathematically rigorous, period-by-period comparison between aggressive mortgage debt reduction and compounding market investments.',
    tip: 'Observe how freeing up cash flow early alters long-term net worth trajectories.',
    badge: 'Core Philosophy'
  },
  {
    step: 2,
    title: 'Mortgage Base & Accelerated Payments',
    subtitle: 'Principal, Interest Rates & Scheduled Paydowns',
    description: 'Enter your loan balance, interest rate, and term. Enable 26-period Accelerated Bi-Weekly payments or schedule recurring monthly/annual extra principal paydowns.',
    tip: 'Extra principal payments reduce remaining balance immediately, shortening your loan term and interest drag.',
    badge: 'Mortgage Engine'
  },
  {
    step: 3,
    title: 'Refinance & Rate Adjustment Events',
    subtitle: 'ARM Rate Shifts & Breakeven Timelines',
    description: 'Schedule future Adjustable Rate Mortgage (ARM) shifts or explicit Refinance events with closing cost roll-ins. Calculate monthly payment savings and exact interest breakeven dates.',
    tip: 'Refinancing to a lower rate lowers your base monthly obligation, freeing up capital for market accumulation.',
    badge: 'Refinance Engine'
  },
  {
    step: 4,
    title: 'Multi-Bucket Wealth Accumulation',
    subtitle: 'Taxable Brokerage, Pre-Tax (401k/IRA) & Roth IRA',
    description: 'Differentiate your ongoing investments by tax classification: Taxable Brokerage (subject to annual dividend tax drag), Pre-Tax 401k/IRA (tax-deferred), or Roth IRA (tax-free).',
    tip: 'In retirement, decumulation sequentially draws from Taxable → Pre-Tax (grossed up for income tax) → Roth IRA.',
    badge: 'Wealth Engine'
  },
  {
    step: 5,
    title: 'Tax Strategy & Jurisdiction Engine',
    subtitle: 'MID Shields, SALT Caps & Regional Presets',
    description: 'Enable the Tax Engine to model state income taxes (NY, CA, TX/FL presets), property tax, itemized Mortgage Interest Deduction (MID) shields up to the $750k cap, and custom SALT deduction limits.',
    tip: 'Itemized mortgage interest deduction acts as a tax shield that effectively reduces your net mortgage interest rate.',
    badge: 'Tax Engine'
  },
  {
    step: 6,
    title: 'Real vs. Nominal Dollar Analysis',
    subtitle: 'Purchasing Power Inflation Discounting',
    description: 'Toggle between Nominal Future Dollars and Real Purchasing Power. Real mode discounts future nominal figures using your estimated inflation rate (e.g. 2.5% per year).',
    tip: 'Real dollars reveal what your future net worth will actually buy in today’s purchasing power.',
    badge: 'Analysis Mode'
  },
  {
    step: 7,
    title: 'Monte Carlo Stress Testing',
    subtitle: 'Sequence-of-Return Risk & Survival Probabilities',
    description: 'Run thousands of randomized market return simulations using lognormal return distributions. Stress-test your portfolio across volatile market cycles over 55-year horizons.',
    tip: 'Straight-line average returns ignore market drops. Monte Carlo calculates your true statistical probability of success.',
    badge: 'Stress Testing'
  },
  {
    step: 8,
    title: 'Share Scenarios & Built-in Templates',
    subtitle: 'Base64 Share Links, JSON Export & Strategy Gallery',
    description: 'Generate Base64 encoded share URLs to save or send your strategy, export JSON configuration files, or load 6 pre-configured templates (FIRE, Tax-Shielded, Refinance Drop, Bi-Weekly Roth).',
    tip: 'Click "Share" in the navigation bar at any time to copy your custom strategy URL.',
    badge: 'Sharing & Presets'
  }
];

export default function OnboardingModal({ show, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hasCompletedOnboardingTour');
      if (stored === 'true') {
        setDontShowAgain(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleComplete();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, currentStepIndex, dontShowAgain]);

  if (!show) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPct = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      if (dontShowAgain) {
        localStorage.setItem('hasCompletedOnboardingTour', 'true');
      } else {
        localStorage.removeItem('hasCompletedOnboardingTour');
      }
    }
    setCurrentStepIndex(0);
    onClose();
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setDontShowAgain(isChecked);
    if (typeof window !== 'undefined') {
      if (isChecked) {
        localStorage.setItem('hasCompletedOnboardingTour', 'true');
      } else {
        localStorage.removeItem('hasCompletedOnboardingTour');
      }
    }
  };

  return (
    <div 
      className="modal show d-block tab-modal-backdrop" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1060 }}
      role="dialog"
      aria-labelledby="onboardingModalTitle"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-dark rounded-0 shadow-lg bg-white">
          
          {/* Header */}
          <div className="modal-header border-bottom border-dark bg-light px-4 py-3 align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark text-white rounded-0 px-2 py-1 scandi-label text-uppercase" style={{ letterSpacing: '0.05em' }}>
                {currentStep.badge}
              </span>
              <span className="scandi-label text-muted fs-7 ms-2">
                Step {currentStep.step} of {TOUR_STEPS.length}
              </span>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close onboarding tour" 
              onClick={handleComplete}
            ></button>
          </div>

          {/* Progress Bar */}
          <div className="progress rounded-0 bg-secondary-subtle" style={{ height: '4px' }}>
            <div 
              className="progress-bar bg-dark transition-all" 
              role="progressbar" 
              style={{ width: `${progressPct}%` }}
              aria-valuenow={progressPct}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            <div className="mb-3">
              <h4 className="fw-bold text-black mb-1" id="onboardingModalTitle">
                {currentStep.title}
              </h4>
              <h6 className="scandi-label text-muted fw-normal mb-3">
                {currentStep.subtitle}
              </h6>
            </div>

            <p className="fs-6 text-dark lh-base mb-4">
              {currentStep.description}
            </p>

            {/* Financial Tip Box */}
            <div className="p-3 bg-light border border-dark mb-4">
              <div className="d-flex align-items-start gap-2">
                <span className="fw-bold text-black">💡 Strategy Tip:</span>
                <span className="small text-muted">{currentStep.tip}</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="d-flex justify-content-center gap-1 mb-2">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  className={`btn p-0 border-0 rounded-circle ${idx === currentStepIndex ? 'bg-dark' : 'bg-secondary-subtle'}`}
                  style={{ width: '10px', height: '10px', transition: 'background-color 0.2s' }}
                  onClick={() => setCurrentStepIndex(idx)}
                  title={`Go to step ${s.step}: ${s.title}`}
                />
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="modal-footer border-top border-dark px-4 py-3 d-flex justify-content-between align-items-center bg-light">
            <div className="form-check m-0">
              <input 
                className="form-check-input scandi-checkbox border-dark" 
                type="checkbox" 
                id="dontShowAgainCheck"
                checked={dontShowAgain}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label scandi-label text-muted small ms-1" htmlFor="dontShowAgainCheck" style={{ cursor: 'pointer' }}>
                Don't show automatically on startup
              </label>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm scandi-label"
                onClick={handleComplete}
              >
                Skip Tour
              </button>
              
              {!isFirstStep && (
                <button 
                  type="button" 
                  className="btn btn-outline-dark btn-sm scandi-label fw-bold"
                  onClick={handlePrev}
                >
                  ← Back
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-dark btn-sm scandi-label fw-bold px-3"
                onClick={handleNext}
              >
                {isLastStep ? 'Finish Tour ✓' : 'Next →'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
