import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import api from "@/services/api";

interface Category {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
}

interface QuizManagementProps {
  categories: Category[];
}

export default function QuizManagement({ categories }: QuizManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionData, setQuestionData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    difficulty: "Easy",
  });

  // Fetch topics when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchTopics = async () => {
        try {
          const res = await api.get(`/topics/category/${selectedCategory}`);
          setTopics(res.data);
        } catch (error) {
          console.error("Failed to fetch topics:", error);
        }
      };
      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [selectedCategory]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post("/quiz/questions", {
            ...questionData,
            category: { id: parseInt(selectedCategory) },
            topic: { id: parseInt(selectedTopic) },
        });
        toast.success("Question added successfully!");
        setQuestionData({
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            difficulty: "Easy",
        });
        setSelectedCategory("");
        setSelectedTopic("");
    } catch (error) {
        console.error("Failed to add question:", error);
        toast.error("Failed to add question");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Add New Quiz Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleCreateQuestion}
          className="space-y-4 max-w-2xl"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Select Category
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="" className="bg-zinc-900 text-white">Select a language...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                Select Topic
                </label>
                <select
                className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
                >
                <option value="" className="bg-zinc-900 text-white">Select a topic...</option>
                {topics.map((topic) => (
                    <option key={topic.id} value={topic.id} className="bg-zinc-900 text-white">
                    {topic.name}
                    </option>
                ))}
                </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Question
            </label>
            <Input
              placeholder="Enter the question..."
              value={questionData.question}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  question: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Option A"
              value={questionData.optionA}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  optionA: e.target.value,
                })
              }
              required
            />
            <Input
              placeholder="Option B"
              value={questionData.optionB}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  optionB: e.target.value,
                })
              }
              required
            />
            <Input
              placeholder="Option C"
              value={questionData.optionC}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  optionC: e.target.value,
                })
              }
              required
            />
            <Input
              placeholder="Option D"
              value={questionData.optionD}
              onChange={(e) =>
                setQuestionData({
                  ...questionData,
                  optionD: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Correct Option
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={questionData.correctAnswer}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    correctAnswer: e.target.value,
                  })
                }
                required
              >
                <option value="" className="bg-zinc-900 text-white">Select correct option...</option>
                <option value="Option A" className="bg-zinc-900 text-white">Option A</option>
                <option value="Option B" className="bg-zinc-900 text-white">Option B</option>
                <option value="Option C" className="bg-zinc-900 text-white">Option C</option>
                <option value="Option D" className="bg-zinc-900 text-white">Option D</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Difficulty
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={questionData.difficulty}
                onChange={(e) =>
                  setQuestionData({
                    ...questionData,
                    difficulty: e.target.value,
                  })
                }
              >
                <option value="Easy" className="bg-zinc-900 text-white">Easy</option>
                <option value="Medium" className="bg-zinc-900 text-white">Medium</option>
                <option value="Hard" className="bg-zinc-900 text-white">Hard</option>
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary">
            Add Question
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
