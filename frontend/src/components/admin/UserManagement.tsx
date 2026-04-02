import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9 h-10 bg-background/50 border-input" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <table className="w-full text-sm text-left">
            <thead className="text-muted-foreground bg-muted/50 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    #{user.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {user.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        user.role === "ADMIN"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          : "bg-secondary text-muted-foreground border-border"
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
  );
}
