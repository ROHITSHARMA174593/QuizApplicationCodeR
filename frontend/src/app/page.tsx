"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Code2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="z-10 text-center space-y-6 max-w-2xl px-4">
        <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-8">
            <Code2 size={40} className="text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-500">
          Master the Art <br/> of Coding.
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Level up your skills with interactive quizzes and real-world coding challenges. Join thousands of developers on CodeR.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
              Start Coding <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
              I have an account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
