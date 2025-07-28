import React from 'react';
import './WikiSelector.css';


export default function RatingSelector({ label, name, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="bar-selector">
        {[1, 2, 3, 4, 5].map((num, idx, arr) => (
          <button
            key={num}
            type="button"
            className={`bar-segment ${value === String(num) ? 'selected' : ''} ${idx === 0 ? 'first' : ''} ${idx === arr.length - 1 ? 'last' : ''}`}
            onClick={() =>
              onChange(value === String(num) ? '' : String(num))
            }
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}