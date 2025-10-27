import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

export const calculateDailySummary = (transactions, date, userId) => {
  const dayTransactions = transactions.filter(t => 
    t.userId === userId && format(new Date(t.date), 'yyyy-MM-dd') === date
  );

  const totalInvestment = dayTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSales = dayTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalSales - totalExpenses;

  return {
    date,
    totalInvestment,
    totalExpenses,
    totalSales,
    profit,
    userId
  };
};

export const getWeeklyCashFlow = (transactions, userId) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const data = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayTransactions = transactions.filter(t => 
      t.userId === userId && format(new Date(t.date), 'yyyy-MM-dd') === dateStr
    );

    const sales = dayTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    data.push({
      date: format(date, 'EEE'),
      sales,
      expenses,
      profit: sales - expenses
    });
  }

  return data;
};

export const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};