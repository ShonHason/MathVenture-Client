// src/components/ToggleSwitch.tsx
import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <div className="track">
      <span className="half left">Draw</span>
      <span className="half right">Keyboard</span>
    </div>
  </label>
);

export default ToggleSwitch;
