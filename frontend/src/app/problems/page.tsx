"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Code, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { CodingProblem } from "@/types";

export default function ProblemsPage({ params }: { params?: Promise<{ categoryId: string }> }) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
    
    useEffect(() => {
    if (params) {
        params.then(p => setCategoryId(p.categoryId));
    }
  }, [params]);

  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const url = categoryId ? `/problems/category/${categoryId}` : "/problems";
        const res = await api.get(url);
        setProblems(res.data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [categoryId]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"/></div>;

  return (
    <div className="container mx-auto p-6 pt-24 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Code className="text-blue-500" />
          {categoryId ? "Category Problems" : "All Coding Challenges"}
        </h1>
        <p className="text-zinc-400">Sharpen your skills with these coding problems.</p>
      </div>

      {problems.length === 0 ? (
         <Card className="border-zinc-800 bg-zinc-900/20 text-center py-12">
            <CardContent>
                <AlertCircle className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">No problems found</h3>
                <p className="text-zinc-500 mt-2">Check back later for new challenges!</p>
            </CardContent>
         </Card>
      ) : (
      <div className="grid gap-4">
        {problems.map((problem, idx) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                      {problem.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border
                      ${problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 text-sm max-w-2xl">
                    {problem.description}
                  </p>
                </div>
                
                <Button className="shrink-0" variant="outline">
                    Solve Challenge <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
