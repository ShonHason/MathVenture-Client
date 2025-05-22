import React from 'react';
import './RowScan.css';

interface RowScanProps {
  scanning: boolean;
  onScan: () => void;
}

const RowScan: React.FC<RowScanProps> = ({ scanning, onScan }) => (
  <div className="rowscan">
    <button
      className="scan-btn"
      onClick={onScan}
      disabled={scanning}
    >
      {scanning ? 'מזהה…' : 'סריקה'}
    </button>
  </div>
);

export default RowScan;
