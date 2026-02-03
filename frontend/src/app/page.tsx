"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Code2, Terminal, Cpu, Zap } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Infinite Grid Animation */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        <motion.div 
            animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f61a,transparent)]" 
        />
      </div>

      {/* Floating Elements (Orbs) */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 text-center space-y-8 max-w-4xl px-4"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/10">
                    <Code2 size={48} className="text-white drop-shadow-md" />
                </div>
            </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter pb-2">
              Master the Art <br/> of <span className="text-gradient drop-shadow-sm">Coding.</span>
            </h1>
        </motion.div>
        
        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Level up your skills with interactive quizzes and real-world coding challenges. Join thousands of elite developers on CodeR.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl shadow-indigo-500/25 glow-primary group">
              Start Coding <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-16 px-10 rounded-2xl backdrop-blur-sm border-white/10 hover:bg-white/5">
              I have an account
            </Button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div variants={itemVariants} className="pt-12 flex flex-wrap justify-center gap-4 opacity-80">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Terminal size={16} className="text-indigo-400" />
                <span className="text-sm font-medium">Interactive Console</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Cpu size={16} className="text-pink-400" />
                <span className="text-sm font-medium">Real-time Compilation</span>
            </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-sm font-medium">Instant Feedback</span>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
