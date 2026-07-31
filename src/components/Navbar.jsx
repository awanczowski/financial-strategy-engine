import React from 'react';

export default function Navbar() {
  return (
    <header className="w-100 border-bottom border-dark bg-white px-4 py-3" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
      <div className="d-flex justify-content-between align-items-center max-w-100 mx-auto">
        <h1 className="h4 mb-0 scandi-header text-black">Strategy Engine</h1>
      </div>
    </header>
  );
}
