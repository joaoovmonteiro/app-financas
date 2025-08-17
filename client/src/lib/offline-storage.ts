// Offline storage for mobile app
import { Category, Transaction, Budget, Goal } from "@shared/schema";

const STORAGE_KEYS = {
  categories: 'finance-app-categories',
  transactions: 'finance-app-transactions',
  budgets: 'finance-app-budgets',
  goals: 'finance-app-goals',
  initialized: 'finance-app-initialized'
};

// Default data
const defaultCategories: Category[] = [
  { id: "cat-1", name: "Alimentação", icon: "coffee", color: "#FF9800", userId: "default-user" },
  { id: "cat-2", name: "Transporte", icon: "car", color: "#2196F3", userId: "default-user" },
  { id: "cat-3", name: "Lazer", icon: "gamepad-2", color: "#9C27B0", userId: "default-user" },
  { id: "cat-4", name: "Contas", icon: "file-text", color: "#F44336", userId: "default-user" },
  { id: "cat-5", name: "Salário", icon: "arrow-down-left", color: "#4CAF50", userId: "default-user" },
  { id: "cat-outros", name: "Outros", icon: "more-horizontal", color: "#757575", userId: "default-user" }
];

// Start with clean app - no sample transactions
const defaultTransactions: Transaction[] = [];

export class OfflineStorage {
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    
    // Initialize with default data if first time
    const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(defaultCategories));
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(defaultTransactions));
      localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
      console.log("🚀 OfflineStorage initialized with clean data");
    } else {
      console.log("📱 OfflineStorage already initialized");
    }
    
    this.initialized = true;
  }

  async getCategories(): Promise<Category[]> {
    await this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.categories);
    return stored ? JSON.parse(stored) : defaultCategories;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    await this.init();
    const categories = await this.getCategories();
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: "default-user"
    };
    
    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    console.log("✅ Category created in offline storage:", newCategory);
    return newCategory;
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.transactions);
    if (!stored) return defaultTransactions;
    
    const transactions = JSON.parse(stored);
    // Convert date strings back to Date objects
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }));
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await this.init();
    const transactions = await this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: "default-user",
      date: transaction.date || new Date()
    };
    
    transactions.unshift(newTransaction); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    console.log("✅ Transaction created in offline storage:", newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    await this.init();
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    transactions[index] = { 
      ...transactions[index], 
      ...updates,
      date: updates.date ? new Date(updates.date) : transactions[index].date
    };
    
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    return transactions[index];
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.init();
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    transactions.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    return true;
  }

  async getBudgets(month?: number, year?: number): Promise<Budget[]> {
    await this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.budgets);
    if (!stored) {
      console.log("📱 No budgets found in offline storage");
      return [];
    }
    
    let budgets = JSON.parse(stored);
    console.log("💾 All budgets from offline storage:", budgets.length);
    
    // If no filters, return current month's budgets
    if (month === undefined || year === undefined) {
      const currentDate = new Date();
      month = currentDate.getMonth() + 1;
      year = currentDate.getFullYear();
    }
    
    // Filter by month and year - using strict equality with type conversion
    budgets = budgets.filter((b: Budget) => {
      const budgetMonth = Number(b.month);
      const budgetYear = Number(b.year);
      const filterMonth = Number(month);
      const filterYear = Number(year);
      
      return budgetMonth === filterMonth && budgetYear === filterYear;
    });
    
    console.log(`📊 Found ${budgets.length} budgets for ${month}/${year}`);
    return budgets;
  }

  async createBudget(budget: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
    await this.init();
    // Get all budgets (not filtered)
    const stored = localStorage.getItem(STORAGE_KEYS.budgets);
    const allBudgets = stored ? JSON.parse(stored) : [];
    
    const newBudget: Budget = {
      ...budget,
      id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      spent: "0",
      userId: "default-user",
      // Force numeric types for filtering
      month: Number(budget.month),
      year: Number(budget.year)
    };
    
    allBudgets.push(newBudget);
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(allBudgets));
    console.log("✅ Budget created in offline storage:", newBudget);
    console.log("💾 Total budgets in storage:", allBudgets.length);
    return newBudget;
  }

  async getGoals(): Promise<Goal[]> {
    await this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.goals);
    if (!stored) return [];
    
    const goals = JSON.parse(stored);
    // Convert date strings back to Date objects
    return goals.map((g: any) => ({
      ...g,
      targetDate: new Date(g.targetDate)
    }));
  }

  async createGoal(goal: Omit<Goal, 'id' | 'currentAmount'>): Promise<Goal> {
    await this.init();
    // Get all goals directly from storage
    const stored = localStorage.getItem(STORAGE_KEYS.goals);
    const allGoals = stored ? JSON.parse(stored) : [];
    
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currentAmount: "0",
      targetDate: goal.targetDate || new Date()
    };
    
    allGoals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(allGoals));
    console.log("Goal created:", newGoal);
    console.log("All goals after creation:", allGoals);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    await this.init();
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    goals[index] = { 
      ...goals[index], 
      ...updates,
      targetDate: updates.targetDate ? new Date(updates.targetDate) : goals[index].targetDate
    };
    
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
    return goals[index];
  }

  async deleteGoal(id: string): Promise<boolean> {
    await this.init();
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    
    if (index === -1) return false;
    
    goals.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
    return true;
  }

  async deleteBudget(id: string): Promise<boolean> {
    await this.init();
    const stored = localStorage.getItem(STORAGE_KEYS.budgets);
    if (!stored) return false;
    
    const budgets = JSON.parse(stored);
    const index = budgets.findIndex((b: Budget) => b.id === id);
    
    if (index === -1) return false;
    
    budgets.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
    console.log("✅ Budget deleted from offline storage:", id);
    return true;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.init();
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return false;
    
    categories.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    console.log("✅ Category deleted from offline storage:", id);
    return true;
  }

  async getDashboard() {
    await this.init();
    const transactions = await this.getTransactions();
    
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
      }
    });
    
    const balance = income - expenses;
    const recentTransactions = transactions.slice(0, 5);
    
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const budgets = await this.getBudgets(month, year);
    
    return {
      balance,
      income,
      expenses,
      recentTransactions,
      budgets
    };
  }
}

export const offlineStorage = new OfflineStorage();