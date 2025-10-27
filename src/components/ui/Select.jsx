import React from 'react';
import { cn } from '../../utils/cn';
import './Select.css';

export const Select = ({ 
  label, 
  error, 
  options,
  className, 
  id,
  ...props 
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn('select', error && 'error', className)}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="input-error">{error}</p>
      )}
    </div>
  );
};