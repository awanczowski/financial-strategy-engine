import React from 'react';
import { formatCurrency } from '../lib/formatters.js';

export default function AmortizationTable({ scheduleData }) {
  return (
    <>
      <h5 className="scandi-header mb-4 text-black">Yearly Rollup</h5>
      <div className="table-responsive border border-dark bg-white">
        <table className="table table-hover mb-0 text-end align-middle" style={{ whiteSpace: 'nowrap' }}>
          <thead className="border-bottom border-dark bg-light">
            <tr>
              <th className="text-start text-black scandi-label py-3 px-3">Year</th>
              <th className="text-black scandi-label py-3 px-3">Rate (E.O.Y)</th>
              <th className="text-black scandi-label py-3 px-3">Mortgage Bal.</th>
              <th className="text-danger scandi-label py-3 px-3">Interest (Yr)</th>
              <th className="text-black scandi-label py-3 px-3">Home (Med)</th>
              <th className="text-black scandi-label py-3 px-3">Invested (Yr)</th>
              <th className="text-success scandi-label py-3 px-3">Withdrawn (Yr)</th>
              <th className="text-muted scandi-label py-3 px-3 d-none d-md-table-cell">Port. Low</th>
              <th className="text-black scandi-label py-3 px-3 fw-bolder">Port. Med</th>
              <th className="text-black scandi-label py-3 px-3 d-none d-md-table-cell">Port. High</th>
              <th className="text-black scandi-label py-3 px-3 fw-bolder">Net Worth (Med)</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {scheduleData.map((row) => (
              <tr key={row.year} className="border-bottom border-light">
                <td className="text-start fw-bold text-black py-3 px-3">{row.year}</td>
                <td className="text-muted py-3 px-3">{row.mortgageBalance > 0 ? `${row.activeRate.toFixed(3)}%` : '-'}</td>
                <td className="fw-bold py-3 px-3">{formatCurrency(row.mortgageBalance)}</td>
                <td className="text-danger fw-bold py-3 px-3">{formatCurrency(row.interestPaid)}</td>
                <td className="py-3 px-3">{formatCurrency(row.homeMed)}</td>
                <td className="py-3 px-3">{formatCurrency(row.investContributed)}</td>
                <td className="text-success fw-bold py-3 px-3">{formatCurrency(row.withdrawn)}</td>
                <td className="text-muted py-3 px-3 d-none d-md-table-cell">{formatCurrency(row.invLow)}</td>
                <td className="text-black fw-bolder py-3 px-3">{formatCurrency(row.invMed)}</td>
                <td className="text-dark fw-bold py-3 px-3 d-none d-md-table-cell">{formatCurrency(row.invHigh)}</td>
                <td className="text-black fw-bolder py-3 px-3 bg-light border-start border-light">{formatCurrency(row.netWorthMed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
