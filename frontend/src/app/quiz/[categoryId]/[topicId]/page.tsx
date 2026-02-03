"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import api from "@/services/api";
import { QuizQuestion } from "@/types";
import confetti from "canvas-confetti";

export default function TopicQuizPage({ params }: { params: Promise<{ categoryId: string, topicId: string }> }) {
  const router = useRouter();
  const [topicId, setTopicId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  
  useEffect(() => {
    params.then(p => {
        setTopicId(p.topicId);
        setCategoryId(p.categoryId);
    });
  }, [params]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/quiz/questions/topic/${topicId}`);
        // Map backend response
        const formattedQuestions = res.data.map((q: any) => {
           let correctText = q.correctAnswer;
           if (q.correctAnswer === "Option A") correctText = q.optionA;
           else if (q.correctAnswer === "Option B") correctText = q.optionB;
           else if (q.correctAnswer === "Option C") correctText = q.optionC;
           else if (q.correctAnswer === "Option D") correctText = q.optionD;
           
           return {
              id: q.id,
              questionText: q.question,
              options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
              correctAnswer: correctText,
              difficulty: q.difficulty,
              category: q.category
           };
        });
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [topicId]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(s => s + 10); // 10 points per question
      if (currentQuestionIndex === questions.length - 1) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
      }
    }
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setSubmitting(true);
    try {
      await api.post(`/user/progress?score=${score}&problemSolved=false`);
      setShowResult(true);
    } catch (error) {
      console.error("Failed to submit score:", error);
      setShowResult(true); 
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">No questions found for this topic.</h2>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="container mx-auto max-w-2xl p-4 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full"
        >
          <Card className="glass-card backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-yellow-500/10 p-4 rounded-full mb-4">
                <Trophy size={48} className="text-yellow-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Quiz Completed!</CardTitle>
              <CardDescription className="text-muted-foreground">You scored {score} points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold text-foreground">{questions.length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((score / (questions.length * 10)) * 100)}%
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                <RefreshCw size={16} /> Retry
              </Button>
              <Button onClick={() => router.push(`/quiz/${categoryId}`)} className="gap-2">
                Back to Topics <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto max-w-3xl p-4 pt-24 py-8">
      <div className="mb-8 flex justify-between items-center text-muted-foreground">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 bg-transparent shadow-none">
            <h2 className="text-2xl font-bold mb-6 leading-relaxed text-foreground">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                let buttonStyle = "bg-card border-border hover:bg-muted"; 
                
                if (isAnswered) {
                  if (isSelected && isCorrect) buttonStyle = "bg-green-500/20 border-green-500 text-green-700";
                  else if (isSelected && !isCorrect) buttonStyle = "bg-red-500/20 border-red-500 text-red-700";
                  else if (isCorrect) buttonStyle = "bg-green-500/20 border-green-500 text-green-700";
                  else buttonStyle = "bg-card border-border opacity-50";
                } else if (isSelected) {
                  buttonStyle = "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20";
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${buttonStyle}`}
                  >
                    <span className="text-base font-medium">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="text-green-500" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" />}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        {!isAnswered ? (
          <Button 
            onClick={checkAnswer} 
            disabled={!selectedOption}
            size="lg"
            className="w-full sm:w-auto"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={nextQuestion} 
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            <ChevronRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
