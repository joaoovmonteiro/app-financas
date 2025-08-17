import { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Transaction } from "@shared/schema";


interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
}

export function TransactionModal({ open, onOpenChange, editTransaction }: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const isEditing = !!editTransaction;

  // Update form when editTransaction changes
  useEffect(() => {
    if (editTransaction) {
      setAmount(editTransaction.amount);
      setDescription(editTransaction.description || "");
      setCategoryId(editTransaction.categoryId || "");
      setType(editTransaction.type);
    } else {
      setAmount("");
      setDescription("");
      setCategoryId("");
      setType("expense");
    }
  }, [editTransaction, open]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const saveTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        const response = await apiRequest("PUT", `/api/transactions/${editTransaction.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/transactions", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      
      toast({
        title: isEditing ? "Transação atualizada" : "Transação criada",
        description: isEditing ? "Sua transação foi atualizada com sucesso." : "Sua transação foi adicionada com sucesso.",
      });
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategoryId("");
      setType("expense");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: `Erro ao ${isEditing ? "atualizar" : "criar"} transação. Tente novamente.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha valor e categoria.",
        variant: "destructive",
      });
      return;
    }

    // Check if description is required for "Outros" category
    if (categoryId === "cat-outros" && (!description || description.trim() === "")) {
      toast({
        title: "Descrição obrigatória",
        description: "Descrição é obrigatória para a categoria 'Outros'.",
        variant: "destructive",
      });
      return;
    }

    saveTransactionMutation.mutate({
      amount,
      description: description || undefined,
      categoryId,
      type,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border border-gray-700 text-white max-w-sm mx-auto">
        <DialogTitle className="sr-only">{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{isEditing ? "Editar Transação" : "Nova Transação"}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium mb-2">
              Valor
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                R$
              </span>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 bg-dark-primary border-gray-700 text-white"
                data-testid="input-amount"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => setType("expense")}
              className={`${
                type === "expense" 
                  ? "bg-expense-red/20 border-expense-red text-expense-red hover:bg-expense-red/30" 
                  : "bg-dark-primary border-gray-700 text-text-secondary"
              }`}
              data-testid="button-expense-type"
            >
              <Minus className="w-4 h-4 mr-2" />
              Despesa
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => setType("income")}
              className={`${
                type === "income" 
                  ? "bg-income-green/20 border-income-green text-income-green hover:bg-income-green/30" 
                  : "bg-dark-primary border-gray-700 text-text-secondary"
              }`}
              data-testid="button-income-type"
            >
              <Plus className="w-4 h-4 mr-2" />
              Receita
            </Button>
          </div>
          
          <div>
            <Label htmlFor="category" className="block text-sm font-medium mb-2">
              Categoria
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-dark-primary border-gray-700 text-white" data-testid="select-category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-dark-surface border-gray-700">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="text-white hover:bg-dark-primary"
                    data-testid={`category-option-${category.id}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-dark-primary border-gray-700 text-white"
              data-testid="input-description"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-accent-purple text-white hover:bg-purple-600"
            disabled={saveTransactionMutation.isPending}
            data-testid="button-submit-transaction"
          >
            {saveTransactionMutation.isPending 
              ? (isEditing ? "Atualizando..." : "Adicionando...") 
              : (isEditing ? "Atualizar Transação" : "Adicionar Transação")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
