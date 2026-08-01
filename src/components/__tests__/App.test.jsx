import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('Real Estate & Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Wealth & Investing')).toBeInTheDocument();
    expect(screen.getByText('Mortgage Refinances')).toBeInTheDocument();
    expect(screen.getByText('+ Add Refinance')).toBeInTheDocument();
  });
});


