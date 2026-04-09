"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { CodingProblem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ProblemListPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get("/problems");
      setProblems(res.data);
    } catch (error) {
      console.error("Failed to fetch problems", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/problems/${id}`);
      setProblems(prev => prev.filter(p => p.id !== id));
      toast.success("Problem deleted successfully");
    } catch (error) {
      console.error("Failed to delete problem", error);
      toast.error("Failed to delete problem");
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push("/admin")}
                        className="rounded-full hover:bg-zinc-800 w-10 h-10 p-0"
                     >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                     </Button>
                     <div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
                            Manage Problems
                        </h1>
                        <p className="text-gray-400 mt-1">View, edit, and manage all coding problems.</p>
                     </div>
                </div>
                <Button onClick={() => router.push("/admin")} className="bg-white text-black hover:bg-gray-200">
                    <Plus className="w-4 h-4 mr-2" />
                    New Problem
                </Button>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            placeholder="Search problems..." 
                            className="bg-black border-zinc-700 pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading problems...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="text-xs uppercase bg-zinc-950/50 text-gray-300">
                                    <tr>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Difficulty</th>
                                        <th className="px-6 py-3">Method Name</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredProblems.map((problem) => (
                                        <tr key={problem.id} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">{problem.id}</td>
                                            <td className="px-6 py-4 font-medium text-white">{problem.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                    ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                      problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                                      'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-zinc-500">{problem.methodName}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary"
                                                    onClick={() => router.push(`/admin/problems/edit/${problem.id}`)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="danger"
                                                    onClick={() => handleDelete(problem.id)}
                                                    className="bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-900/50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProblems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No problems found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
