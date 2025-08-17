import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { formatCurrency } from "@/lib/currency";
import { Transaction, Category } from "@shared/schema";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import * as Icons from "lucide-react";

interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  recentTransactions: Transaction[];
}

export function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  console.log("Dashboard Debug:", { dashboardData, isLoading, error, categories });

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse">
        <div className="h-32 bg-dark-surface rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-dark-surface rounded-2xl"></div>
          <div className="h-24 bg-dark-surface rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-900/20 border border-red-500 rounded-2xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="px-4 py-6">
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Nenhum dado encontrado</h3>
          <p className="text-yellow-300">Carregando informações...</p>
        </div>
      </div>
    );
  }

  const { balance, income, expenses, recentTransactions } = dashboardData;
  const balanceChange = balance > 0 ? "+2.1%" : "-1.2%";

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return <Icons.Circle className="w-5 h-5" />;
    
    const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
    return <IconComponent className="w-5 h-5" style={{ color: category.color }} />;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  return (
    <div className="px-4 py-6 space-y-6 fade-in" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Balance Cards */}
      <div className="space-y-4">
        {/* Total Balance */}
        <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-sm font-medium">Saldo Total</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:bg-gray-700 rounded"
              data-testid="button-toggle-balance-visibility"
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-text-secondary" />
              ) : (
                <EyeOff className="w-4 h-4 text-text-secondary" />
              )}
            </button>
          </div>
          <h2 className="text-3xl font-bold text-balance-blue mb-1" data-testid="text-total-balance">
            {showBalance ? formatCurrency(balance) : "• • • •"}
          </h2>
          <p className="text-text-secondary text-sm">
            <span className={balance >= 0 ? "text-income-green" : "text-expense-red"}>
              {showBalance ? balanceChange : "• • •"}
            </span> desde último mês
          </p>
        </Card>
        
        {/* Income and Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-dark-surface p-4 rounded-2xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-income-green" />
              <span className="text-text-secondary text-sm">Receitas</span>
            </div>
            <h3 className="text-xl font-bold text-income-green" data-testid="text-total-income">
              {showBalance ? formatCurrency(income) : "• • • •"}
            </h3>
          </Card>
          <Card className="bg-dark-surface p-4 rounded-2xl border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-expense-red" />
              <span className="text-text-secondary text-sm">Despesas</span>
            </div>
            <h3 className="text-xl font-bold text-expense-red" data-testid="text-total-expenses">
              {showBalance ? formatCurrency(expenses) : "• • • •"}
            </h3>
          </Card>
        </div>
      </div>

      {/* Overview Chart */}
      <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Visão Geral do Mês</h3>
        <div className="flex items-center justify-center h-48">
          <PieChart
            data={{
              labels: ["Receitas", "Despesas"],
              values: [income, expenses],
              colors: ["#4CAF50", "#F44336"],
            }}
            cutout="70%"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-income-green rounded-full"></div>
            <span className="text-sm text-text-secondary">
              Receitas ({income > 0 ? ((income / (income + expenses)) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-expense-red rounded-full"></div>
            <span className="text-sm text-text-secondary">
              Despesas ({expenses > 0 ? ((expenses / (income + expenses)) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-dark-surface rounded-2xl border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Últimas Transações</h3>
          <button className="text-accent-purple text-sm font-medium" data-testid="button-view-all-transactions">
            Ver todas
          </button>
        </div>
        <div className="divide-y divide-gray-700">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm mt-1">Adicione sua primeira transação!</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-4 flex items-center justify-between"
                data-testid={`transaction-item-${transaction.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${categories.find((c) => c.id === transaction.categoryId)?.color || "#666"}20` }}
                  >
                    {getCategoryIcon(transaction.categoryId || "")}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-white" data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </h4>
                    <p className="text-text-secondary text-xs" data-testid={`text-transaction-category-${transaction.id}`}>
                      {getCategoryName(transaction.categoryId || "")} • {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span 
                  className={`font-semibold ${transaction.type === "income" ? "text-income-green" : "text-expense-red"}`}
                  data-testid={`text-transaction-amount-${transaction.id}`}
                >
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount))}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
