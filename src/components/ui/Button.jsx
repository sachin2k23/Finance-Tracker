import React from 'react';
import { cn } from '../../utils/cn';
import './Button.css';

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn('btn', `btn-${variant}`, `btn-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
};