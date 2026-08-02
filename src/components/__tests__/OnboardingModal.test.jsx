import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingModal, { TOUR_STEPS } from '../OnboardingModal.jsx';

describe('OnboardingModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when show is false', () => {
    const { container } = render(<OnboardingModal show={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the first step when show is true', () => {
    render(<OnboardingModal show={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Welcome to Strategy Engine')).toBeInTheDocument();
    expect(screen.getByText(`Step 1 of ${TOUR_STEPS.length}`)).toBeInTheDocument();
    expect(screen.getByText(/Core Philosophy/i)).toBeInTheDocument();
  });

  it('navigates next and back through tour steps', () => {
    render(<OnboardingModal show={true} onClose={vi.fn()} />);
    
    const nextBtn = screen.getByRole('button', { name: /Next →/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Mortgage Base & Accelerated Payments')).toBeInTheDocument();
    expect(screen.getByText(`Step 2 of ${TOUR_STEPS.length}`)).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /← Back/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('Welcome to Strategy Engine')).toBeInTheDocument();
  });

  it('persists dontShowAgain setting to localStorage', () => {
    const onCloseMock = vi.fn();
    render(<OnboardingModal show={true} onClose={onCloseMock} />);

    const checkbox = screen.getByLabelText(/Don't show automatically on startup/i);
    fireEvent.click(checkbox);

    expect(localStorage.getItem('hasCompletedOnboardingTour')).toBe('true');

    const skipBtn = screen.getByRole('button', { name: /Skip Tour/i });
    fireEvent.click(skipBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('completes tour when clicking Finish on the last step', () => {
    const onCloseMock = vi.fn();
    render(<OnboardingModal show={true} onClose={onCloseMock} />);

    // Fast-forward to last step
    for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
      const nextBtn = screen.getByRole('button', { name: /Next →/i });
      fireEvent.click(nextBtn);
    }

    expect(screen.getByText(`Step ${TOUR_STEPS.length} of ${TOUR_STEPS.length}`)).toBeInTheDocument();
    const finishBtn = screen.getByRole('button', { name: /Finish Tour ✓/i });
    fireEvent.click(finishBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
