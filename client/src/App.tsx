import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useKeyboardDismiss } from "@/hooks/use-keyboard-dismiss";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { TransactionModal } from "@/components/transaction-modal";

import { CategoryManager } from "@/components/category-manager";
import { Dashboard } from "@/pages/dashboard";
import { Transactions } from "@/pages/transactions";
import { Budgets } from "@/pages/budgets";
import { Statistics } from "@/pages/statistics";
import { Settings } from "@/pages/settings";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, User, Bell, Receipt, Target, FolderPlus } from "lucide-react";
import { Transaction } from "@shared/schema";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Enable keyboard dismissal on touch outside
  useKeyboardDismiss();

  // Create global function to open transaction modal
  useEffect(() => {
    (window as any).openTransactionModal = () => {
      console.log("Global openTransactionModal called");
      setEditingTransaction(null);
      setIsTransactionModalOpen(true);
    };

    return () => {
      delete (window as any).openTransactionModal;
    };
  }, []);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleAddTransaction = () => {
    console.log("handleAddTransaction called");
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsTransactionModalOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions onEditTransaction={handleEditTransaction} onAddTransaction={handleAddTransaction} />;
      case "budgets":
        return <Budgets shouldOpenModal={isBudgetModalOpen} onModalClose={() => setIsBudgetModalOpen(false)} />;

      case "statistics":
        return <Statistics />;
      case "settings":
        return <Settings shouldOpenCategoryModal={isCategoryModalOpen} onCategoryModalClose={() => setIsCategoryModalOpen(false)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="max-w-md mx-auto bg-dark-primary mobile-container relative flex flex-col">
            {/* Header */}
            <header className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] gradient-bg border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white" data-testid="text-user-greeting">
                      Olá, bem vindo de volta!
                    </h1>
                    <p className="text-text-secondary text-sm">Bom controle financeiro!</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2 rounded-lg bg-dark-surface" data-testid="button-notifications">
                  <Bell className="w-5 h-5 text-text-secondary" />
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto main-content">
              {renderActiveTab()}
            </main>

            {/* Floating Action Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-accent-purple rounded-full shadow-lg flex items-center justify-center floating-animation hover:bg-purple-600 z-40"
                  data-testid="button-add-dropdown"
                >
                  <Plus className="w-6 h-6 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                align="end" 
                className="mb-2 bg-dark-surface border border-gray-700 rounded-xl shadow-xl min-w-[220px] p-2"
                data-testid="dropdown-add-menu"
              >
                <DropdownMenuItem 
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="hover:bg-accent-purple/30 text-white cursor-pointer px-4 py-3 rounded-lg m-1 bg-accent-purple/20 border border-accent-purple/40 transition-colors duration-200"
                  data-testid="menu-add-transaction"
                >
                  <Receipt className="w-5 h-5 mr-3 text-accent-purple" />
                  <div className="flex flex-col">
                    <span className="font-bold text-accent-purple text-sm">NOVA TRANSAÇÃO</span>
                    <span className="text-xs text-accent-purple/80">Adicionar receita ou gasto</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    setActiveTab("budgets");
                    setIsBudgetModalOpen(true);
                  }}
                  className="hover:bg-income-green/30 text-white cursor-pointer px-4 py-3 rounded-lg m-1 bg-income-green/20 border border-income-green/40 transition-colors duration-200"
                  data-testid="menu-add-budget"
                >
                  <Target className="w-5 h-5 mr-3 text-income-green" />
                  <div className="flex flex-col">
                    <span className="font-bold text-income-green text-sm">Novo Orçamento</span>
                    <span className="text-xs text-income-green/80">Definir limite de gastos</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    setActiveTab("settings");
                    setIsCategoryModalOpen(true);
                  }}
                  className="hover:bg-warning-yellow/30 text-white cursor-pointer px-4 py-3 rounded-lg m-1 bg-warning-yellow/20 border border-warning-yellow/40 transition-colors duration-200"
                  data-testid="menu-add-category"
                >
                  <FolderPlus className="w-5 h-5 mr-3 text-warning-yellow" />
                  <div className="flex flex-col">
                    <span className="font-bold text-warning-yellow text-sm">Nova Categoria</span>
                    <span className="text-xs text-warning-yellow/80">Organizar transações</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Transaction Modal */}
            <TransactionModal
              open={isTransactionModalOpen}
              onOpenChange={handleCloseModal}
              editTransaction={editingTransaction}
            />


          </div>

          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
