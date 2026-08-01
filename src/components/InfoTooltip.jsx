import React from 'react';

/**
 * Minimalist Scandinavian Info Tooltip component.
 * Renders a stylized circular info icon with a crisp, bordered tooltip box on hover.
 */
export default function InfoTooltip({ text, id }) {
  if (!text) return null;

  return (
    <span 
      className="info-tooltip-wrapper position-relative d-inline-flex align-items-center ms-2"
      id={id}
    >
      <span 
        className="info-tooltip-icon d-flex align-items-center justify-content-center border border-dark rounded-circle bg-white text-dark fw-bold"
        style={{
          width: '18px',
          height: '18px',
          fontSize: '0.75rem',
          lineHeight: 1,
          cursor: 'help',
          userSelect: 'none',
          transition: 'all 0.15s ease'
        }}
        aria-label={text}
      >
        i
      </span>

      <span 
        className="info-tooltip-box position-absolute bg-white border border-dark text-dark p-2 rounded-0"
        style={{
          bottom: '135%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          fontSize: '0.75rem',
          fontWeight: 500,
          lineHeight: 1.45,
          textTransform: 'none',
          letterSpacing: 'normal',
          boxShadow: '3px 3px 0px #000',
          zIndex: 1050,
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        {text}
        <span 
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-6px',
            borderWidth: '6px 6px 0',
            borderStyle: 'solid',
            borderColor: '#000 transparent transparent transparent'
          }}
        />
      </span>

      <style>{`
        .info-tooltip-wrapper:hover .info-tooltip-box,
        .info-tooltip-wrapper:focus-within .info-tooltip-box {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .info-tooltip-wrapper:hover .info-tooltip-icon {
          background-color: #000 !important;
          color: #fff !important;
        }
      `}</style>
    </span>
  );
}
