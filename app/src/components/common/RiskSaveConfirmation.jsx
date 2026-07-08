import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const RiskSaveConfirmation = ({ riskCategory, onConfirm, onCancel }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const catName = riskCategory ? riskCategory.toUpperCase() : 'HIGH-RISK TECHNICAL';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="bg-sand-900 border-2 border-red-700 text-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 text-red-500">
          <ShieldAlert size={28} className="animate-pulse" />
          <h3 className="text-lg font-mono font-bold tracking-wider">
            CRITICAL SAFETY WARNING
          </h3>
        </div>

        {/* Warning text */}
        <p className="text-sm text-sand-100 leading-relaxed">
          You are attempting to save or queue data concerning the high-risk operational category: 
          <strong className="text-red-500 block mt-1 font-mono text-base">
            // {catName}
          </strong>
        </p>

        <div className="bg-red-950/20 border-l-4 border-red-600 p-3 text-xs text-sand-300 leading-relaxed">
          <strong>ADVISORY:</strong> This content involves complex technical, medical, or logistical systems. Information extracted from local offline library manuals is auxiliary. You must cross-reference safety measures and technical metrics with physical manuals.
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none py-1">
          <input 
            type="checkbox" 
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 accent-red-600 w-4 h-4 cursor-pointer" 
          />
          <span className="text-xs text-sand-200 leading-relaxed">
            I understand this saved item may involve high-risk material and should be verified before use.
          </span>
        </label>

        {/* Controls */}
        <div className="flex justify-end gap-3 mt-2">
          <button 
            className="px-4 py-2 border border-sand-600 rounded-lg text-sand-300 hover:bg-sand-800 transition-colors text-xs font-semibold"
            onClick={onCancel}
          >
            ABORT OPERATION
          </button>
          
          <button 
            disabled={!acknowledged}
            onClick={onConfirm}
            className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-all ${
              acknowledged 
                ? 'border-red-600 text-red-500 hover:bg-red-950/40 cursor-pointer' 
                : 'border-sand-700 text-sand-500 cursor-not-allowed opacity-50'
            }`}
          >
            CONFIRM SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskSaveConfirmation;
