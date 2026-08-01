import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParameterPanel from '../ParameterPanel.jsx';
import AmortizationTable from '../AmortizationTable.jsx';
import { StrategyProvider } from '../../context/StrategyContext.jsx';
import App from '../../App.jsx';

describe('ParameterPanel layout and tab controls', () => {
  it('switches active tabs correctly when tab buttons are clicked', () => {
    localStorage.setItem('hasCompletedOnboardingTour', 'true');
    render(<App />);

    // Click Mortgage & Real Estate tab
    const mortgageTab = screen.getByRole('button', { name: /Real Estate & Mortgage/i });
    fireEvent.click(mortgageTab);
    expect(screen.getByText('Filtered: mortgage')).toBeInTheDocument();

    // Click Wealth & Investing tab
    const wealthTab = screen.getByRole('button', { name: /Wealth & Investing/i });
    fireEvent.click(wealthTab);
    expect(screen.getByText('Filtered: wealth')).toBeInTheDocument();

    // Click All Controls tab
    const allTab = screen.getByRole('button', { name: /All Controls/i });
    fireEvent.click(allTab);
    expect(screen.getByText('Showing All Controls')).toBeInTheDocument();
  });
});

describe('AmortizationTable view preset filters', () => {
  const dummySchedule = [
    {
      year: 2026,
      activeRate: 6.5,
      mortgageBalance: 300000,
      interestPaid: 19500,
      homeMed: 500000,
      investContributed: 12000,
      withdrawn: 0,
      invLow: 50000,
      invMed: 55000,
      invHigh: 60000,
      netWorthMed: 255000
    }
  ];

  it('filters table columns according to selected view preset', () => {
    render(<AmortizationTable scheduleData={dummySchedule} />);

    // Default view: All Columns
    expect(screen.getByText('Rate (E.O.Y)')).toBeInTheDocument();
    expect(screen.getByText('Invested (Yr)')).toBeInTheDocument();

    // Switch to Debt & Payoff
    const debtFilter = screen.getByRole('button', { name: /Debt & Payoff/i });
    fireEvent.click(debtFilter);
    expect(screen.getByText('Rate (E.O.Y)')).toBeInTheDocument();
    expect(screen.queryByText('Invested (Yr)')).not.toBeInTheDocument();

    // Switch to Wealth & Portfolio
    const wealthFilter = screen.getByRole('button', { name: /Wealth & Portfolio/i });
    fireEvent.click(wealthFilter);
    expect(screen.queryByText('Rate (E.O.Y)')).not.toBeInTheDocument();
    expect(screen.getByText('Invested (Yr)')).toBeInTheDocument();
  });
});
