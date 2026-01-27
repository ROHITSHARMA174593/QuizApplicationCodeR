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
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <Code2 size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">
            Code<span className="text-gradient">R</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-purple-500/30 text-purple-300 hover:text-purple-200 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all">
                        <ShieldCheck size={16} />
                        <span className="hidden sm:inline">Admin</span>
                    </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-zinc-100">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-zinc-800 mx-1" />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400/80 hover:text-red-400 hover:bg-red-950/20 gap-2">
                <LogOut size={18} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">Login</Button>
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
