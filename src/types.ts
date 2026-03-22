export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  note?: string;
  videoUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: Topic[];
}

export interface PYQ {
  id: string;
  subject: string;
  year: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Formula {
  id: string;
  title: string;
  latex: string;
  description?: string;
}

export interface FormulaCategory {
  id: string;
  subject: string;
  category: string;
  formulas: Formula[];
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
