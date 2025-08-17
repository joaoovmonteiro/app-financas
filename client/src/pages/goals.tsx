import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goal-card";
import { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function Goals() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDate, setGoalDate] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      // Force refetch all goal-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/goals"] });
      
      toast({
        title: "Meta criada",
        description: "Sua meta foi criada com sucesso.",
      });
      setGoalName("");
      setGoalAmount("");
      setGoalDate("");
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalName || !goalAmount || !goalDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      name: goalName,
      targetAmount: goalAmount,
      targetDate: goalDate,
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-dark-surface rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Metas Financeiras</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent-purple text-white" data-testid="button-create-goal">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-surface border border-gray-700 text-white max-w-sm mx-auto">
            <DialogTitle className="sr-only">Criar Meta</DialogTitle>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Criar Meta</h3>
              
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label htmlFor="goalName">Nome da Meta</Label>
                  <Input
                    id="goalName"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-dark-primary border-gray-700 text-white"
                    placeholder="Ex: Viagem para Europa"
                    data-testid="input-goal-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goalAmount">Valor da Meta</Label>
                  <Input
                    id="goalAmount"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="bg-dark-primary border-gray-700 text-white"
                    placeholder="0,00"
                    data-testid="input-goal-amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goalDate">Data Limite</Label>
                  <Input
                    id="goalDate"
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="bg-dark-primary border-gray-700 text-white"
                    data-testid="input-goal-date"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-purple text-white"
                  disabled={createGoalMutation.isPending}
                  data-testid="button-submit-goal"
                >
                  {createGoalMutation.isPending ? "Criando..." : "Criar Meta"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="bg-dark-surface p-8 rounded-xl border border-gray-700 text-center">
            <p className="text-text-secondary">Nenhuma meta criada</p>
            <p className="text-sm text-text-secondary mt-1">Crie sua primeira meta financeira!</p>
          </Card>
        ) : (
          goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        )}
      </div>
    </div>
  );
}
