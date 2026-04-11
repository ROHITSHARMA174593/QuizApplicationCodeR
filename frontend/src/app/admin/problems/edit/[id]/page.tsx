"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { CodingProblem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<Partial<CodingProblem>>({});
  
  // Hidden files state
  const [hiddenFiles, setHiddenFiles] = useState<{ input: File | null; output: File | null }>({ input: null, output: null });

  useEffect(() => {
    if (id) fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${id}`);
      setProblem(res.data);
    } catch (error) {
      console.error("Failed to fetch problem", error);
      toast.error("Failed to load problem details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const updateData = {
            ...problem,
            visibleInput: problem.visibleInput,
            visibleOutput: problem.visibleOutput
        };
        await api.put(`/problems/${id}`, updateData);

        // 2. If hidden files selected, replace them
        if (hiddenFiles.input && hiddenFiles.output) {
            const formData = new FormData();
            formData.append("input", hiddenFiles.input);
            formData.append("output", hiddenFiles.output);
            await api.put(`/testcases/problem/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        toast.success("Problem updated successfully!");
        router.push("/admin/problems");
    } catch (error) {
        console.error("Failed to update problem", error);
        toast.error("Failed to update problem");
    } finally {
        setSaving(false);
    }
  };

  const handleHiddenFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "input" | "output") => {
    const file = e.target.files?.[0] || null;
    setHiddenFiles(prev => ({ ...prev, [type]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "").slice(0, 2).join("\n");
        
        setProblem(prev => ({
          ...prev,
          [type === "input" ? "visibleInput" : "visibleOutput"]: lines
        }));
      };
      reader.readAsText(file);
    }
  };

  if (loading) return <div className="text-white text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push("/admin/problems")}
                    className="rounded-full hover:bg-zinc-800 w-10 h-10 p-0"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Button>
                <div>
                     <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                        Edit Problem
                     </h1>
                     <p className="text-gray-400">Update problem details and test cases.</p>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Title</label>
                                <Input 
                                    value={problem.title || ""} 
                                    onChange={e => setProblem({...problem, title: e.target.value})}
                                    className="bg-black border-zinc-700"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Difficulty</label>
                                <select 
                                    value={problem.difficulty || "Easy"}
                                    onChange={e => setProblem({...problem, difficulty: e.target.value as any})}
                                    className="w-full h-10 rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Description</label>
                            <textarea
                                value={problem.description || ""}
                                onChange={e => setProblem({...problem, description: e.target.value})}
                                className="w-full min-h-[150px] rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Method Signature</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Method Name</label>
                            <Input 
                                value={problem.methodName || ""} 
                                onChange={e => setProblem({...problem, methodName: e.target.value})}
                                className="bg-black border-zinc-700 font-mono"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Return Type</label>
                            <Input 
                                value={problem.returnType || ""} 
                                onChange={e => setProblem({...problem, returnType: e.target.value})}
                                className="bg-black border-zinc-700 font-mono"
                                required
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                             <label className="text-sm font-medium text-gray-400">Parameters (JSON)</label>
                             <Input 
                                value={problem.parameters || ""} 
                                onChange={e => setProblem({...problem, parameters: e.target.value})}
                                className="bg-black border-zinc-700 font-mono"
                                placeholder='[{"type":"int","name":"n"}]'
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Hidden Test Cases (Replace)
                        </CardTitle>
                        <p className="text-xs text-gray-500">Only upload if you want to replace existing hidden test cases.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Full Input File (.txt)</label>
                                <Input 
                                    type="file" 
                                    accept=".txt"
                                    onChange={(e) => handleHiddenFileChange(e, "input")}
                                    className="bg-black border-zinc-700 file:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Full Output File (.txt)</label>
                                <Input 
                                    type="file" 
                                    accept=".txt"
                                    onChange={(e) => handleHiddenFileChange(e, "output")}
                                    className="bg-black border-zinc-700 file:text-white"
                                />
                            </div>
                        </div>

                        {/* Visible Test Case Preview */}
                        {(problem.visibleInput || problem.visibleOutput) && (
                            <div className="space-y-4 border p-4 rounded-md border-purple-500/30 bg-purple-500/5">
                                <h3 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                                    <FileText size={16} /> Visible Test Cases (Preview)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400">Visible Input (First 2 lines)</label>
                                        <textarea
                                            className="w-full h-20 rounded-md border border-zinc-700 bg-black text-white p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={problem.visibleInput || ""}
                                            onChange={(e) => setProblem({ ...problem, visibleInput: e.target.value })}
                                            placeholder="Automatically populated from input.txt"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400">Visible Output (First 2 lines)</label>
                                        <textarea
                                            className="w-full h-20 rounded-md border border-zinc-700 bg-black text-white p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            value={problem.visibleOutput || ""}
                                            onChange={(e) => setProblem({ ...problem, visibleOutput: e.target.value })}
                                            placeholder="Automatically populated from output.txt"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => router.push("/admin/problems")}>Cancel</Button>
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]">
                        {saving ? "Saving..." : "Update Problem"}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
}
