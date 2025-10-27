import React, { useState, useEffect } from 'react';
import './GoalManager.css';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const GoalManager = ({ onNavigate }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'sales',
    title: '',
    targetAmount: '',
    deadline: ''
  });

  useEffect(() => {
    if (user) {
      const userGoals = StorageService.getGoals(user.id);
      const userTransactions = StorageService.getTransactions(user.id);
      setGoals(userGoals);
      setTransactions(userTransactions);
    }
  }, [user]);

  const calculateGoalProgress = (goal) => {
    const goalStart = new Date(goal.deadline);
    goalStart.setMonth(goalStart.getMonth() - 1); // Assume 1-month goals for demo
    
    const relevantTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= goalStart && transactionDate <= new Date(goal.deadline);
    });

    let currentAmount = 0;
    
    switch (goal.type) {
      case 'sales':
        currentAmount = relevantTransactions
          .filter(t => t.type === 'sale')
          .reduce((sum, t) => sum + t.amount, 0);
        break;
      case 'profit':
        const sales = relevantTransactions
          .filter(t => t.type === 'sale')
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = relevantTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        currentAmount = sales - expenses;
        break;
      case 'expense-reduction':
        // For expense reduction, we calculate how much we've "saved" compared to target
        const totalExpenses = relevantTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        currentAmount = Math.max(0, goal.targetAmount - totalExpenses);
        break;
    }

    const percentage = Math.min(100, (currentAmount / goal.targetAmount) * 100);
    
    let status = 'on-track';
    if (percentage >= 100) status = 'achieved';
    else if (percentage < 50) status = 'at-risk';

    return { currentAmount, percentage, status };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && formData.title && formData.targetAmount && formData.deadline) {
      const newGoal = {
        id: Date.now().toString(),
        type: formData.type,
        title: formData.title,
        targetAmount: Number(formData.targetAmount),
        currentAmount: 0,
        deadline: formData.deadline,
        status: 'on-track',
        userId: user.id
      };

      StorageService.addGoal(newGoal);
      setGoals(prev => [...prev, newGoal]);
      
      setFormData({
        type: 'sales',
        title: '',
        targetAmount: '',
        deadline: ''
      });
      setShowForm(false);
    }
  };

  const goalTypeOptions = [
    { value: 'sales', label: 'Sales Target' },
    { value: 'profit', label: 'Profit Target' },
    { value: 'expense-reduction', label: 'Expense Reduction' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success-color)' }} />;
      case 'at-risk':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--error-color)' }} />;
      default:
        return <Clock style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} />;
    }
  };

  const activeGoals = goals.filter(goal => new Date(goal.deadline) >= new Date());
  const completedGoals = goals.filter(goal => new Date(goal.deadline) < new Date());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals & Targets</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Set New Goal
        </Button>
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Active Goals',
            value: activeGoals.length.toString(),
            icon: Target,
            iconClass: 'blue'
          },
          {
            title: 'Achieved Goals',
            value: goals.filter(g => calculateGoalProgress(g).status === 'achieved').length.toString(),
            icon: CheckCircle,
            iconClass: 'green'
          },
          {
            title: 'At Risk',
            value: goals.filter(g => calculateGoalProgress(g).status === 'at-risk').length.toString(),
            icon: AlertTriangle,
            iconClass: 'red'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="summary-card">
                <div className="summary-card-content">
                  <div className="summary-card-info">
                    <h3>{stat.title}</h3>
                    <p>{stat.value}</p>
                  </div>
                  <div className={`summary-card-icon ${stat.iconClass}`}>
                    <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <CardHeader>
              <CardTitle>Set New Financial Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Goal Type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  options={goalTypeOptions}
                  required
                />
                
                <Input
                  label="Goal Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Achieve ₹1,00,000 monthly sales"
                  required
                />

                <Input
                  label="Target Amount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />

                <div className="flex space-x-4" style={{ paddingTop: '1rem' }}>
                  <Button type="submit" style={{ flex: 1 }}>
                    <Target style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Set Goal
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Goals */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGoals.map(goal => {
              const progress = calculateGoalProgress(goal);
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={goal.id}>
                  <CardHeader style={{ paddingBottom: '1rem' }}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(progress.status)}
                        <span className={`status-badge ${progress.status === 'achieved' ? 'green' : progress.status === 'at-risk' ? 'red' : 'blue'}`}>
                          {progress.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--secondary-color)' }}>
                          <span>Progress</span>
                          <span>{progress.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${progress.status === 'achieved' ? 'green' : progress.status === 'at-risk' ? 'red' : 'blue'}`}
                            style={{ width: `${Math.min(100, progress.percentage)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>Current</p>
                          <p className="text-lg font-semibold">{formatCurrency(progress.currentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>Target</p>
                          <p className="text-lg font-semibold">{formatCurrency(goal.targetAmount)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm border-t pt-2" style={{ color: 'var(--secondary-color)' }}>
                        <div className="flex items-center">
                          <Calendar style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                        <span style={{ color: daysLeft <= 7 ? 'var(--error-color)' : 'var(--secondary-color)', fontWeight: daysLeft <= 7 ? '500' : 'normal' }}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="empty-state">
              <Target className="empty-state-icon" />
              <p className="empty-state-text mb-4">No active goals set</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Set Your First Goal
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Completed Goals</h2>
          <div className="space-y-4">
            {completedGoals.slice(0, 5).map(goal => {
              const progress = calculateGoalProgress(goal);
              
              return (
                <Card key={goal.id}>
                  <CardContent style={{ padding: '1rem' }}>
                    <div className="flex items-center justify-between">
                      <div style={{ flex: 1 }}>
                        <h3 className="font-medium">{goal.title}</h3>
                        <div className="flex items-center space-x-4 text-sm mt-1" style={{ color: 'var(--secondary-color)' }}>
                          <span>Target: {formatCurrency(goal.targetAmount)}</span>
                          <span>Achieved: {formatCurrency(progress.currentAmount)}</span>
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(progress.status)}
                        <span className={`status-badge ${progress.percentage >= 100 ? 'green' : 'blue'}`}>
                          {progress.percentage >= 100 ? 'ACHIEVED' : 'COMPLETED'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};