import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoryManagementProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoryManagement({ categories, onRefresh }: CategoryManagementProps) {
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/quiz/categories", categoryData);
      alert("Category added successfully!");
      setCategoryData({ name: "", description: "" });
      onRefresh(); // Refresh total list
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Manage Categories</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {categories.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4 max-w-xl">
          <h3 className="text-lg font-medium text-foreground">
            Add New Category
          </h3>
          <form className="flex gap-4" onSubmit={handleCreateCategory}>
            <Input
              placeholder="Category Name (e.g. Java)"
              value={categoryData.name}
              onChange={(e) =>
                setCategoryData({ ...categoryData, name: e.target.value })
              }
              className="bg-background/50 border-input"
              required
            />
            <Input
              placeholder="Description"
              value={categoryData.description}
              onChange={(e) =>
                setCategoryData({
                  ...categoryData,
                  description: e.target.value,
                })
              }
              className="bg-background/50 border-input"
            />
            <Button type="submit">Add</Button>
          </form>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            Existing Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-lg bg-card border border-border shadow-sm"
              >
                <div className="font-bold text-foreground">{cat.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {cat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
