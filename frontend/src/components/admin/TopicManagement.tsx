import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";

interface Category {
  id: number;
  name: string;
}

interface TopicManagementProps {
  categories: Category[];
}

export default function TopicManagement({ categories }: TopicManagementProps) {
  const [topicData, setTopicData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/topics", {
        name: topicData.name,
        description: topicData.description,
        category: { id: parseInt(topicData.categoryId) },
      });
      alert("Topic added successfully!");
      setTopicData({ name: "", description: "", categoryId: "" });
    } catch (error) {
      console.error("Failed to add topic:", error);
      alert("Failed to add topic");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Manage Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4 max-w-xl">
          <h3 className="text-lg font-medium text-foreground">
            Add New Topic
          </h3>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={topicData.categoryId}
              onChange={(e) => setTopicData({...topicData, categoryId: e.target.value})}
              required
            >
              <option value="" className="bg-zinc-900 text-white">Select Category...</option>
               {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Topic Name (e.g. Strings, Arrays)"
              value={topicData.name}
              onChange={(e) =>
                setTopicData({ ...topicData, name: e.target.value })
              }
              required
            />
            <Input
              placeholder="Description"
              value={topicData.description}
              onChange={(e) =>
                setTopicData({
                  ...topicData,
                  description: e.target.value,
                })
              }
            />
            <Button type="submit">Add Topic</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
