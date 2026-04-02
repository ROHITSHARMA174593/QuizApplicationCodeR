import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Upload, Code } from "lucide-react";
import api from "@/services/api";

interface Category {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
}

interface ProblemManagementProps {
  categories: Category[];
  stats: any;
}

export default function ProblemManagement({ categories, stats }: ProblemManagementProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    testCases: [],
    methodName: "",
    returnType: "int",
    visibleInput: "",
    visibleOutput: "",
  });

  const [hiddenFiles, setHiddenFiles] = useState<{ input: File | null; output: File | null }>({ input: null, output: null });
  const [parameters, setParameters] = useState<{ type: string; name: string }[]>([]);
  const [newParam, setNewParam] = useState({ type: "int", name: "" });

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

  const handleAddParameter = () => {
    if (newParam.name) {
      setParameters([...parameters, newParam]);
      setNewParam({ ...newParam, name: "" });
    }
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleHiddenFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "input" | "output") => {
    const file = e.target.files?.[0] || null;
    setHiddenFiles(prev => ({ ...prev, [type]: file }));
  };

  const generatedBoilerplate = `class Solution {
    public ${problemData.returnType} ${problemData.methodName || "methodName"}(${parameters.map(p => `${p.type} ${p.name}`).join(", ")}) {
        // Write your code here
        return ${problemData.returnType === "void" ? "" : problemData.returnType === "int" ? "0" : "null"};
    }
}`;

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const problemRes = await api.post("/problems", {
        ...problemData,
        parameters: JSON.stringify(parameters),
        category: { id: parseInt(selectedCategory) },
        topic: { id: parseInt(selectedTopic) },
      });

      const problemId = problemRes.data.id;

      if (hiddenFiles.input && hiddenFiles.output) {
        const formData = new FormData();
        formData.append("input", hiddenFiles.input);
        formData.append("output", hiddenFiles.output);
        
        await api.post(`/testcases/problem/${problemId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Problem added successfully!");
      setProblemData({
        title: "",
        description: "",
        difficulty: "Easy",
        testCases: [],
        methodName: "",
        returnType: "int",
        visibleInput: "",
        visibleOutput: "",
      });
      setHiddenFiles({ input: null, output: null });
      setParameters([]);
      setSelectedCategory("");
      setSelectedTopic("");
    } catch (error) {
      console.error("Failed to add problem:", error);
      alert("Failed to add problem");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Add New Coding Problem</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddProblem} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-2 gap-6">
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
                <option value="" className="bg-zinc-900 text-white">Select a language/category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
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
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900 border border-input">
                <div>
                   <p className="text-sm font-medium text-muted-foreground">Total Problems</p>
                   <p className="text-2xl font-bold text-white">{stats?.totalProblems || 0}</p>
                </div>
                <Button
                   size="sm" 
                   variant="outline" 
                   className="text-xs border-zinc-700 hover:bg-zinc-800 text-gray-300"
                   onClick={() => router.push("/admin/problems")}
                >
                   Manage List
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Difficulty
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={problemData.difficulty}
                onChange={(e) =>
                  setProblemData({
                    ...problemData,
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Problem Title
            </label>
            <Input
              placeholder="e.g. Sum of Two Numbers"
              value={problemData.title}
              onChange={(e) =>
                setProblemData({ ...problemData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              className="flex min-h-30 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Describe the problem statement, input/output format..."
              value={problemData.description}
              onChange={(e) =>
                setProblemData({
                  ...problemData,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-4 border-t border-border pt-4">
             <h3 className="text-lg font-medium text-foreground">Function Signature</h3>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Method Name</label>
                    <Input 
                        placeholder="e.g. twoSum"
                        value={problemData.methodName}
                        onChange={(e) => setProblemData({...problemData, methodName: e.target.value})}
                        className="bg-background/50 border-input"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Return Type</label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={problemData.returnType}
                        onChange={(e) => setProblemData({...problemData, returnType: e.target.value})}
                    >
                        <option value="int" className="bg-zinc-900 text-white">int</option>
                        <option value="String" className="bg-zinc-900 text-white">String</option>
                        <option value="int[]" className="bg-zinc-900 text-white">int[]</option>
                        <option value="boolean" className="bg-zinc-900 text-white">boolean</option>
                        <option value="void" className="bg-zinc-900 text-white">void</option>
                    </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Parameters</label>
                <div className="flex gap-2">
                    <select 
                        className="w-1/3 rounded-md border border-input bg-zinc-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={newParam.type}
                        onChange={(e) => setNewParam({...newParam, type: e.target.value})}
                    >
                        <option value="int" className="bg-zinc-900 text-white">int</option>
                        <option value="String" className="bg-zinc-900 text-white">String</option>
                        <option value="int[]" className="bg-zinc-900 text-white">int[]</option>
                        <option value="boolean" className="bg-zinc-900 text-white">boolean</option>
                    </select>
                    <Input 
                        placeholder="Parameter Name (e.g. nums)"
                        value={newParam.name}
                        onChange={(e) => setNewParam({...newParam, name: e.target.value})}
                        className="bg-background/50 border-input"
                    />
                    <Button type="button" onClick={handleAddParameter} variant="secondary">Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                    {parameters.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm text-secondary-foreground">
                            <span>{p.type} {p.name}</span>
                            <button type="button" onClick={() => handleRemoveParameter(i)} className="text-muted-foreground hover:text-destructive">×</button>
                        </div>
                    ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Preview User Code</label>
                <pre className="bg-muted p-4 rounded-md border border-border font-mono text-sm text-primary overflow-x-auto">
                    {generatedBoilerplate}
                </pre>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-4 border p-4 rounded-md border-border/50">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                   <FileText size={16} /> Visible Test Case (Stored in DB)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Visible Input (Text)</label>
                    <textarea
                      placeholder="Enter visible input here (e.g. 1 2)"
                      value={problemData.visibleInput || ""}
                      onChange={(e) => setProblemData({...problemData, visibleInput: e.target.value})}
                      className="flex min-h-25 w-full rounded-md border border-input bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Visible Output (Text)</label>
                    <textarea
                      placeholder="Enter visible output here (e.g. 3)"
                      value={problemData.visibleOutput || ""}
                      onChange={(e) => setProblemData({...problemData, visibleOutput: e.target.value})}
                      className="flex min-h-25 w-full rounded-md border border-input bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border p-4 rounded-md border-border/50">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                   <Upload size={16} /> Hidden Test Cases (Stored in S3)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs text-muted-foreground">Hidden Input (input.txt)</label>
                     <Input
                       type="file"
                       accept=".txt"
                       onChange={(e) => handleHiddenFileChange(e, "input")}
                       className="bg-zinc-900 border border-input text-foreground"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs text-muted-foreground">Hidden Output (output.txt)</label>
                     <Input
                       type="file"
                       accept=".txt"
                       onChange={(e) => handleHiddenFileChange(e, "output")}
                       className="bg-zinc-900 border border-input text-foreground"
                     />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full md:w-auto"
          >
            Create Problem
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
