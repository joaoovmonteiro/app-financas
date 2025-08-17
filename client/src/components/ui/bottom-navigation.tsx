import { Home, List, PieChart, Target, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "transactions", label: "Gastos", icon: List },
  { id: "budgets", label: "Planos", icon: PieChart },
  { id: "statistics", label: "Dados", icon: BarChart2 },
  { id: "settings", label: "Config", icon: Settings },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-gray-700 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                className={cn(
                  "nav-item flex flex-col items-center space-y-1 py-2 transition-colors min-w-0 flex-1",
                  isActive ? "active" : ""
                )}
                onClick={() => onTabChange(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
