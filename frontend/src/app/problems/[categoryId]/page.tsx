"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import api from "@/services/api";
import { Topic } from "@/types";

export default function TopicSelectionProblemsPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setCategoryId(p.categoryId));
  }, [params]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchTopics = async () => {
      try {
        const res = await api.get(`/topics/category/${categoryId}`);
        setTopics(res.data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 max-w-4xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-4 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Select a Topic</h1>
        <p className="text-zinc-400">Choose a topic to practice problems</p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-300">No topics found</h3>
            <p className="text-zinc-500 mt-2">There are no topics available for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/problems/${categoryId}/${topic.id}`}>
                <Card className="h-full hover:bg-zinc-800/80 hover:border-blue-500/50 transition-all cursor-pointer group">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">
                            {topic.name}
                        </CardTitle>
                        {topic.description && (
                            <CardDescription className="mt-1">
                                {topic.description}
                            </CardDescription>
                        )}
                    </div>
                    <ChevronRight className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
