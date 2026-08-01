import React, { useState } from 'react';
import { formatCurrency } from '../lib/formatters.js';

export default function AmortizationTable({ scheduleData }) {
  const [tableFilter, setTableFilter] = useState('all');
  const hasSocialSecurityData = scheduleData?.some(r => (r.socialSecurity || 0) > 0);

  const showDebt = tableFilter === 'all' || tableFilter === 'debt';
  const showWealth = tableFilter === 'all' || tableFilter === 'wealth';
  const showIncome = tableFilter === 'all' || tableFilter === 'income';

  return (
    <div className="mb-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div>
          <h5 className="scandi-header mb-0 text-black">Yearly Rollup</h5>
          <span className="text-muted small">Filter table columns to focus on specific financial projections</span>
        </div>
        <div className="btn-group border border-dark p-1 bg-white" role="group" aria-label="Table View Filter">
          <button 
            type="button" 
            className={`btn btn-sm text-uppercase scandi-label py-1 px-3 border-0 rounded-0 ${tableFilter === 'all' ? 'btn-dark text-white fw-bold' : 'btn-light text-dark'}`}
            onClick={() => setTableFilter('all')}
          >
            All Columns
          </button>
          <button 
            type="button" 
            className={`btn btn-sm text-uppercase scandi-label py-1 px-3 border-0 rounded-0 ${tableFilter === 'debt' ? 'btn-dark text-white fw-bold' : 'btn-light text-dark'}`}
            onClick={() => setTableFilter('debt')}
          >
            Debt & Payoff
          </button>
          <button 
            type="button" 
            className={`btn btn-sm text-uppercase scandi-label py-1 px-3 border-0 rounded-0 ${tableFilter === 'wealth' ? 'btn-dark text-white fw-bold' : 'btn-light text-dark'}`}
            onClick={() => setTableFilter('wealth')}
          >
            Wealth & Portfolio
          </button>
          <button 
            type="button" 
            className={`btn btn-sm text-uppercase scandi-label py-1 px-3 border-0 rounded-0 ${tableFilter === 'income' ? 'btn-dark text-white fw-bold' : 'btn-light text-dark'}`}
            onClick={() => setTableFilter('income')}
          >
            Retirement Income
          </button>
        </div>
      </div>

      <div className="table-responsive border border-dark bg-white shadow-sm" style={{ maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
        <table className="table table-sm table-hover mb-0 text-end align-middle" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead className="border-bottom border-dark bg-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th className="text-start text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, left: 0, zIndex: 12, borderBottom: '2px solid #000' }}>Year</th>
              
              {showDebt && (
                <>
                  <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Rate (E.O.Y)</th>
                  <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Mortgage Bal.</th>
                  <th className="text-danger scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Interest (Yr)</th>
                  <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Home (Med)</th>
                </>
              )}

              {showWealth && (
                <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Invested (Yr)</th>
              )}

              {showIncome && (
                <>
                  <th className="text-success scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>
                    {hasSocialSecurityData ? 'Port. Withdraw (Yr)' : 'Withdrawn (Yr)'}
                  </th>
                  {hasSocialSecurityData && (
                    <>
                      <th className="text-primary scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Social Security (Yr)</th>
                      <th className="text-dark scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Total Ret. Income (Yr)</th>
                    </>
                  )}
                </>
              )}

              {showWealth && (
                <>
                  <th className="text-muted scandi-label py-2 px-2 d-none d-md-table-cell bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Port. Low</th>
                  <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Port. Med</th>
                  <th className="text-black scandi-label py-2 px-2 d-none d-md-table-cell bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Port. High</th>
                </>
              )}

              <th className="text-black scandi-label py-2 px-2 bg-light" style={{ position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #000' }}>Net Worth (Med)</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {scheduleData.map((row) => (
              <tr key={row.year} className="border-bottom border-light">
                <td className="text-start text-black py-2 px-2 bg-light" style={{ position: 'sticky', left: 0, zIndex: 5, borderRight: '1px solid #dee2e6' }}>{row.year}</td>
                
                {showDebt && (
                  <>
                    <td className="text-muted py-2 px-2">{row.mortgageBalance > 0 ? `${row.activeRate.toFixed(3)}%` : '-'}</td>
                    <td className="py-2 px-2">{formatCurrency(row.mortgageBalance)}</td>
                    <td className="text-danger py-2 px-2">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-2 px-2">{formatCurrency(row.homeMed)}</td>
                  </>
                )}

                {showWealth && (
                  <td className="py-2 px-2">{formatCurrency(row.investContributed)}</td>
                )}

                {showIncome && (
                  <>
                    <td className="text-success py-2 px-2">{formatCurrency(row.withdrawn)}</td>
                    {hasSocialSecurityData && (
                      <>
                        <td className="text-primary py-2 px-2">{formatCurrency(row.socialSecurity || 0)}</td>
                        <td className="text-dark py-2 px-2 bg-light-subtle">{formatCurrency(row.totalIncome || (row.withdrawn + (row.socialSecurity || 0)))}</td>
                      </>
                    )}
                  </>
                )}

                {showWealth && (
                  <>
                    <td className="text-muted py-2 px-2 d-none d-md-table-cell">{formatCurrency(row.invLow)}</td>
                    <td className="text-black py-2 px-2">{formatCurrency(row.invMed)}</td>
                    <td className="text-dark py-2 px-2 d-none d-md-table-cell">{formatCurrency(row.invHigh)}</td>
                  </>
                )}

                <td className="text-black py-2 px-2 bg-light border-start border-light">{formatCurrency(row.netWorthMed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
