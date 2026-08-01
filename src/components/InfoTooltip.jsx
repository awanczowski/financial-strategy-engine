import React from 'react';

/**
 * Minimalist Scandinavian Info Tooltip component.
 * Renders a subtle circular info icon with built-in accessibility and hover text.
 */
export default function InfoTooltip({ text, id }) {
  if (!text) return null;

  return (
    <span 
      className="d-inline-flex align-items-center justify-content-center ms-1 text-muted cursor-pointer"
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '1px solid #6c757d',
        fontSize: '0.65rem',
        fontWeight: 'bold',
        lineHeight: 1,
        userSelect: 'none',
        verticalAlign: 'middle'
      }}
      title={text}
      aria-label={text}
      id={id}
    >
      i
    </span>
  );
}
