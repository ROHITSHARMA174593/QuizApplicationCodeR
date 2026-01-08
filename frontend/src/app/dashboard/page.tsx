"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Brain, 
  Code, 
  Terminal, 
  Database, 
  Cpu, 
  Globe,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/services/api";
import { UserProgress, SkillCategory } from "@/types";

// Icons mapping for categories
const iconMap: Record<string, any> = {
  "HTML": Globe,
  "CSS": Globe,
  "JavaScript": Code,
  "Java": Code,
  "Python": Terminal,
  "DSA": Brain,
  "Database": Database,
  "React": Code,
  "Spring Boot": Cpu
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    
    if (!token) {
      router.push("/login");
      return;
    }
    
    if (email) setUserEmail(email);

    const fetchData = async () => {
      try {
        // Fetch User Progress
        const progressRes = await api.get("/user/dashboard");
        setProgress(progressRes.data);

        // Fetch Categories
        const categoriesRes = await api.get("/quiz/categories");
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optional: show toast or error state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto p-6 pt-24 max-w-7xl space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-blue-500 capitalize">{userEmail.split('@')[0]}</span>
          </h1>
          <p className="text-zinc-400 mt-1">Ready to solve some problems today?</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card className="border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-100">{progress?.totalScore || 0}</div>
              <p className="text-xs text-blue-300 mt-1">Experience Points</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Quizzes Attempted</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-100">{progress?.quizzesAttempted || 0}</div>
              <p className="text-xs text-purple-300 mt-1">Tests completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Problems Solved</CardTitle>
              <Code className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-100">{progress?.problemsSolved || 0}</div>
              <p className="text-xs text-emerald-300 mt-1">Challenges conquered</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Skill Paths
        </h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No categories available yet. Please check back later!
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const Icon = iconMap[category.name] || Code;
              return (
                <motion.div key={category.id} variants={item}>
                  <Card className="h-full hover:border-zinc-600 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                      <Icon size={100} />
                    </div>
                    
                    <CardHeader>
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-2 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                        <Icon size={20} />
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        Master {category.name} through quizzes and problems
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="grid grid-cols-2 gap-3">
                      <Link href={`/quiz/${category.id}`} className="w-full">
                        <Button variant="outline" className="w-full text-xs hover:bg-purple-900/30 hover:text-purple-300 hover:border-purple-500/50">
                          Quiz
                        </Button>
                      </Link>
                      <Link href={`/problems/${category.id}`} className="w-full">
                        <Button variant="outline" className="w-full text-xs hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/50">
                          Problems
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
