import React from 'react';

export default function RateAdjustmentRow({ item, onUpdate, onRemove }) {
  return (
    <div className="d-flex gap-2 mb-2 align-items-center flex-wrap flex-sm-nowrap">
      <div className="input-group input-group-sm flex-fill" style={{ minWidth: '100px' }}>
        <input 
          className="form-control bg-white text-dark border-dark scandi-input px-1" 
          type="number" 
          step="0.1" 
          value={item.rate} 
          onChange={(e) => onUpdate(item.id, 'rate', e.target.value)} 
        />
        <span className="input-group-text bg-white text-dark fw-bold border-dark">%</span>
      </div>
      <div className="input-group input-group-sm flex-fill" style={{ minWidth: '130px' }}>
        <input 
          className="form-control bg-white text-dark border-dark scandi-input px-1" 
          type="date" 
          value={item.startDate} 
          onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)} 
        />
      </div>
      <button className="btn btn-sm btn-outline-dark fw-bold" onClick={() => onRemove(item.id)}>X</button>
    </div>
  );
}
