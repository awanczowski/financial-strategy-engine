import React, { useState } from 'react';
import { generateShareableUrl, exportScenarioToJson, importScenarioFromJson, presetScenarios } from '../lib/shareSerializer.js';

export default function ShareModal({
  show,
  onClose,
  loanConfig,
  extraPayments,
  investments,
  rateAdjustments,
  refinances = [],
  taxConfig,
  socialSecurityConfig,
  viewMode,
  onLoadScenario,
  onShowToast
}) {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState(null);

  if (!show) return null;

  const activeState = {
    loanConfig,
    extraPayments,
    investments,
    rateAdjustments,
    refinances,
    taxConfig,
    socialSecurityConfig,
    viewMode
  };

  const shareUrl = generateShareableUrl(activeState);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      if (onShowToast) onShowToast("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error("Failed to copy link", err);
    });
  };

  const handleExportJson = () => {
    exportScenarioToJson(activeState);
    if (onShowToast) onShowToast("Exported scenario JSON!");
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error("Invalid JSON scenario format.");
        }
        if (onLoadScenario) {
          onLoadScenario(parsed);
          if (onShowToast) onShowToast("Successfully imported scenario!");
          onClose();
        }
      } catch (err) {
        setImportError("Failed to parse scenario JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPreset = (presetKey) => {
    const preset = presetScenarios[presetKey];
    if (preset && onLoadScenario) {
      onLoadScenario(preset.data);
      if (onShowToast) onShowToast(`Loaded "${preset.name}" preset!`);
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1040, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card border-dark border-2 rounded-0 shadow-lg" style={{ width: '95%', maxWidth: '800px', zIndex: 1050, maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="card-header bg-white border-dark d-flex justify-content-between align-items-center p-3 p-md-4">
          <div>
            <h5 className="m-0 scandi-header text-black">Share & Export Scenario</h5>
            <small className="text-muted fw-bold">Generate a shareable link, save JSON files, or load strategy presets.</small>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close Share Modal"></button>
        </div>

        <div className="card-body p-3 p-md-4 bg-white">

          {/* Section 1: Shareable URL Link */}
          <div className="mb-4 pb-3 border-bottom border-light">
            <h6 className="scandi-label text-black mb-2">1. Shareable Link</h6>
            <p className="text-muted small mb-2">Anyone opening this link will view this exact financial strategy configuration:</p>
            <div className="input-group input-group-sm">
              <input 
                type="text" 
                readOnly 
                className="form-control scandi-input border-dark bg-light fw-bold" 
                value={shareUrl} 
                onClick={(e) => e.target.select()}
              />
              <button 
                type="button" 
                className={`btn ${copied ? 'btn-success' : 'btn-dark'} fw-bold scandi-label px-3`}
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Section 2: Quick Presets */}
          <div className="mb-4 pb-3 border-bottom border-light">
            <h6 className="scandi-label text-black mb-2">2. Built-In Strategy Presets</h6>
            <div className="d-flex flex-column gap-2">
              {Object.entries(presetScenarios).map(([key, preset]) => (
                <div 
                  key={key} 
                  className="p-2 px-3 border border-dark bg-light d-flex align-items-center justify-content-between gap-2 rounded-0 shadow-sm"
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => handleApplyPreset(key)}
                  title={`Click to load "${preset.name}" scenario`}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden me-2" style={{ minWidth: 0 }}>
                    <span className="scandi-label text-black text-nowrap flex-shrink-0">{preset.name}:</span>
                    <span className="text-muted small text-truncate d-none d-md-inline">{preset.description}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-dark fw-bold scandi-label text-nowrap px-3 py-1 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(key);
                    }}
                  >
                    Load Preset
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: File Import / Export */}
          <div>
            <h6 className="scandi-label text-black mb-2">3. Backup & File Import</h6>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <button 
                type="button" 
                className="btn btn-sm btn-dark fw-bold scandi-label px-3"
                onClick={handleExportJson}
              >
                Export Scenario (.json)
              </button>

              <label className="btn btn-sm btn-outline-dark fw-bold scandi-label px-3 m-0 cursor-pointer">
                Import Scenario (.json)
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  onChange={handleFileImport} 
                />
              </label>
            </div>
            {importError && (
              <div className="text-danger small mt-2 fw-bold">{importError}</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
