"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  FileText,
  ShieldCheck,
  Search,
  MoreVertical,
  Code,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/services/api";

interface AdminStats {
  totalUsers: number;
  activeQuizzes: number;
  totalProblems: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<
    { id: number; name: string; description?: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Category Form State
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });

  // Quiz Form State
  const [questionData, setQuestionData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    difficulty: "Easy",
  });

  const [topics, setTopics] = useState<{ id: number; name: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  // Topic Form State
  const [topicData, setTopicData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const [activeTab, setActiveTab] = useState<
    "users" | "quiz" | "categories" | "problems" | "topics"
  >("users");

  // Problem Form State
  const [problemData, setProblemData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    methodName: "",
    returnType: "int",
  });

  const [parameters, setParameters] = useState<{ type: string; name: string }[]>([]);
  const [newParam, setNewParam] = useState({ type: "int", name: "" });

  const handleAddParameter = () => {
    if (newParam.name) {
      setParameters([...parameters, newParam]);
      setNewParam({ ...newParam, name: "" });
    }
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };
  
  const generatedBoilerplate = `class Solution {
    public ${problemData.returnType} ${problemData.methodName || "methodName"}(${parameters.map(p => `${p.type} ${p.name}`).join(", ")}) {
        // Write your code here
        return ${problemData.returnType === "void" ? "" : problemData.returnType === "int" ? "0" : "null"};
    }
}`;

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

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/problems", {
        ...problemData,
        parameters: JSON.stringify(parameters),
        category: { id: parseInt(selectedCategory) },
        topic: { id: parseInt(selectedTopic) },
      });
      alert("Problem added successfully!");
      setProblemData({
        title: "",
        description: "",
        difficulty: "Easy",

        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        methodName: "",
        returnType: "int",
      });
      setParameters([]);
      setSelectedCategory("");
      setSelectedTopic("");
    } catch (error) {
      console.error("Failed to add problem:", error);
      alert("Failed to add problem");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post("/quiz/questions", {
            ...questionData,
            category: { id: parseInt(selectedCategory) },
            topic: { id: parseInt(selectedTopic) },
        });
        alert("Question added successfully!");
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
        alert("Failed to add question");
    }
  };

  // ... (Rest of existing handlers like addTestCase) ...
  const handleAddTestCase = () => {
    setProblemData({
      ...problemData,
      testCases: [
        ...problemData.testCases,
        { input: "", expectedOutput: "", isHidden: false },
      ],
    });
  };

  const handleRemoveTestCase = (index: number) => {
    const newTestCases = problemData.testCases.filter((_, i) => i !== index);
    setProblemData({ ...problemData, testCases: newTestCases });
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...problemData.testCases];
    // @ts-ignore
    newTestCases[index][field] = value;
    setProblemData({ ...problemData, testCases: newTestCases });
  };

  useEffect(() => {
    // Check role from localStorage
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!token || role !== "ADMIN") {
      // Redirect if not admin
      // router.push('/dashboard');
    }

    fetchAdminData();
  }, [router]);

  // ... (fetchAdminData and handleCreateCategory remain same) ...
  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data);
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      // Fetch categories used in dropdowns
      const catsRes = await api.get("/quiz/categories");
      setCategories(catsRes.data);
    } catch (error: any) {
      console.error("Admin access denied or failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/quiz/categories", categoryData);
      alert("Category added successfully!");
      setCategoryData({ name: "", description: "" });
      const catsRes = await api.get("/quiz/categories");
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category");
    }
  };

  const [loadingStatus, setLoadingStatus] = useState("Initializing...");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 rounded-full border-t-transparent" />
        <p className="text-zinc-400 animate-pulse">{loadingStatus}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage users and system content</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={activeTab === "users" ? "primary" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} className="mr-2" /> Users
          </Button>
          <Button
            variant={activeTab === "categories" ? "primary" : "outline"}
            onClick={() => setActiveTab("categories")}
          >
            <FileText size={18} className="mr-2" /> Categories
          </Button>
          <Button
            variant={activeTab === "topics" ? "primary" : "outline"}
            onClick={() => setActiveTab("topics")}
          >
            <BookOpen size={18} className="mr-2" /> Topics
          </Button>
          <Button
            variant={activeTab === "quiz" ? "primary" : "outline"}
            onClick={() => setActiveTab("quiz")}
          >
            <Activity size={18} className="mr-2" /> Quizzes
          </Button>
          <Button
            variant={activeTab === "problems" ? "primary" : "outline"}
            onClick={() => setActiveTab("problems")}
          >
            <Code size={18} className="mr-2" /> Problems
          </Button>
        </div>
      </div>

       {/* Stats Cards (Same as before) */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-100">
              {stats?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">
              Active Quizzes
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-100">
              {stats?.activeQuizzes || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">
              Total Problems
            </CardTitle>
            <FileText className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-100">
              {stats?.totalProblems || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === "users" && (
         <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search users..." className="pl-9 h-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-zinc-800">
              <table className="w-full text-sm text-left">
                <thead className="text-zinc-400 bg-zinc-900/50 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-zinc-500">
                        #{user.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-200">
                          {user.name}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs border ${
                            user.role === "ADMIN"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "categories" && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manage Categories</CardTitle>
              <div className="text-sm text-zinc-400">
                Total: {categories.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4 max-w-xl">
              <h3 className="text-lg font-medium text-white">
                Add New Category
              </h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Category Name (e.g. Java)"
                  value={categoryData.name}
                  onChange={(e) =>
                    setCategoryData({ ...categoryData, name: e.target.value })
                  }
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
                />
                <Button onClick={handleCreateCategory}>Add</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Existing Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-lg bg-zinc-800 border border-zinc-700"
                  >
                    <div className="font-bold text-white">{cat.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {cat.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "topics" && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Manage Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4 max-w-xl">
              <h3 className="text-lg font-medium text-white">
                Add New Topic
              </h3>
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={topicData.categoryId}
                  onChange={(e) => setTopicData({...topicData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category...</option>
                   {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
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
      )}

      {activeTab === "quiz" && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Add New Quiz Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateQuestion}
              className="space-y-4 max-w-2xl"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Select Category
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Select a language...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
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
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    required
                    >
                    <option value="">Select a topic...</option>
                    {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
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

               {/* Correct Answer and Difficulty Dropdowns (Same as before) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Correct Option
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={questionData.correctAnswer}
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        correctAnswer: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select correct option...</option>
                    <option value="Option A">Option A</option>
                    <option value="Option B">Option B</option>
                    <option value="Option C">Option C</option>
                    <option value="Option D">Option D</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Difficulty
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={questionData.difficulty}
                    onChange={(e) =>
                      setQuestionData({
                        ...questionData,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <Button type="submit" variant="primary">
                Add Question
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "problems" && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Add New Coding Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProblem} className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Select Category
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a language/category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
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
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        required
                        >
                        <option value="">Select a topic...</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                            {topic.name}
                            </option>
                        ))}
                        </select>
                    </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Difficulty
                  </label>
                   {/* Difficulty Select */}
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={problemData.difficulty}
                    onChange={(e) =>
                      setProblemData({
                        ...problemData,
                        difficulty: e.target.value,
                      })
                    }
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

               {/* Title and Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
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
                <label className="text-sm font-medium text-zinc-400">
                  Description
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

              {/* Function Signature Builder */}
              <div className="space-y-4 border-t border-zinc-800 pt-4">
                 <h3 className="text-lg font-medium text-zinc-200">Function Signature</h3>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Method Name</label>
                        <Input 
                            placeholder="e.g. twoSum"
                            value={problemData.methodName}
                            onChange={(e) => setProblemData({...problemData, methodName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Return Type</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={problemData.returnType}
                            onChange={(e) => setProblemData({...problemData, returnType: e.target.value})}
                        >
                            <option value="int">int</option>
                            <option value="String">String</option>
                            <option value="int[]">int[]</option>
                            <option value="boolean">boolean</option>
                            <option value="void">void</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Parameters</label>
                    <div className="flex gap-2">
                        <select 
                            className="w-1/3 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none"
                            value={newParam.type}
                            onChange={(e) => setNewParam({...newParam, type: e.target.value})}
                        >
                            <option value="int">int</option>
                            <option value="String">String</option>
                            <option value="int[]">int[]</option>
                            <option value="boolean">boolean</option>
                        </select>
                        <Input 
                            placeholder="Parameter Name (e.g. nums)"
                            value={newParam.name}
                            onChange={(e) => setNewParam({...newParam, name: e.target.value})}
                        />
                        <Button type="button" onClick={handleAddParameter} variant="secondary">Add</Button>
                    </div>
                    
                    {/* Params List */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {parameters.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-sm text-zinc-300">
                                <span>{p.type} {p.name}</span>
                                <button type="button" onClick={() => handleRemoveParameter(i)} className="text-zinc-500 hover:text-red-400">×</button>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Boilerplate Preview */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Preview User Code</label>
                    <pre className="bg-black/50 p-4 rounded-md border border-zinc-800 font-mono text-sm text-blue-300 overflow-x-auto">
                        {generatedBoilerplate}
                    </pre>
                 </div>
              </div>

               {/* Test Cases (Same as before) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-400">
                    Test Cases
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTestCase}
                  >
                    <Plus size={16} className="mr-2" /> Add Test Case
                  </Button>
                </div>

                <div className="space-y-4">
                  {problemData.testCases.map((tc, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-start bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50"
                    >
                      <div className="col-span-5 space-y-2">
                        <label className="text-xs text-zinc-500">Input</label>
                        <textarea
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50"
                          rows={2}
                          value={tc.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          placeholder="e.g. 2 3"
                          required
                        />
                      </div>
                      <div className="col-span-5 space-y-2">
                        <label className="text-xs text-zinc-500">
                          Expected Output
                        </label>
                        <textarea
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50"
                          rows={2}
                          value={tc.expectedOutput}
                          onChange={(e) =>
                            handleTestCaseChange(
                              index,
                              "expectedOutput",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`hidden-${index}`}
                            checked={tc.isHidden}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "isHidden",
                                e.target.checked
                              )
                            }
                            className="rounded bg-zinc-800 border-zinc-700"
                          />
                          <label
                            htmlFor={`hidden-${index}`}
                            className="text-xs text-zinc-500 cursor-pointer"
                          >
                            Hidden Case
                          </label>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-end pt-6">
                        {problemData.testCases.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTestCase(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
      )}
    </div>
  );
}
