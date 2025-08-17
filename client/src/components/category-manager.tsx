import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";
import { Plus, Tag, Trash2 } from "lucide-react";
import * as Icons from "lucide-react";

const availableIcons = [
  "Coffee", "Car", "Gamepad2", "FileText", "ArrowDownLeft", "ShoppingCart",
  "Home", "Zap", "Wifi", "Phone", "Heart", "Star", "Book", "Music",
  "Camera", "Plane", "Utensils", "Shirt", "Gift", "Briefcase"
];

const availableColors = [
  "#FF9800", "#2196F3", "#9C27B0", "#F44336", "#4CAF50", 
  "#FF5722", "#795548", "#607D8B", "#E91E63", "#3F51B5",
  "#009688", "#8BC34A", "#CDDC39", "#FFC107", "#FF6F00"
];

interface CategoryManagerProps {
  trigger?: React.ReactNode;
  forceOpen?: boolean;
  onClose?: () => void;
}

export function CategoryManager({ trigger, forceOpen = false, onClose }: CategoryManagerProps) {
  const [open, setOpen] = useState(forceOpen);
  const [step, setStep] = useState(1); // 1: name, 2: icon & color

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Coffee");
  const [color, setColor] = useState("#FF9800");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      console.log("Creating category:", data);
      try {
        const response = await apiRequest("POST", "/api/categories", data);
        const result = await response.json();
        console.log("Category created successfully:", result);
        return result;
      } catch (error) {
        console.error("Error creating category:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria criada",
        description: "Nova categoria adicionada com sucesso.",
      });
      
      // Reset form
      setName("");
      setIcon("Coffee");
      setColor("#FF9800");
      setStep(1);
      setOpen(false);
    },
    onError: (error: Error) => {
      console.error("Category creation error:", error);
      toast({
        title: "Erro",
        description: `Erro ao criar categoria: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest("DELETE", `/api/categories/${categoryId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria excluída",
        description: "Categoria removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, insira um nome para a categoria.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else {
      createCategoryMutation.mutate({ name: name.trim(), icon, color });
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setName("");
    setIcon("Coffee");
    setColor("#FF9800");
    if (onClose) {
      onClose();
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Coffee;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen && onClose) {
        onClose();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-add-category">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs w-[85vw]">
        <DialogHeader>
          <DialogTitle>Nova Categoria - Etapa {step} de 2</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  placeholder="Ex: Educação, Saúde, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-category-name"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  data-testid="button-cancel-category"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  data-testid="button-next-step"
                >
                  Próximo
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger data-testid="select-category-icon">
                    <SelectValue>
                      <div className="flex items-center">
                        {getIconComponent(icon)}
                        <span className="ml-2">{icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center">
                          {getIconComponent(iconName)}
                          <span className="ml-2">{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === colorOption ? "border-white" : "border-gray-600"
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setColor(colorOption)}
                      data-testid={`color-option-${colorOption}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pré-visualização</Label>
                <div className="flex items-center space-x-2 p-2 bg-dark-surface rounded-lg">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {getIconComponent(icon)}
                  </div>
                  <span className="text-white">{name}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  data-testid="button-back-step"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createCategoryMutation.isPending}
                  data-testid="button-save-category"
                >
                  {createCategoryMutation.isPending ? "Salvando..." : "Criar"}
                </Button>
              </div>
            </>
          )}
        </form>

        {categories.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Label className="text-sm font-medium">Categorias Existentes</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 bg-dark-surface rounded-lg"
                  data-testid={`existing-category-${category.id}`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {getIconComponent(category.icon)}
                    </div>
                    <span className="text-sm text-white truncate">{category.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                    disabled={deleteCategoryMutation.isPending}
                    className="h-8 w-8 p-0 hover:bg-expense-red/20 hover:text-expense-red"
                    data-testid={`button-delete-category-${category.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}