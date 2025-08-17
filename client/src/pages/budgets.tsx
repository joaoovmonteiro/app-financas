import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { BudgetCard } from "@/components/budget-card";
import { Budget, Category } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Lightbulb } from "lucide-react";

export function Budgets() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState("");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets", currentMonth, currentYear],
    queryFn: async () => {
      console.log("Fetching budgets for month:", currentMonth, "year:", currentYear);
      const response = await fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`);
      const data = await response.json();
      console.log("Budget query result:", data);
      return data;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions", currentMonth, currentYear],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?month=${currentMonth}&year=${currentYear}`);
      return response.json();
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/budgets", data);
      return response.json();
    },
    onSuccess: () => {
      // Force refetch all budget-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets", currentMonth, currentYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/budgets", currentMonth, currentYear] });
      
      toast({
        title: "Orçamento criado",
        description: "Seu orçamento foi criado com sucesso.",
      });
      setBudgetName("");
      setBudgetAmount("");
      setBudgetCategoryId("");
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budgetName || !budgetAmount || !budgetCategoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    console.log("Creating budget with data:", {
      name: budgetName,
      amount: budgetAmount,
      categoryId: budgetCategoryId,
      month: currentMonth,
      year: currentYear,
    });
    
    createBudgetMutation.mutate({
      name: budgetName,
      amount: budgetAmount,
      categoryId: budgetCategoryId,
      month: currentMonth,
      year: currentYear,
    });
  };

  // Calculate budget insights
  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + parseFloat(budget.spent), 0);
  const remainingBudget = totalBudget - totalSpent;
  
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysRemaining = daysInMonth - currentDate.getDate();
  const dailySuggestion = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse">
        <div className="h-32 bg-dark-surface rounded-2xl"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-dark-surface rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 fade-in">
      {/* Budget Overview */}
      <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">
          Orçamento de {new Date(currentYear, currentMonth - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Orçamento total</span>
            <span className="font-bold text-white" data-testid="text-total-budget">
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Gasto até agora</span>
            <span className="font-bold text-expense-red" data-testid="text-total-spent">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Restante</span>
            <span className="font-bold text-income-green" data-testid="text-remaining-budget">
              {formatCurrency(remainingBudget)}
            </span>
          </div>
        </div>
        
        {dailySuggestion > 0 && (
          <div className="mt-4 p-4 bg-accent-purple/10 border border-accent-purple/30 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-accent-purple" />
              <span className="text-sm font-medium text-accent-purple">Dica inteligente</span>
            </div>
            <p className="text-sm text-text-secondary" data-testid="text-daily-suggestion">
              Você pode gastar <span className="text-accent-purple font-semibold">
                {formatCurrency(dailySuggestion)}
              </span> por dia nos próximos <span className="text-accent-purple font-semibold">
                {daysRemaining} dias
              </span>.
            </p>
          </div>
        )}
      </Card>

      {/* Budget Categories */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Orçamentos por Categoria</h3>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent-purple text-white" data-testid="button-create-budget">
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-surface border border-gray-700 text-white max-w-sm mx-auto">
            <DialogTitle className="sr-only">Criar Orçamento</DialogTitle>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Criar Orçamento</h3>
              
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div>
                  <Label htmlFor="budgetName">Nome do Orçamento</Label>
                  <Input
                    id="budgetName"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    className="bg-dark-primary border-gray-700 text-white"
                    placeholder="Ex: Orçamento Alimentação"
                    data-testid="input-budget-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="budgetAmount">Valor</Label>
                  <Input
                    id="budgetAmount"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="bg-dark-primary border-gray-700 text-white"
                    placeholder="0,00"
                    data-testid="input-budget-amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="budgetCategory">Categoria</Label>
                  <Select value={budgetCategoryId} onValueChange={setBudgetCategoryId}>
                    <SelectTrigger className="bg-dark-primary border-gray-700 text-white" data-testid="select-budget-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-surface border-gray-700">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-purple text-white"
                  disabled={createBudgetMutation.isPending}
                  data-testid="button-submit-budget"
                >
                  {createBudgetMutation.isPending ? "Criando..." : "Criar Orçamento"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card className="bg-dark-surface p-8 rounded-xl border border-gray-700 text-center">
            <p className="text-text-secondary">Nenhum orçamento criado</p>
            <p className="text-sm text-text-secondary mt-1">Crie seu primeiro orçamento para começar!</p>
          </Card>
        ) : (
          budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            return category ? (
              <BudgetCard key={budget.id} budget={budget} category={category} />
            ) : null;
          })
        )}
      </div>
    </div>
  );
}
