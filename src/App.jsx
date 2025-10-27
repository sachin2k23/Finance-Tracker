import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { BillUpload } from './components/bills/BillUpload';
import { TransactionManager } from './components/transactions/TransactionManager';
import { Analytics } from './components/analytics/Analytics';
import { GoalManager } from './components/goals/GoalManager';
import { Settings } from './components/settings/Settings';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'bills':
        return <BillUpload onNavigate={setCurrentPage} />;
      case 'transactions':
        return <TransactionManager onNavigate={setCurrentPage} />;
      case 'analytics':
        return <Analytics onNavigate={setCurrentPage} />;
      case 'goals':
        return <GoalManager onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="app-main">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;