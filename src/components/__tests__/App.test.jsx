import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App.jsx';

describe('App Component', () => {
  it('renders the Strategy Engine navigation header', () => {
    render(<App />);
    expect(screen.getByText('Strategy Engine')).toBeInTheDocument();
  });

  it('renders dashboard card titles', () => {
    render(<App />);
    expect(screen.getByText('Cash Flow & Debt')).toBeInTheDocument();
    expect(screen.getByText('Final Net Worth')).toBeInTheDocument();
  });

  it('renders parameter panel controls', () => {
    render(<App />);
    expect(screen.getByText('Real Estate & Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Wealth & Investing')).toBeInTheDocument();
  });
});
