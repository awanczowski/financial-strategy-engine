import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App.jsx';

describe('App Component', () => {
  it('renders the Strategy Engine navigation header with mode toggles and inflation input', () => {
    render(<App />);
    expect(screen.getByText('Strategy Engine')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Inflation View Mode' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Estimated Inflation Rate Percentage/i)).toBeInTheDocument();
  });

  it('renders dashboard card titles', () => {
    render(<App />);
    expect(screen.getByText('Cash Flow & Debt')).toBeInTheDocument();
    expect(screen.getByText('Final Net Worth')).toBeInTheDocument();
  });

  it('renders parameter panel controls including Mortgage Refinances section', () => {
    render(<App />);
    expect(screen.getAllByText('Real Estate & Mortgage').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wealth & Investing').length).toBeGreaterThan(0);
    expect(screen.getByText('Mortgage Refinances')).toBeInTheDocument();
    expect(screen.getByText('+ Add Refinance')).toBeInTheDocument();
  });

  it('allows changing investment contribution account types multiple times without locking', () => {
    render(<App />);
    const wealthTab = screen.getByRole('button', { name: /Wealth & Investing/i });
    fireEvent.click(wealthTab);
    const selects = screen.getAllByTitle('Account Bucket');
    expect(selects.length).toBeGreaterThan(0);
    const select = selects[0];

    fireEvent.change(select, { target: { value: 'TAX_DEFERRED' } });
    expect(select.value).toBe('TAX_DEFERRED');

    fireEvent.change(select, { target: { value: 'TAX_FREE' } });
    expect(select.value).toBe('TAX_FREE');

    fireEvent.change(select, { target: { value: 'TAXABLE' } });
    expect(select.value).toBe('TAXABLE');
  });
});


