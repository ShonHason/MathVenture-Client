import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
  scanning: boolean;
  onScan: () => void;
  onClear: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ scanning, onScan, onClear }) => (
  <div className="action-buttons">
    <button className="btn clear-btn" onClick={onClear}>
      נקה
    </button>
    <button className="btn scan-btn" onClick={onScan} disabled={scanning}>
      {scanning ? 'מזהה…' : 'סריקה'}
    </button>
  </div>
);

export default ActionButtons;
