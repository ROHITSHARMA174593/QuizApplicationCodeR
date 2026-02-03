"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Code2, LayoutDashboard, LogOut, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for token on mount and when interactions happen
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    setIsLoggedIn(!!token);
    setIsAdmin(role === 'ADMIN');
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail"); // If we stored it
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/register") {
    return null; // Don't show navbar on auth pages
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav h-16"
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative">
          {/* Logo Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <Code2 size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
            Code<span className="text-gradient">R</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-500/50">
                        <ShieldCheck size={16} />
                        <span className="hidden sm:inline">Admin</span>
                    </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border mx-1" />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut size={18} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="shadow-blue-500/20">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
