"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import api from "@/services/api";
import { CodingProblem } from "@/types";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2, UploadCloud } from "lucide-react";
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
    expectedOutput?: string,
    input?: string,
    totalTestCases?: number,
    passedTestCases?: number
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

        let listNodeComment = "";
        if (res.data.type === "linkedlist") {
            listNodeComment = `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;      // You can also use 'data'
 *     int data;     // Alias for val
 *     ListNode next;
 ${res.data.subtype && res.data.subtype.includes("doubly") ? " *     ListNode prev;\n " : ""}*     ListNode(int x) { val = x; data = x; }
 * }
 */\n`;
        }

        const starterCode = `${listNodeComment}// Write your solution for: ${res.data.title}
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

  const handleRun = async () => {
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/problems/${problem.id}/run-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                problemId: problem.id,
                code: code,
                language: 'java'
            })
        });

        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.substring(5));
                        setResult({
                            status: data.success === false ? 'error' : 'success',
                            message: data.message || "Running...",
                            output: data.output,
                            expectedOutput: data.expectedOutput,
                            input: data.input,
                            totalTestCases: data.totalTestCases,
                            passedTestCases: data.passedTestCases
                        });
                    } catch (e) { console.error("Parse error", e); }
                }
            }
        }
    } catch (error) {
        setResult({
            status: 'error',
            message: 'Run failed: ' + error
        });
    } finally {
        setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
      if (!problem) return;
      setSubmitting(true);
      setResult(null);
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/problems/${problem.id}/submit-stream`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                  problemId: problem.id,
                  code: code,
                  language: 'java'
              }),
              mode: 'cors',
              signal
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server returned ${response.status}: ${errorText || 'Unknown Error'}`);
          }

          if (!response.body) throw new Error('No response body received');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                  if (line.startsWith('data:')) {
                      try {
                          const data = JSON.parse(line.substring(5));
                          
                          if (data.success === true && data.message === "Accepted") {
                               confetti({
                                  particleCount: 150,
                                  spread: 100,
                                  origin: { y: 0.6 },
                                  colors: ['#22c55e', '#3b82f6', '#eab308']
                               });
                          }

                          setResult({
                              status: data.success === false ? 'error' : 'success',
                              message: data.message || "Running...",
                              output: data.output,
                              expectedOutput: data.expectedOutput,
                              input: data.input,
                              totalTestCases: data.totalTestCases,
                              passedTestCases: data.passedTestCases
                          });
                      } catch (e) { console.error("Parse error", e); }
                  }
              }
          }
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
                        
                        {/* Visible Test Case */}
                        {problem.visibleInput && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Example Test Case</h3>
                                <div className="bg-muted/50 p-4 rounded-lg border border-border font-mono text-sm space-y-2">
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">Input</span>
                                        <pre className="bg-background p-2 rounded text-foreground border border-border overflow-x-auto whitespace-pre-wrap">{problem.visibleInput}</pre>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs mb-1">Target Output</span>
                                        <pre className="bg-background p-2 rounded text-foreground border border-border overflow-x-auto whitespace-pre-wrap">{problem.visibleOutput}</pre>
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
                        <div className="h-full flex flex-col bg-[#1e1e1e] relative">
                            {/* Editor Toolbar */}
                            <div className="h-12 flex items-center justify-between px-4 bg-muted/30 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-muted-foreground font-medium">Java Solution</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={handleRun} 
                                        disabled={submitting}
                                        className={`transition-all ${submitting ? 'opacity-70 cursor-wait' : 'hover:scale-105'}`}
                                    >
                                        <Send className="w-4 h-4 mr-2" /> Run
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        onClick={handleSubmit} 
                                        disabled={submitting}
                                        className={`transition-all bg-green-600 hover:bg-green-700 text-white ${submitting ? 'opacity-70 cursor-wait' : 'hover:scale-105'}`}
                                    >
                                        {submitting ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                        ) : (
                                            <><UploadCloud className="w-4 h-4 mr-2" /> Submit</>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1 overflow-hidden border-b border-border">
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
                                    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
                                        <div className="flex items-center gap-3">
                                            {submitting ? (
                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            ) : result.status === 'success' ? (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-6 h-6 text-red-500" />
                                            )}
                                            <span className={`text-xl font-bold tracking-tight ${
                                                submitting ? 'text-primary animate-pulse' : 
                                                result.status === 'success' ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                                {submitting 
                                                    ? (result.message || "Initializing...") 
                                                    : (result.status === 'success' ? "Accepted" : result.message)
                                                }
                                            </span>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        {result.totalTestCases !== undefined && (
                                            <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                        Test Cases Progress
                                                    </span>
                                                    <span className={`text-sm font-black tabular-nums ${result.status === 'success' ? 'text-green-500' : 'text-orange-500'}`}>
                                                        {result.passedTestCases} / {result.totalTestCases}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/20 shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-700 ease-out rounded-full ${
                                                            result.status === 'success' ? 'bg-linear-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 
                                                            'bg-linear-to-r from-orange-500 to-amber-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                                        }`}
                                                        style={{ width: `${(result.passedTestCases! / result.totalTestCases!) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Display */}
                                        {result.status === 'error' && !submitting && (
                                            <div className="p-5 border-2 border-red-500/20 bg-red-500/5 rounded-xl space-y-5 animate-in slide-in-from-top-2 duration-500">
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <AlertCircle className="w-5 h-5 font-bold" />
                                                    <h3 className="font-bold text-base">Oops! Your code failed for a specific input.</h3>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {result.input && (
                                                        <div className="space-y-2">
                                                            <span className="text-xs text-red-600/70 uppercase tracking-widest font-black">Failing Input:</span>
                                                            <div className="p-4 rounded-lg bg-background border border-red-500/10 font-mono text-base text-foreground shadow-sm overflow-x-auto">
                                                                {result.input}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <span className="text-xs text-red-600/70 uppercase tracking-widest font-black">Your Output:</span>
                                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 font-mono text-sm text-red-700 min-h-[44px]">
                                                                {result.output || "No output"}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-black">Expected Output:</span>
                                                            <div className="p-3 rounded-lg bg-muted/40 border border-border font-mono text-sm text-foreground min-h-[44px]">
                                                                {result.expectedOutput || "Hidden"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Success Display */}
                                        {result.status === 'success' && !submitting && result.message === "Accepted" && (
                                            <div className="p-5 border-2 border-green-500/20 bg-green-500/5 rounded-xl flex items-center gap-4 animate-in zoom-in-95 duration-500">
                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-green-700 text-lg line-height-none">Great job!</h3>
                                                    <p className="text-green-600/80 text-sm">All test cases passed successfully. You've solved this problem properly.</p>
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
