import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Transaction, Category } from "@shared/schema";

export function Statistics() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse">
        <div className="h-64 bg-dark-surface rounded-2xl"></div>
        <div className="h-64 bg-dark-surface rounded-2xl"></div>
      </div>
    );
  }

  // Process data for monthly evolution chart
  const monthlyData = () => {
    const monthMap = new Map();
    
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const monthData = monthMap.get(monthKey);
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === "income") {
        monthData.income += amount;
      } else {
        monthData.expenses += amount;
      }
    });

    const sortedMonths = Array.from(monthMap.keys()).sort().slice(-6); // Last 6 months
    
    return {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("pt-BR", { month: "short" });
      }),
      datasets: [
        {
          label: "Receitas",
          data: sortedMonths.map(month => monthMap.get(month)?.income || 0),
          backgroundColor: "#4CAF50",
        },
        {
          label: "Despesas",
          data: sortedMonths.map(month => monthMap.get(month)?.expenses || 0),
          backgroundColor: "#F44336",
        },
      ],
    };
  };

  // Process data for category expenses chart
  const categoryData = () => {
    const categoryMap = new Map();
    
    transactions
      .filter(t => t.type === "expense")
      .forEach((transaction) => {
        const categoryId = transaction.categoryId || "unknown";
        const amount = parseFloat(transaction.amount);
        
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, 0);
        }
        
        categoryMap.set(categoryId, categoryMap.get(categoryId) + amount);
      });

    const sortedCategories = Array.from(categoryMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 categories

    return {
      labels: sortedCategories.map(([categoryId]) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || "Sem categoria";
      }),
      values: sortedCategories.map(([, amount]) => amount),
      colors: sortedCategories.map(([categoryId]) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.color || "#666666";
      }),
    };
  };

  const monthlyChartData = monthlyData();
  const categoryChartData = categoryData();

  return (
    <div className="px-4 py-6 space-y-6 fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Estatísticas</h2>

      {/* Monthly Evolution Chart */}
      <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Evolução Mensal</h3>
        <div className="h-64" data-testid="chart-monthly-evolution">
          <BarChart data={monthlyChartData} />
        </div>
      </Card>

      {/* Category Expenses Chart */}
      <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Despesas por Categoria</h3>
        <div className="h-64" data-testid="chart-category-expenses">
          {categoryChartData.values.length > 0 ? (
            <PieChart data={categoryChartData} showLegend={true} cutout="50%" />
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-dark-surface p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Transações Total</h4>
          <p className="text-2xl font-bold text-white" data-testid="text-total-transactions">
            {transactions.length}
          </p>
        </Card>
        <Card className="bg-dark-surface p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Categorias Ativas</h4>
          <p className="text-2xl font-bold text-white" data-testid="text-active-categories">
            {categories.length}
          </p>
        </Card>
      </div>
    </div>
  );
}
