import React from 'react';
import { formatCurrency } from '../lib/formatters.js';

export default function DashboardCards({ initialBreakdown, summary }) {
  return (
    <>
      {/* Lined Up Summary Dashboard */}
      <div className="row g-4 mb-4">
        {initialBreakdown && (
          <div className="col-lg-6">
            <div className="card dashboard-card bg-white h-100">
              <div className="card-body d-flex flex-column justify-content-between p-4">
                <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Base Payment Breakdown ({initialBreakdown.frequency})</h6>
                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span className="text-black small fw-bold text-uppercase">Total Payment</span>
                  <span className="text-black fw-bolder fs-4">{formatCurrency(initialBreakdown.periodicPayment)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-bold">Principal Portion (P.1)</span>
                  <span className="text-muted fw-bold">{formatCurrency(initialBreakdown.principalPortion)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-bold">Interest Portion (P.1)</span>
                  <span className="text-muted fw-bold">{formatCurrency(initialBreakdown.interestPortion)}</span>
                </div>
                {initialBreakdown.extraInMonth1 > 0 && (
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top border-dark">
                    <span className="text-black small fw-bold">Extra Applied (Date 1)</span>
                    <span className="text-black fw-bold">+{formatCurrency(initialBreakdown.extraInMonth1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-lg-6">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Cash Flow & Debt</h6>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold text-uppercase">Payoff Date</span>
                <span className="text-black fw-bolder fs-4">{summary.payoffString}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold text-uppercase">Total Interest</span>
                <span className="text-danger fw-bold">{formatCurrency(summary.totalInterestPaid)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold text-uppercase">Total Invested</span>
                <span className="text-black fw-bold">{formatCurrency(summary.totalInvestContributed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold text-uppercase">Total Withdrawn</span>
                <span className="text-success fw-bold">{formatCurrency(summary.totalWithdrawnOverall)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Home Value</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalHomeMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalHomeHigh)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <h6 className="card-subtitle mb-4 scandi-label text-muted border-bottom border-dark pb-2">Final Portfolio</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalInvLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bold fs-5">{formatCurrency(summary.finalInvMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalInvHigh)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card bg-white h-100">
            <div className="card-body d-flex flex-column justify-content-between p-4 bg-light">
              <h6 className="card-subtitle mb-4 scandi-label text-black border-bottom border-dark pb-2">Final Net Worth</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small fw-bold">Low</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthLow)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 align-items-center">
                <span className="text-black small fw-bold">Med</span>
                <span className="text-black fw-bolder fs-4">{formatCurrency(summary.finalNetWorthMed)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small fw-bold">High</span>
                <span className="text-muted fw-bold">{formatCurrency(summary.finalNetWorthHigh)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
