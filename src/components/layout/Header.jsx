import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, User, Settings } from 'lucide-react';
import './Header.css';

export const Header = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bills', label: 'Bills' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'goals', label: 'Goals' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <div className="header-logo-icon">
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>FT</span>
              </div>
              <h1 className="header-logo-text">FinanceTracker</h1>
            </div>
            
            <nav className="header-nav">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`header-nav-item ${currentPage === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="header-right">
            <div className="header-user">
              <User style={{ width: '1rem', height: '1rem', color: 'var(--secondary-color)' }} />
              <span className="header-user-name">{user?.name}</span>
              <span className="header-user-role">
                {user?.role === 'business-owner' ? 'Owner' : 'Accountant'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('settings')}
              style={{ padding: '0.5rem' }}
            >
              <Settings style={{ width: '1rem', height: '1rem' }} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              style={{ padding: '0.5rem', color: 'var(--error-color)' }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="header-mobile-nav">
        <div className="header-mobile-nav-content">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`header-mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};