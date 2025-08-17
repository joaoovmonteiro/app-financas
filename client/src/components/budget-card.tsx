import { Progress } from "@/components/ui/progress";
import { Budget, Category } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import * as Icons from "lucide-react";
import { Lightbulb, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BudgetCardProps {
  budget: Budget;
  category: Category;
}

export function BudgetCard({ budget, category }: BudgetCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const spent = parseFloat(budget.spent);
  const total = parseFloat(budget.amount);
  const percentage = (spent / total) * 100;
  const remaining = total - spent;
  
  // Calculate daily spending suggestion for this specific budget
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDate.getDate();
  const dailySuggestion = daysRemaining > 0 ? remaining / daysRemaining : 0;
  
  const getProgressColor = () => {
    if (percentage <= 70) return "bg-income-green";
    if (percentage <= 90) return "bg-warning-yellow";
    return "bg-expense-red";
  };

  const getIcon = () => {
    const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
    return <IconComponent className="w-5 h-5" style={{ color: category.color }} />;
  };

  const deleteBudgetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/budgets/${budget.id}`);
      return response.json();
    },
    onSuccess: () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      queryClient.invalidateQueries({ queryKey: ["/api/budgets", currentMonth, currentYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Orçamento excluído",
        description: "O orçamento foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="bg-dark-surface p-4 rounded-xl border border-gray-700" data-testid={`budget-card-${budget.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium text-white" data-testid={`text-budget-name-${budget.id}`}>
              {category.name}
            </h4>
            <p className="text-text-secondary text-sm" data-testid={`text-budget-amount-${budget.id}`}>
              {formatCurrency(spent)} de {formatCurrency(total)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary" data-testid={`text-budget-percentage-${budget.id}`}>
            {percentage.toFixed(0)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteBudgetMutation.mutate()}
            disabled={deleteBudgetMutation.isPending}
            className="h-8 w-8 p-0 hover:bg-expense-red/20 hover:text-expense-red"
            data-testid={`button-delete-budget-${budget.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Progress 
        value={percentage} 
        className="w-full h-2 bg-dark-primary"
        data-testid={`progress-budget-${budget.id}`}
      />
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-text-secondary">
          Restante: <span className="text-income-green font-medium">{formatCurrency(remaining)}</span>
        </span>
      </div>
      
      {dailySuggestion > 0 && remaining > 0 && (
        <div className="mt-3 p-2 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
          <div className="flex items-center space-x-1 mb-1">
            <Lightbulb className="w-3 h-3 text-accent-purple" />
            <span className="text-xs font-medium text-accent-purple">Dica diária</span>
          </div>
          <p className="text-xs text-text-secondary" data-testid={`text-daily-suggestion-${budget.id}`}>
            Você pode gastar <span className="text-accent-purple font-semibold">
              {formatCurrency(dailySuggestion)}
            </span> por dia nos próximos <span className="text-accent-purple font-semibold">
              {daysRemaining} dias
            </span>.
          </p>
        </div>
      )}
    </div>
  );
}
