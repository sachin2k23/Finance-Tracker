import React from 'react';
import { cn } from '../../utils/cn';
import './Card.css';

export const Card = ({ className, children }) => {
  return (
    <div className={cn('card', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => {
  return (
    <div className={cn('card-header', className)}>
      {children}
    </div>
  );
};

export const CardContent = ({ className, children }) => {
  return (
    <div className={cn('card-content', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children }) => {
  return (
    <h3 className={cn('card-title', className)}>
      {children}
    </h3>
  );
};