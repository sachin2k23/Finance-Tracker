import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import { calculateDailySummary, getWeeklyCashFlow, formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { WeeklyCashFlowChart } from './WeeklyCashFlowChart';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Target,
  Upload,
  Plus
} from 'lucide-react';

export const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [dailySummary, setDailySummary] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
    totalInvestment: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (user) {
      const transactions = StorageService.getTransactions(user.id);
      const today = new Date().toISOString().split('T')[0];
      const summary = calculateDailySummary(transactions, today, user.id);
      
      setDailySummary({
        totalSales: summary.totalSales,
        totalExpenses: summary.totalExpenses,
        profit: summary.profit,
        totalInvestment: summary.totalInvestment
      });

      const weekly = getWeeklyCashFlow(transactions, user.id);
      setWeeklyData(weekly);
    }
  }, [user]);

  const summaryCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(dailySummary.totalSales),
      icon: DollarSign,
      iconClass: 'green'
    },
    {
      title: "Today's Expenses",
      value: formatCurrency(dailySummary.totalExpenses),
      icon: TrendingDown,
      iconClass: 'red'
    },
    {
      title: "Today's Profit",
      value: formatCurrency(dailySummary.profit),
      icon: dailySummary.profit >= 0 ? TrendingUp : TrendingDown,
      iconClass: dailySummary.profit >= 0 ? 'green' : 'red'
    },
    {
      title: "Today's Investment",
      value: formatCurrency(dailySummary.totalInvestment),
      icon: Target,
      iconClass: 'blue'
    }
  ];

  const quickActions = [
    {
      title: 'Upload Bill',
      description: 'Upload and extract bill data',
      icon: Upload,
      action: () => onNavigate('bills'),
      className: 'blue'
    },
    {
      title: 'Add Expense',
      description: 'Quick expense entry',
      icon: Receipt,
      action: () => onNavigate('transactions'),
      className: 'red'
    },
    {
      title: 'Set Goal',
      description: 'Define financial goals',
      icon: Target,
      action: () => onNavigate('goals'),
      className: 'green'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="dashboard-welcome">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.name}! Here's your business overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <div className="summary-card">
                <div className="summary-card-content">
                  <div className="summary-card-info">
                    <h3>{card.title}</h3>
                    <p>{card.value}</p>
                  </div>
                  <div className={`summary-card-icon ${card.iconClass}`}>
                    <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="quick-actions">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    className={`quick-action-btn ${action.className}`}
                  >
                    <action.icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    <div className="quick-action-content">
                      <div className="quick-action-title">{action.title}</div>
                      <div className="quick-action-desc">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Cash Flow Chart */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cash Flow Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyCashFlowChart data={weeklyData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};