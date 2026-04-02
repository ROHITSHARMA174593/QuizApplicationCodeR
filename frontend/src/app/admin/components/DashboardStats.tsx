import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Activity, FileText } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeQuizzes: number;
  totalProblems: number;
}

interface DashboardStatsProps {
  stats: AdminStats | null;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
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
  );
}
