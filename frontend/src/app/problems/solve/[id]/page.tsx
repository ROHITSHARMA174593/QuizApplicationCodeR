"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import api from "@/services/api";
import { CodingProblem } from "@/types";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import confetti from "canvas-confetti";

export default function ProblemSolvePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ status: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
        const starterCode = `// Write your solution for: ${res.data.title}\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        \n    }\n}`;
        setCode(starterCode);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    
    try {
        const response = await api.post('/problems/solve', {
            problemId: problem.id,
            code: code,
            language: 'java'
        });
        
        const data = response.data;
        if (data.success) {
             confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#3b82f6', '#eab308']
             });
        }

        setResult({
            status: data.success ? 'success' : 'error',
            message: data.message + (data.output ? `: ${data.output}` : '') + (data.expectedOutput && !data.success ? ` (Expected: ${data.expectedOutput})` : '')
        });
    } catch (error) {
        setResult({
            status: 'error',
            message: 'Submission failed: ' + error
        });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-black text-white">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
    );
  }

  if (!problem) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-black text-white gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold">Problem not found</h1>
            <Link href="/problems">
                <Button variant="outline">Back to Problems</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pt-16 bg-black text-white overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Description */}
            <div className="w-1/2 flex flex-col border-r border-zinc-800 bg-[#0f0f10]">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <Link href="/problems" className="text-zinc-500 hover:text-white flex items-center transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2"/> Problems
                    </Link>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <h1 className="text-2xl font-bold mb-3 text-zinc-100">{problem.title}</h1>
                    
                    <div className="flex gap-2 mb-6">
                         <span className={`px-2 py-0.5 rounded text-xs font-medium border
                          ${problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                            'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {problem.difficulty}
                        </span>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-medium">
                            {problem.category?.name || "Algorithm"}
                        </span>
                    </div>

                    <div className="prose prose-invert max-w-none text-zinc-300">
                        <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
                    </div>
                    
                    {/* Test Cases */}
                    {problem.testCases && problem.testCases.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Example Test Case</h3>
                            <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 font-mono text-sm space-y-2">
                                <div>
                                    <span className="text-zinc-500 block text-xs mb-1">Input</span>
                                    <div className="bg-black/50 p-2 rounded text-zinc-200">{problem.testCases[0].input}</div>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block text-xs mb-1">Target Output</span>
                                    <div className="bg-black/50 p-2 rounded text-zinc-200">{problem.testCases[0].expectedOutput}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="w-1/2 flex flex-col bg-[#1e1e1e] relative">
                {/* Editor Toolbar */}
                <div className="h-12 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-zinc-400 font-medium">Java Solution</span>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className={`transition-all ${submitting ? 'opacity-70 cursor-wait' : 'hover:scale-105'}`}
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" /> Submit</>
                        )}
                    </Button>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="java"
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
                
                {/* Result Overlay / Panel */}
                {result && (
                    <div className={`p-4 border-t border-zinc-800 ${result.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <div className="flex items-center gap-2">
                            {result.status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className={result.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                                {result.message}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
