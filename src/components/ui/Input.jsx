import React from 'react';
import { cn } from '../../utils/cn';
import './Input.css';

export const Input = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('input', error && 'error', className)}
        {...props}
      />
      {error && (
        <p className="input-error">{error}</p>
      )}
    </div>
  );
};