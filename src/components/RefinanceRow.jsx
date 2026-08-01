import React from 'react';

export default function RefinanceRow({ item, onUpdate, onRemove }) {
  return (
    <div className="card p-2 mb-2 border-dark bg-light">
      <div className="d-flex gap-2 align-items-center flex-wrap flex-sm-nowrap">
        <div className="flex-fill" style={{ minWidth: '115px' }}>
          <label className="form-label scandi-label text-muted mb-0" style={{ fontSize: '0.7rem' }}>Refinance Date</label>
          <input 
            className="form-control form-control-sm bg-white text-dark border-dark scandi-input px-1" 
            type="date" 
            value={item.startDate} 
            onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)} 
          />
        </div>

        <div className="flex-fill" style={{ minWidth: '85px' }}>
          <label className="form-label scandi-label text-muted mb-0" style={{ fontSize: '0.7rem' }}>New Rate (%)</label>
          <div className="input-group input-group-sm">
            <input 
              className="form-control bg-white text-dark border-dark scandi-input px-1 text-center" 
              type="number" 
              step="0.1" 
              value={item.newRate} 
              onChange={(e) => onUpdate(item.id, 'newRate', e.target.value)} 
            />
            <span className="input-group-text bg-white text-dark fw-bold border-dark px-1">%</span>
          </div>
        </div>

        <div className="flex-fill" style={{ minWidth: '85px' }}>
          <label className="form-label scandi-label text-muted mb-0" style={{ fontSize: '0.7rem' }}>New Term (Yrs)</label>
          <div className="input-group input-group-sm">
            <input 
              className="form-control bg-white text-dark border-dark scandi-input px-1 text-center" 
              type="number" 
              value={item.newTermYears} 
              onChange={(e) => onUpdate(item.id, 'newTermYears', e.target.value)} 
            />
            <span className="input-group-text bg-white text-dark fw-bold border-dark px-1">Yr</span>
          </div>
        </div>

        <div className="flex-fill" style={{ minWidth: '100px' }}>
          <label className="form-label scandi-label text-muted mb-0" style={{ fontSize: '0.7rem' }}>Closing Costs ($)</label>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white text-dark fw-bold border-dark px-1">$</span>
            <input 
              className="form-control bg-white text-dark border-dark scandi-input px-1" 
              type="number" 
              step="100" 
              value={item.closingCosts} 
              onChange={(e) => onUpdate(item.id, 'closingCosts', e.target.value)} 
            />
          </div>
        </div>

        <div className="d-flex align-items-end pt-3">
          <button className="btn btn-sm btn-outline-dark fw-bold" onClick={() => onRemove(item.id)} title="Remove Refinance">X</button>
        </div>
      </div>
    </div>
  );
}
