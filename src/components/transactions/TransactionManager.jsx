import React, { useState, useEffect } from 'react';
import './TransactionManager.css';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import { formatCurrency } from '../../utils/calculations';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Search,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';

export const TransactionManager = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expense');
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      setTransactions(StorageService.getTransactions(user.id));
    }
  }, [user]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  const categories = {
    investment: ['Equipment', 'Technology', 'Marketing', 'Training', 'Research'],
    expense: ['Office Supplies', 'Utilities', 'Travel', 'Meals', 'Software', 'Services'],
    sale: ['Product Sales', 'Service Revenue', 'Consulting', 'Licensing', 'Other Revenue']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && formData.amount && formData.description) {
      const newTransaction = {
        id: Date.now().toString(),
        type: formData.type,
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category || categories[formData.type][0],
        date: formData.date,
        userId: user.id
      };

      StorageService.addTransaction(newTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
      setFormData({
        type: activeTab,
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = transaction.type === activeTab;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const todayTransactions = transactions.filter(t => 
    t.type === activeTab && 
    new Date(t.date).toDateString() === new Date().toDateString()
  );

  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

  const tabs = [
    { 
      id: 'investment', 
      label: 'Investments', 
      icon: Target,
      color: 'blue'
    },
    { 
      id: 'expense', 
      label: 'Expenses', 
      icon: TrendingDown,
      color: 'red'
    },
    { 
      id: 'sale', 
      label: 'Sales', 
      icon: TrendingUp,
      color: 'green'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Finance Tracking</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Add {activeTab === 'investment' ? 'Investment' : activeTab === 'expense' ? 'Expense' : 'Sale'}
        </Button>
      </div>

      {/* Today's Summary */}
      <Card>
        <div className="summary-card">
          <div className="summary-card-content">
            <div className="summary-card-info">
              <h3>Today's {currentTab.label}</h3>
              <p>{formatCurrency(todayTotal)}</p>
            </div>
            <div className={`summary-card-icon ${currentTab.color}`}>
              <currentTab.icon style={{ width: '2rem', height: '2rem' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="tabs-container">
        <nav className="tabs-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative" style={{ flex: 1 }}>
          <Search style={{ 
            width: '1.25rem', 
            height: '1.25rem', 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--secondary-color)' 
          }} />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories[activeTab].map(cat => ({ value: cat, label: cat }))
          ]}
          className="sm:w-48"
        />
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <Card className="modal-content">
            <CardHeader>
              <CardTitle>Add New {activeTab === 'investment' ? 'Investment' : activeTab === 'expense' ? 'Expense' : 'Sale'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
                
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  required
                />

                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  options={categories[activeTab].map(cat => ({ value: cat, label: cat }))}
                  required
                />

                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />

                <div className="flex space-x-4" style={{ paddingTop: '1rem' }}>
                  <Button type="submit" style={{ flex: 1 }}>
                    <DollarSign style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Add Transaction
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

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <currentTab.icon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: `var(--${currentTab.color === 'blue' ? 'primary' : currentTab.color === 'green' ? 'success' : 'error'}-color)` }} />
            {currentTab.label} History
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {filteredTransactions.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }} className="hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          {transaction.description}
                        </h3>
                        <p className="text-lg font-semibold" style={{ color: `var(--${currentTab.color === 'blue' ? 'primary' : currentTab.color === 'green' ? 'success' : 'error'}-color)` }}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm" style={{ color: 'var(--secondary-color)' }}>
                        <span className="flex items-center">
                          <Filter style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          {transaction.category}
                        </span>
                        <span className="flex items-center">
                          <Calendar style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <currentTab.icon className="empty-state-icon" />
              <p className="empty-state-text">No {activeTab}s recorded yet</p>
              <Button 
                onClick={() => setShowForm(true)}
                variant="outline" 
                style={{ marginTop: '1rem' }}
              >
                <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Add First {activeTab === 'investment' ? 'Investment' : activeTab === 'expense' ? 'Expense' : 'Sale'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};