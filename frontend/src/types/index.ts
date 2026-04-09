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

export interface Topic {
  id: number;
  name: string;
  description: string;
  categoryId: number;
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
  difficulty: "Easy" | "Medium" | "Hard";
  category: SkillCategory;
  topic?: Topic;
  testCases: TestCase[];
  methodName?: string;
  returnType?: string;
  parameters?: string; // JSON string
  visibleInput?: string;
  visibleOutput?: string;
  solved?: boolean;
  categoryName?: string;
}
