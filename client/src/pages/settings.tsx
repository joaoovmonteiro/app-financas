import { Card } from "@/components/ui/card";
import { CategoryManager } from "@/components/category-manager";
import { Settings as SettingsIcon, Tag } from "lucide-react";

interface SettingsProps {
  shouldOpenCategoryModal?: boolean;
  onCategoryModalClose?: () => void;
}

export function Settings({ shouldOpenCategoryModal = false, onCategoryModalClose }: SettingsProps) {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-accent-purple" />
        <h1 className="text-xl font-bold text-white">Configurações</h1>
      </div>

      {/* Category Management */}
      <Card className="bg-dark-surface p-6 rounded-2xl border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Tag className="w-5 h-5 text-accent-purple" />
          <h2 className="text-lg font-semibold text-white">Categorias</h2>
        </div>
        <p className="text-text-secondary mb-4">
          Gerencie suas categorias de transações
        </p>
        <CategoryManager 
          forceOpen={shouldOpenCategoryModal}
          onClose={onCategoryModalClose}
        />
      </Card>
    </div>
  );
}