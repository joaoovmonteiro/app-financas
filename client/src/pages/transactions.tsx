import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Transaction, Category } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";
import { Search, MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";

interface TransactionsProps {
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction?: () => void;
}

export function Transactions({ onEditTransaction, onAddTransaction }: TransactionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    console.log("Transactions component props:", { onEditTransaction, onAddTransaction });
    console.log("onAddTransaction type:", typeof onAddTransaction);
  }, [onEditTransaction, onAddTransaction]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = (transaction.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return <Icons.Circle className="w-6 h-6" />;
    
    const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
    return <IconComponent className="w-6 h-6" style={{ color: category.color }} />;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse">
        <div className="h-12 bg-dark-surface rounded-xl"></div>
        <div className="flex space-x-3">
          <div className="h-10 w-16 bg-dark-surface rounded-full"></div>
          <div className="h-10 w-20 bg-dark-surface rounded-full"></div>
          <div className="h-10 w-20 bg-dark-surface rounded-full"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-dark-surface rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transações</h2>
        <Button 
          onClick={() => {
            console.log("Nova Transação button clicked");
            // Use the same approach as the floating action button
            const addTransactionEvent = new CustomEvent('openTransactionModal');
            window.dispatchEvent(addTransactionEvent);
          }}
          className="bg-accent-purple hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          data-testid="button-add-transaction-page"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Nova Transação</span>
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <Input
            type="text"
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-surface border-gray-700 text-white"
            data-testid="input-search-transactions"
          />
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-accent-purple text-white" : "bg-dark-surface border-gray-700 text-white"}
            data-testid="button-filter-all"
          >
            Todas
          </Button>
          <Button
            variant={filterType === "income" ? "default" : "outline"}
            onClick={() => setFilterType("income")}
            className={filterType === "income" ? "bg-accent-purple text-white" : "bg-dark-surface border-gray-700 text-white"}
            data-testid="button-filter-income"
          >
            Receitas
          </Button>
          <Button
            variant={filterType === "expense" ? "default" : "outline"}
            onClick={() => setFilterType("expense")}
            className={filterType === "expense" ? "bg-accent-purple text-white" : "bg-dark-surface border-gray-700 text-white"}
            data-testid="button-filter-expense"
          >
            Despesas
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card className="bg-dark-surface p-8 rounded-xl border border-gray-700 text-center">
            <p className="text-text-secondary">Nenhuma transação encontrada</p>
            <p className="text-sm text-text-secondary mt-1">
              {searchQuery ? "Tente ajustar sua busca" : "Adicione sua primeira transação!"}
            </p>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card 
              key={transaction.id} 
              className="bg-dark-surface p-4 rounded-xl border border-gray-700"
              data-testid={`transaction-card-${transaction.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${categories.find((c) => c.id === transaction.categoryId)?.color || "#666"}20` }}
                  >
                    {getCategoryIcon(transaction.categoryId || "")}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white" data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description || "Sem descrição"}
                    </h4>
                    <p className="text-text-secondary text-sm" data-testid={`text-transaction-details-${transaction.id}`}>
                      {getCategoryName(transaction.categoryId || "")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span 
                      className={`font-bold text-lg ${transaction.type === "income" ? "text-income-green" : "text-expense-red"}`}
                      data-testid={`text-transaction-amount-${transaction.id}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(transaction.amount))}
                    </span>
                    <p className="text-text-secondary text-xs" data-testid={`text-transaction-date-${transaction.id}`}>
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-8 w-8 text-text-secondary hover:text-white"
                        data-testid={`button-transaction-menu-${transaction.id}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark-surface border-gray-700" align="end">
                      <DropdownMenuItem 
                        className="text-white hover:bg-gray-700 cursor-pointer"
                        onClick={() => onEditTransaction(transaction)}
                        data-testid={`button-edit-transaction-${transaction.id}`}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-expense-red hover:bg-gray-700 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                            data-testid={`button-delete-transaction-${transaction.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-dark-surface border-gray-700 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                            <AlertDialogDescription className="text-text-secondary">
                              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-dark-primary border-gray-700 text-white hover:bg-gray-700">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-expense-red text-white hover:bg-red-600"
                              onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                              disabled={deleteTransactionMutation.isPending}
                            >
                              {deleteTransactionMutation.isPending ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  {transaction.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-700 text-text-secondary text-xs rounded-full"
                      data-testid={`tag-${tag}-${transaction.id}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
