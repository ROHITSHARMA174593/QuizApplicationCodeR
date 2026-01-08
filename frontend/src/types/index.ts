export interface UserProgress {
  id: number;
  userEmail: string;
  quizzesAttempted: number;
  problemsSolved: number;
  totalScore: number;
}

export interface SkillCategory {
  id: number;
  name: string;
  description: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: SkillCategory;
}

export interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodingProblem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: SkillCategory;
  testCases?: TestCase[];
}
