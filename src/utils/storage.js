const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-tracker-transactions',
  BILLS: 'finance-tracker-bills',
  GOALS: 'finance-tracker-goals',
  DAILY_SUMMARIES: 'finance-tracker-daily-summaries'
};

export const StorageService = {
  // Transactions
  getTransactions: (userId) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    return transactions.filter((t) => t.userId === userId);
  },

  addTransaction: (transaction) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  updateTransaction: (id, updates) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  },

  deleteTransaction: (id) => {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const filtered = transactions.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  },

  // Bills
  getBills: (userId) => {
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLS) || '[]');
    return bills.filter((b) => b.userId === userId);
  },

  addBill: (bill) => {
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLS) || '[]');
    bills.push(bill);
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  updateBill: (id, updates) => {
    const bills = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLS) || '[]');
    const index = bills.findIndex((b) => b.id === id);
    if (index !== -1) {
      bills[index] = { ...bills[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    }
  },

  // Goals
  getGoals: (userId) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    return goals.filter((g) => g.userId === userId);
  },

  addGoal: (goal) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    goals.push(goal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  updateGoal: (id, updates) => {
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const index = goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  },

  // Daily Summaries
  getDailySummaries: (userId) => {
    const summaries = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES) || '[]');
    return summaries.filter((s) => s.userId === userId);
  },

  updateDailySummary: (summary) => {
    const summaries = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARIES) || '[]');
    const index = summaries.findIndex((s) => 
      s.date === summary.date && s.userId === summary.userId
    );
    
    if (index !== -1) {
      summaries[index] = summary;
    } else {
      summaries.push(summary);
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(summaries));
  }
};