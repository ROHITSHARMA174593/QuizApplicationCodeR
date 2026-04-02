"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Activity,
  FileText,
  BookOpen,
  Code,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import api from "@/services/api";

// Sub-components
import DashboardStats from "@/components/admin/DashboardStats";
import UserManagement from "@/components/admin/UserManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import TopicManagement from "@/components/admin/TopicManagement";
import QuizManagement from "@/components/admin/QuizManagement";
import ProblemManagement from "@/components/admin/ProblemManagement";

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
  const [categories, setCategories] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "quiz" | "categories" | "problems" | "topics">("users");
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data);
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
      const catsRes = await api.get("/quiz/categories");
      setCategories(catsRes.data);
    } catch (error: any) {
      console.error("Admin access denied or failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!token || role !== "ADMIN") {
      // router.push('/dashboard');
    }

    fetchAdminData();
  }, [router]);

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
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and system content</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={activeTab === "users" ? "primary" : "outline"}
            onClick={() => setActiveTab("users")}
            className="shrink-0"
          >
            <Users size={18} className="mr-2" /> Users
          </Button>
          <Button
            variant={activeTab === "categories" ? "primary" : "outline"}
            onClick={() => setActiveTab("categories")}
            className="shrink-0"
          >
            <FileText size={18} className="mr-2" /> Categories
          </Button>
          <Button
            variant={activeTab === "topics" ? "primary" : "outline"}
            onClick={() => setActiveTab("topics")}
            className="shrink-0"
          >
            <BookOpen size={18} className="mr-2" /> Topics
          </Button>
          <Button
            variant={activeTab === "quiz" ? "primary" : "outline"}
            onClick={() => setActiveTab("quiz")}
            className="shrink-0"
          >
            <Activity size={18} className="mr-2" /> Quizzes
          </Button>
          <Button
            variant={activeTab === "problems" ? "primary" : "outline"}
            onClick={() => setActiveTab("problems")}
            className="shrink-0"
          >
            <Code size={18} className="mr-2" /> Problems
          </Button>
        </div>
      </div>

      <DashboardStats stats={stats} />

      {activeTab === "users" && <UserManagement users={users} />}
      {activeTab === "categories" && (
        <CategoryManagement categories={categories} onRefresh={fetchAdminData} />
      )}
      {activeTab === "topics" && <TopicManagement categories={categories} />}
      {activeTab === "quiz" && <QuizManagement categories={categories} />}
      {activeTab === "problems" && <ProblemManagement categories={categories} stats={stats} />}
    </div>
  );
}
