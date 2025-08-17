import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Goal } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const current = parseFloat(goal.currentAmount);
  const target = parseFloat(goal.targetAmount);
  const percentage = (current / target) * 100;
  const remaining = target - current;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteGoalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/goals/${goal.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta removida",
        description: "Sua meta foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover meta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <div className="bg-dark-surface p-6 rounded-2xl border border-gray-700" data-testid={`goal-card-${goal.id}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white" data-testid={`text-goal-name-${goal.id}`}>
            {goal.name}
          </h3>
          <p className="text-text-secondary text-sm" data-testid={`text-goal-target-${goal.id}`}>
            Meta: {formatCurrency(target)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <span className="text-2xl font-bold text-accent-purple" data-testid={`text-goal-current-${goal.id}`}>
              {formatCurrency(current)}
            </span>
            <p className="text-text-secondary text-sm" data-testid={`text-goal-percentage-${goal.id}`}>
              {percentage.toFixed(1)}% atingido
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteGoalMutation.mutate()}
            className="text-expense-red hover:bg-expense-red/20"
            disabled={deleteGoalMutation.isPending}
            data-testid={`button-delete-goal-${goal.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        className="w-full h-3 mb-4 bg-dark-primary"
        data-testid={`progress-goal-${goal.id}`}
      />
      
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">
          Faltam {formatCurrency(remaining)}
        </span>
        <span className="text-accent-purple font-medium" data-testid={`text-goal-months-${goal.id}`}>
          {monthsRemaining} meses restantes
        </span>
      </div>
    </div>
  );
}
