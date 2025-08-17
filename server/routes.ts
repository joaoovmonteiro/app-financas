import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertGoalSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const defaultUserId = "default-user";

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories(defaultUserId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validData = insertCategorySchema.parse({ ...req.body, userId: defaultUserId });
      const category = await storage.createCategory(validData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (success) {
        res.json({ message: "Category deleted successfully" });
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const { type, categoryId, month, year } = req.query;
      const filters: any = {};
      
      if (type) filters.type = type as string;
      if (categoryId) filters.categoryId = categoryId as string;
      if (month) filters.month = parseInt(month as string);
      if (year) filters.year = parseInt(year as string);
      
      const transactions = await storage.getTransactions(defaultUserId, filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validData = insertTransactionSchema.parse({ ...req.body, userId: defaultUserId });
      const transaction = await storage.createTransaction(validData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const validData = insertTransactionSchema.parse(req.body);
      const updateData = {
        ...validData,
        amount: validData.amount.toString(),
        description: validData.description || null,
        date: validData.date ? new Date(validData.date) : undefined,
      };
      const transaction = await storage.updateTransaction(req.params.id, updateData);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const success = await storage.deleteTransaction(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budgets
  app.get("/api/budgets", async (req, res) => {
    try {
      const currentDate = new Date();
      const month = parseInt(req.query.month as string) || currentDate.getMonth() + 1;
      const year = parseInt(req.query.year as string) || currentDate.getFullYear();
      
      const budgets = await storage.getBudgets(defaultUserId, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const validData = insertBudgetSchema.parse({ ...req.body, userId: defaultUserId });
      const budget = await storage.createBudget(validData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const success = await storage.deleteBudget(req.params.id);
      if (success) {
        res.json({ message: "Budget deleted successfully" });
      } else {
        res.status(404).json({ message: "Budget not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(defaultUserId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validData = insertGoalSchema.parse({ ...req.body, userId: defaultUserId });
      const goal = await storage.createGoal(validData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      if (goal) {
        res.json(goal);
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard", async (req, res) => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const transactions = await storage.getTransactions(defaultUserId, { month, year });
      const allTransactions = await storage.getTransactions(defaultUserId);
      const budgets = await storage.getBudgets(defaultUserId, month, year);
      
      const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const balance = income - expenses;
      
      const recentTransactions = allTransactions.slice(0, 5);
      
      res.json({
        balance,
        income,
        expenses,
        recentTransactions,
        budgets
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
