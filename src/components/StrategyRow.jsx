import React from 'react';

export default function StrategyRow({ item, onUpdate, onRemove, isInvestment = false }) {
  const hasAccountType = isInvestment || item.accountType !== undefined;

  return (
    <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-sm-nowrap">
      <div className="input-group input-group-sm flex-fill" style={{ minWidth: '90px' }}>
        <span className="input-group-text bg-white text-dark fw-bold border-dark px-1">$</span>
        <input 
          className="form-control bg-white text-dark border-dark scandi-input px-1" 
          type="number" 
          value={item.amount} 
          onChange={(e) => onUpdate(item.id, 'amount', e.target.value)} 
          placeholder="Amt" 
        />
      </div>

      {hasAccountType && (
        <select 
          className="form-select form-select-sm bg-white text-dark border-dark scandi-input flex-fill" 
          style={{ minWidth: '105px', fontSize: '0.75rem' }}
          value={item.accountType || 'TAXABLE'} 
          onChange={(e) => onUpdate(item.id, 'accountType', e.target.value)}
          title="Account Bucket"
        >
          <option value="TAXABLE">🏦 Taxable</option>
          <option value="TAX_DEFERRED">💼 Pre-Tax</option>
          <option value="TAX_FREE">🛡️ Roth</option>
        </select>
      )}

      <select 
        className="form-select form-select-sm bg-white text-dark border-dark scandi-input flex-fill" 
        style={{ minWidth: '95px' }}
        value={item.frequency} 
        onChange={(e) => onUpdate(item.id, 'frequency', e.target.value)}
      >
        <option value={1}>Monthly</option>
        <option value={3}>Quarterly</option>
        <option value={6}>Semi-Annual</option>
        <option value={12}>Yearly</option>
      </select>
      <div className="input-group input-group-sm flex-fill" style={{ minWidth: '115px' }}>
        <input 
          className="form-control bg-white text-dark border-dark scandi-input px-1" 
          type="date" 
          value={item.startDate} 
          onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)} 
        />
      </div>
      <button className="btn btn-sm btn-outline-dark fw-bold px-2" onClick={() => onRemove(item.id)}>X</button>
    </div>
  );
}

