"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
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
  const [result, setResult] = useState<{ 
    status: 'success' | 'error', 
    message: string, 
    output?: string, 
    expectedOutput?: string 
  } | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
        
        // Generate Boilerplate
        let params = [];
        try {
            params = JSON.parse(res.data.parameters || "[]");
        } catch (e) {
            console.error("Failed to parse params", e);
        }

        const paramStr = params.map((p: any) => `${p.type} ${p.name}`).join(", ");
        const returnVal = res.data.returnType === "void" ? "" : res.data.returnType === "int" ? "0" : "null";

        const starterCode = `// Write your solution for: ${res.data.title}
class Solution {
    public ${res.data.returnType || "void"} ${res.data.methodName || "solve"}(${paramStr}) {
        // Your code here
        return ${returnVal};
    }
}`;
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
            message: data.message,
            output: data.output,
            expectedOutput: data.expectedOutput
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
        <div className="flex justify-center items-center h-screen bg-background text-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    );
  }

  if (!problem) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Problem not found</h1>
            <Link href="/problems">
                <Button variant="outline">Back to Problems</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pt-16 bg-background text-foreground overflow-hidden">
        <PanelGroup orientation="horizontal" className="flex-1">
             {/* Left Panel: Description */}
             <Panel defaultSize="40" minSize="20">
                <div className="h-full flex flex-col border-r border-border bg-card">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <Link href="/problems" className="text-muted-foreground hover:text-primary flex items-center transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2"/> Problems
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        <h1 className="text-2xl font-bold mb-3 text-foreground">{problem.title}</h1>
                        
                        <div className="flex gap-2 mb-6">
                             <span className={`px-2 py-0.5 rounded text-xs font-medium border
                              ${problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 
                                'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                              {problem.difficulty}
                            </span>
                            <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-medium">
                                {problem.category?.name || "Algorithm"}
                            </span>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground">
                            <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
                        </div>
                        
                        {/* Test Cases */}
                        {problem.testCases && problem.testCases.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Example Test Case</h3>
                                <div className="bg-muted/50 p-4 rounded-lg border border-border font-mono text-sm space-y-2">
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">Input</span>
                                        <div className="bg-background p-2 rounded text-foreground border border-border">{problem.testCases[0].input}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">Target Output</span>
                                        <div className="bg-background p-2 rounded text-foreground border border-border">{problem.testCases[0].expectedOutput}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             </Panel>
             
             <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary transition-colors cursor-col-resize" />

             {/* Right Panel: Workspace */}
             <Panel minSize="30">
                <PanelGroup orientation="vertical">
                    {/* Top: Editor */}
                    <Panel defaultSize="60" minSize="30">
                        <div className="h-full flex flex-col bg-card relative">
                            {/* Editor Toolbar */}
                            <div className="h-12 flex items-center justify-between px-4 bg-muted/30 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-muted-foreground font-medium">Java Solution</span>
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
                                        <><Send className="w-4 h-4 mr-2" /> Run</>
                                    )}
                                </Button>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1 overflow-hidden border-b border-border">
                                <Editor
                                    height="100%"
                                    defaultLanguage="java"
                                    value={code}
                                    theme="vs"
                                    onChange={(value) => setCode(value || "")}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: "on",
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        readOnly: false,
                                        automaticLayout: true,
                                        backgroundColor: 'transparent',
                                    }}
                                />
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="h-1.5 bg-border hover:bg-primary transition-colors cursor-row-resize" />

                    {/* Bottom: Output / Console */}
                    <Panel defaultSize="40" minSize="10">
                         <div className="h-full bg-card flex flex-col">
                            <div className="px-4 py-2 border-b border-border bg-muted/30">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Console / Output</h3>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 bg-background/50">
                                {!result && (
                                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                                        Run code to see output here
                                    </div>
                                )}
                                
                                {result && (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            {result.status === 'success' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            <span className={`font-medium ${result.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                                {result.message}
                                            </span>
                                        </div>
                                        
                                        {(result.output || result.expectedOutput) && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Your Output</span>
                                                    <div className={`p-3 rounded-md font-mono text-sm border ${
                                                        result.status === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-700' : 'bg-red-500/5 border-red-500/20 text-red-700'
                                                    }`}>
                                                        {result.output || "No output"}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Expected Output</span>
                                                    <div className="p-3 rounded-md font-mono text-sm bg-muted/30 border border-border text-foreground">
                                                        {result.expectedOutput || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                         </div>
                    </Panel>
                </PanelGroup>
             </Panel>
        </PanelGroup>
    </div>
  );
}
