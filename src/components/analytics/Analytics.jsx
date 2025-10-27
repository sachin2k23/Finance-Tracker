import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import './Analytics.css';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Analytics = ({ onNavigate }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    if (user) {
      setTransactions(StorageService.getTransactions(user.id));
    }
  }, [user]);

  useEffect(() => {
    
    if (timeframe === 'monthly') {
      setSelectedPeriod(format(new Date(), 'yyyy-MM'));
    } else {
      const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
      setSelectedPeriod(`${new Date().getFullYear()}-Q${currentQuarter}`);
    }
  }, [timeframe]);

  const getMonthlyData = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const sales = monthTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const investments = monthTransactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
    const profit = sales - expenses;

    return { sales, expenses, investments, profit, transactions: monthTransactions };
  };

  const getQuarterlyData = (quarterStr) => {
    const [year, quarter] = quarterStr.split('-Q').map(Number);
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterEnd = new Date(year, quarter * 3, 0);

    const quarterTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= quarterStart && transactionDate <= quarterEnd;
    });

    const sales = quarterTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const expenses = quarterTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const investments = quarterTransactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
    const profit = sales - expenses;

    return { sales, expenses, investments, profit, transactions: quarterTransactions };
  };

  const getCurrentData = () => {
    if (timeframe === 'monthly') {
      return getMonthlyData(selectedPeriod);
    } else {
      return getQuarterlyData(selectedPeriod);
    }
  };

  const generateTrendData = () => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const data = getMonthlyData(monthStr);
      return {
        month: format(month, 'MMM'),
        sales: data.sales,
        expenses: data.expenses,
        profit: data.profit
      };
    });
  };

  const generateCategoryBreakdown = () => {
    const currentData = getCurrentData();
    const categoryTotals = {};

    currentData.transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const currentData = getCurrentData();
  const trendData = generateTrendData();
  const categoryData = generateCategoryBreakdown();

  const lineChartData = {
    labels: trendData.map(d => d.month),
    datasets: [
      {
        label: 'Sales',
        data: trendData.map(d => d.sales),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: trendData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: trendData.map(d => d.profit),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        data: categoryData.map(d => d.amount),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(37, 99, 235, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
        borderColor: 'white',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
            }).format(context.parsed.y || context.parsed);
            return `${context.dataset.label || context.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
              notation: 'compact',
            }).format(value);
          },
        },
      },
    },
  };

  const timeframeOptions = [
    { value: 'monthly', label: 'Monthly View' },
    { value: 'quarterly', label: 'Quarterly View' }
  ];

  const periodOptions = timeframe === 'monthly' ? 
    Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      return { value, label };
    }) :
    Array.from({ length: 8 }, (_, i) => {
      const year = new Date().getFullYear();
      const quarter = Math.floor(new Date().getMonth() / 3) + 1;
      const targetQuarter = quarter - (i % 4);
      const targetYear = year - Math.floor(i / 4);
      const adjustedQuarter = targetQuarter <= 0 ? targetQuarter + 4 : targetQuarter;
      const adjustedYear = targetQuarter <= 0 ? targetYear - 1 : targetYear;
      
      return {
        value: `${adjustedYear}-Q${adjustedQuarter}`,
        label: `Q${adjustedQuarter} ${adjustedYear}`
      };
    });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <div className="flex space-x-4">
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={timeframeOptions}
          />
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <Button variant="outline">
            <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Export
          </Button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: `${timeframe === 'monthly' ? 'Monthly' : 'Quarterly'} Sales`,
            value: formatCurrency(currentData.sales),
            icon: TrendingUp,
            iconClass: 'green'
          },
          {
            title: `${timeframe === 'monthly' ? 'Monthly' : 'Quarterly'} Expenses`,
            value: formatCurrency(currentData.expenses),
            icon: TrendingDown,
            iconClass: 'red'
          },
          {
            title: `${timeframe === 'monthly' ? 'Monthly' : 'Quarterly'} Profit`,
            value: formatCurrency(currentData.profit),
            icon: currentData.profit >= 0 ? TrendingUp : TrendingDown,
            iconClass: currentData.profit >= 0 ? 'green' : 'red'
          },
          {
            title: `${timeframe === 'monthly' ? 'Monthly' : 'Quarterly'} Investments`,
            value: formatCurrency(currentData.investments),
            icon: DollarSign,
            iconClass: 'blue'
          }
        ].map((card, index) => {
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

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
              6-Month Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {categoryData.length > 0 ? (
                <Pie data={pieChartData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                          }).format(context.parsed);
                          return `${context.label}: ${value}`;
                        },
                      },
                    },
                  }
                }} />
              ) : (
                <div className="empty-state">
                  <PieChart className="empty-state-icon" />
                  <p className="empty-state-text">No expense data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category, index) => {
                  const percentage = currentData.expenses > 0 ? (category.amount / currentData.expenses * 100) : 0;
                  const transactionCount = currentData.transactions.filter(t => 
                    t.type === 'expense' && t.category === category.category
                  ).length;

                  return (
                    <tr key={index}>
                      <td className="text-sm font-medium">
                        {category.category}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                        {transactionCount}
                      </td>
                      <td className="text-sm font-medium">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {categoryData.length === 0 && (
            <div className="empty-state">
              <BarChart3 className="empty-state-icon" />
              <p className="empty-state-text">No data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};