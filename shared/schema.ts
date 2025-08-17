import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  userId: varchar("user_id").references(() => users.id),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  userId: varchar("user_id").references(() => users.id),
  date: timestamp("date").notNull().default(sql`now()`),
  tags: text("tags").array(),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0"),
  categoryId: varchar("category_id").references(() => categories.id),
  userId: varchar("user_id").references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  targetDate: timestamp("target_date").notNull(),
  userId: varchar("user_id").references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
  date: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  // If category is "Outros" (cat-outros), description is required
  if (data.categoryId === "cat-outros" && (!data.description || data.description.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Descrição é obrigatória para a categoria 'Outros'",
  path: ["description"],
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  spent: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  currentAmount: true,
}).extend({
  targetAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
  targetDate: z.string(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
