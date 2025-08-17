import { type User, type InsertUser, type Category, type InsertCategory, type Transaction, type InsertTransaction, type Budget, type InsertBudget, type Goal, type InsertGoal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Transactions
  getTransactions(userId: string, filters?: { type?: string; categoryId?: string; month?: number; year?: number }): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  // Budgets
  getBudgets(userId: string, month: number, year: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<Budget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private goals: Map<string, Goal> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo"
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create default categories
    const defaultCategories: Category[] = [
      { id: "cat-1", name: "Alimentação", icon: "coffee", color: "#FF9800", userId: "default-user" },
      { id: "cat-2", name: "Transporte", icon: "car", color: "#2196F3", userId: "default-user" },
      { id: "cat-3", name: "Lazer", icon: "gamepad-2", color: "#9C27B0", userId: "default-user" },
      { id: "cat-4", name: "Contas", icon: "file-text", color: "#F44336", userId: "default-user" },
      { id: "cat-5", name: "Salário", icon: "arrow-down-left", color: "#4CAF50", userId: "default-user" },
      { id: "cat-outros", name: "Outros", icon: "more-horizontal", color: "#757575", userId: "default-user" },
    ];
    
    defaultCategories.forEach(cat => this.categories.set(cat.id, cat));
    
    // No sample transactions - start with clean app
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.userId === userId);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id, userId: insertCategory.userId || null };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Transactions
  async getTransactions(userId: string, filters?: { type?: string; categoryId?: string; month?: number; year?: number }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(t => t.userId === userId);
    
    if (filters) {
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
      if (filters.categoryId) {
        transactions = transactions.filter(t => t.categoryId === filters.categoryId);
      }
      if (filters.month && filters.year) {
        transactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
        });
      }
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      description: insertTransaction.description || null,
      date: insertTransaction.date ? new Date(insertTransaction.date) : new Date(),
      userId: insertTransaction.userId || null,
      categoryId: insertTransaction.categoryId || null,
      tags: insertTransaction.tags || null,
    };
    this.transactions.set(id, transaction);
    
    // Update budget spent amount if it's an expense
    if (transaction.type === "expense" && transaction.categoryId) {
      const currentDate = new Date(transaction.date);
      const budget = Array.from(this.budgets.values()).find(b => 
        b.categoryId === transaction.categoryId && 
        b.month === currentDate.getMonth() + 1 && 
        b.year === currentDate.getFullYear() &&
        b.userId === transaction.userId
      );
      
      if (budget) {
        budget.spent = (parseFloat(budget.spent) + parseFloat(transaction.amount)).toString();
        this.budgets.set(budget.id, budget);
      }
    }
    
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Budgets
  async getBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => 
      b.userId === userId && b.month === month && b.year === year
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      ...insertBudget,
      id,
      amount: insertBudget.amount.toString(),
      spent: "0",
      userId: insertBudget.userId || null,
      categoryId: insertBudget.categoryId || null,
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updated = { ...budget, ...updates };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(g => g.userId === userId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      targetAmount: insertGoal.targetAmount.toString(),
      currentAmount: "0",
      targetDate: new Date(insertGoal.targetDate),
      userId: insertGoal.userId || null,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...updates };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export const storage = new MemStorage();
