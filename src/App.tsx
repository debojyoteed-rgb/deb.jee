import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Zap, 
  Beaker, 
  Calculator, 
  CheckCircle2, 
  Circle, 
  MessageSquare, 
  BookOpen, 
  History, 
  Send, 
  Loader2,
  ChevronRight,
  Menu,
  X,
  FileText,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Share2,
  Smartphone,
  Download,
  Trophy,
  HelpCircle,
  Play
} from 'lucide-react';
import { JEE_SYLLABUS, PYQS, FORMULAS, QUIZZES } from './constants';
import { Subject, Message, PYQ, Topic, FormulaCategory, QuizQuestion } from './types';
import { solveDoubt, generateChapterNote } from './services/geminiService';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import { evaluate } from 'mathjs';

import { QRCodeSVG } from 'qrcode.react';

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="url(#logo-grad)" />
    <path d="M30 35H70M30 50H60M30 65H70" stroke="white" strokeWidth="8" strokeLinecap="round" />
    <path d="M75 25L85 35L75 45" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'doubts' | 'pyqs' | 'notes' | 'report' | 'formulas' | 'calculator' | 'timer' | 'quizzes'>('syllabus');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(JEE_SYLLABUS);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(JEE_SYLLABUS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [doubtHistory, setDoubtHistory] = useState<{question: string, answer: string, subject: string, timestamp: number}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Link Copied to Clipboard!');
  
  // Formula sheet state
  const [formulaSearch, setFormulaSearch] = useState('');
  const [selectedFormulaSubject, setSelectedFormulaSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  
  // Quiz state
  const [quizSubject, setQuizSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'All'>('All');
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [quizStep, setQuizStep] = useState<'selection' | 'active' | 'summary'>('selection');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const startQuiz = () => {
    const filtered = quizSubject === 'All' 
      ? [...QUIZZES].sort(() => Math.random() - 0.5)
      : QUIZZES.filter(q => q.subject === quizSubject).sort(() => Math.random() - 0.5);
    
    setCurrentQuiz(filtered.slice(0, 5)); // 5 questions per quiz
    setQuizStep('active');
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(Math.min(filtered.length, 5)).fill(null));
    setShowFeedback(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (userAnswers[currentQuestionIndex] !== null) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      setQuizStep('summary');
    }
  };

  const resetQuiz = () => {
    setQuizStep('selection');
    setCurrentQuiz([]);
    setUserAnswers([]);
  };

  // Calculator state
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');
  const [calcHistory, setCalcHistory] = useState<{ expr: string, res: string }[]>([]);
  const [isDegreeMode, setIsDegreeMode] = useState(false);

  // Timer state
  const [timerMode, setTimerMode] = useState<'study' | 'short' | 'long'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      // Optional: Add notification sound or alert here
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  
  const resetTimer = () => {
    setIsTimerActive(false);
    if (timerMode === 'study') setTimeLeft(25 * 60);
    else if (timerMode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const switchTimerMode = (mode: 'study' | 'short' | 'long') => {
    setTimerMode(mode);
    setIsTimerActive(false);
    if (mode === 'study') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCalcAction = (val: string) => {
    if (val === '=') {
      if (!calcInput) return;
      try {
        let expr = calcInput;
        
        // Custom scope for degree mode
        const scope = isDegreeMode ? {
          sin: (x: number) => evaluate(`sin(${x} deg)`),
          cos: (x: number) => evaluate(`cos(${x} deg)`),
          tan: (x: number) => evaluate(`tan(${x} deg)`),
          asin: (x: number) => evaluate(`asin(${x}) to deg`),
          acos: (x: number) => evaluate(`acos(${x}) to deg`),
          atan: (x: number) => evaluate(`atan(${x}) to deg`),
        } : {};

        const res = evaluate(expr, scope).toString();
        setCalcResult(res);
        setCalcHistory(prev => [{ expr: calcInput, res }, ...prev].slice(0, 5));
      } catch (e) {
        setCalcResult('Error');
      }
    } else if (val === 'AC') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
    } else {
      setCalcInput(prev => prev + val);
    }
  };
  
  // Notes state
  const [selectedTopicForNote, setSelectedTopicForNote] = useState<Topic | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [notesCache, setNotesCache] = useState<Record<string, string>>({});
  const [isHandwritingMode, setIsHandwritingMode] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ejee-doubt-history');
    if (savedHistory) {
      try {
        setDoubtHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse doubt history");
      }
    }

    const saved = localStorage.getItem('jee-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved progress with current syllabus structure
        const merged = JEE_SYLLABUS.map(s => {
          const savedSubject = parsed.find((ps: any) => ps.id === s.id);
          if (savedSubject) {
            return {
              ...s,
              topics: s.topics.map(t => {
                const savedTopic = savedSubject.topics.find((pt: any) => pt.id === t.id);
                return savedTopic ? { ...t, completed: savedTopic.completed } : t;
              })
            };
          }
          return s;
        });
        setSubjects(merged);
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  // Save progress to localStorage
  const toggleTopic = (subjectId: string, topicId: string) => {
    const newSubjects = subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: s.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
        };
      }
      return s;
    });
    setSubjects(newSubjects);
    localStorage.setItem('jee-progress', JSON.stringify(newSubjects));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await solveDoubt(input, selectedSubject.name);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setDoubtHistory(prev => {
      const newHistory = [{ question: input, answer: response, subject: selectedSubject.name, timestamp: Date.now() }, ...prev].slice(0, 20);
      localStorage.setItem('ejee-doubt-history', JSON.stringify(newHistory));
      return newHistory;
    });
    setIsLoading(false);
  };

  const handleViewNote = async (topic: Topic) => {
    setSelectedTopicForNote(topic);
    setActiveTab('notes');
    
    if (notesCache[topic.id]) return;

    setIsNoteLoading(true);
    const note = await generateChapterNote(topic.title, selectedSubject.name);
    setNotesCache(prev => ({ ...prev, [topic.id]: note }));
    setIsNoteLoading(false);
  };

  const calculateProgress = (subject: Subject) => {
    const completed = subject.topics.filter(t => t.completed).length;
    return Math.round((completed / subject.topics.length) * 100);
  };

  const reportData = useMemo(() => {
    const data = subjects.map(s => ({
      name: s.name,
      completed: s.topics.filter(t => t.completed).length,
      total: s.topics.length,
      percentage: calculateProgress(s),
      color: s.id === 'physics' ? '#2563eb' : s.id === 'chemistry' ? '#059669' : '#ea580c'
    }));

    const totalCompleted = data.reduce((acc, d) => acc + d.completed, 0);
    const totalTopics = data.reduce((acc, d) => acc + d.total, 0);
    const overallPercentage = Math.round((totalCompleted / totalTopics) * 100);

    return {
      subjectWise: data,
      overall: overallPercentage,
      totalCompleted,
      totalTopics,
      pieData: [
        { name: 'Completed', value: totalCompleted, color: '#6366f1' },
        { name: 'Remaining', value: totalTopics - totalCompleted, color: '#e2e8f0' }
      ]
    };
  }, [subjects]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Beaker': return <Beaker className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <h1 className="font-bold text-lg">EJEE: JEE COMPANION</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <Logo className="w-10 h-10 shadow-lg shadow-indigo-200" />
            <h1 className="font-bold text-xl tracking-tight">EJEE: JEE COMPANION</h1>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          <button 
            onClick={() => { setActiveTab('syllabus'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'syllabus' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-5 h-5" />
            Syllabus Tracker
          </button>
          <button 
            onClick={() => { setActiveTab('notes'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText className="w-5 h-5" />
            Study Notes
          </button>
          <button 
            onClick={() => { setActiveTab('report'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'report' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BarChart3 className="w-5 h-5" />
            Progress Report
          </button>
          <button 
            onClick={() => { setActiveTab('doubts'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'doubts' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-5 h-5" />
            AI Doubt Solver
          </button>
          <button 
            onClick={() => { setActiveTab('pyqs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pyqs' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History className="w-5 h-5" />
            Previous Year Qs
          </button>
          <button 
            onClick={() => { setActiveTab('formulas'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'formulas' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calculator className="w-5 h-5" />
            Formula Sheet
          </button>
          <button 
            onClick={() => { setActiveTab('calculator'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calculator' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calculator className="w-5 h-5" />
            Scientific Calc
          </button>
          <button 
            onClick={() => { setActiveTab('timer'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'timer' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Clock className="w-5 h-5" />
            Study Timer
          </button>
          <button 
            onClick={() => { setActiveTab('quizzes'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'quizzes' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Trophy className="w-5 h-5" />
            Practice Quizzes
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50"
          >
            <Share2 className="w-5 h-5" />
            Share App
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
          <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Free & Unlimited</span>
            </div>
            <div className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-tighter">∞</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Overall Progress</p>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${reportData.overall}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Toast Notification */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Progress?</h3>
              <p className="text-slate-500 mb-8">This will permanently clear all your study progress and notes. This action cannot be undone.</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setSubjects(JEE_SYLLABUS);
                    localStorage.removeItem('jee-progress');
                    setShowResetConfirm(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideoUrl && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] overflow-hidden max-w-4xl w-full shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Educational Video</h3>
                    <p className="text-xs text-slate-500">Learn this topic with expert guidance</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVideoUrl(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={selectedVideoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="p-6 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Powered by YouTube Educational Content</span>
                </div>
                <button 
                  onClick={() => setSelectedVideoUrl(null)}
                  className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
                >
                  Close Player
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Logo className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Open on Mobile</h3>
                <p className="text-slate-500">Scan this QR code to continue your JEE preparation on your phone.</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl flex justify-center mb-8 border border-slate-100">
                <QRCodeSVG 
                  value="https://ais-pre-gz3rtq4u2iarxa54m4fl3v-753738567707.asia-southeast1.run.app" 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://picsum.photos/seed/ejee/128/128",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("https://ais-pre-gz3rtq4u2iarxa54m4fl3v-753738567707.asia-southeast1.run.app");
                    setToastMessage('Link Copied to Clipboard!');
                    setShowCopiedToast(true);
                    setTimeout(() => setShowCopiedToast(false), 2000);
                  }}
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Copy App Link
                </button>
                <button 
                  onClick={() => {
                    const embedCode = `<a href="https://ais-pre-gz3rtq4u2iarxa54m4fl3v-753738567707.asia-southeast1.run.app" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-family: sans-serif; font-weight: bold;">Open EJEE: JEE Companion</a>`;
                    navigator.clipboard.writeText(embedCode);
                    setToastMessage('HTML Embed Code Copied!');
                    setShowCopiedToast(true);
                    setTimeout(() => setShowCopiedToast(false), 2000);
                  }}
                  className="w-full py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Copy HTML Embed Code
                </button>
                <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    <span className="font-bold">Pro Tip:</span> Tap "Add to Home Screen" in your browser menu to install this as an app!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'syllabus' && (
            <motion.div 
              key="syllabus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Syllabus Tracker</h2>
                <p className="text-slate-500">Track your preparation progress across all subjects.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`p-6 rounded-3xl border-2 transition-all text-left ${selectedSubject.id === subject.id ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-transparent bg-white hover:border-slate-200 shadow-sm'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${subject.color} bg-opacity-10 bg-current`}>
                      {getIcon(subject.icon)}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{calculateProgress(subject)}% Complete</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedSubject.id === subject.id ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-xl">{selectedSubject.name} Topics</h3>
                  <span className="text-sm font-medium text-slate-500">{selectedSubject.topics.length} Total</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {selectedSubject.topics.map(topic => (
                    <div
                      key={topic.id}
                      className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <button onClick={() => toggleTopic(selectedSubject.id, topic.id)}>
                        {topic.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />
                        )}
                      </button>
                      <span className={`flex-1 font-medium ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {topic.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {topic.videoUrl && (
                          <button 
                            onClick={() => setSelectedVideoUrl(topic.videoUrl!)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Watch Video"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewNote(topic)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Notes"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Progress Report</h2>
                  <p className="text-slate-500">A detailed breakdown of your preparation journey.</p>
                </div>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  Reset All Progress
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Overall Completion</p>
                  <h3 className="text-3xl font-bold">{reportData.overall}%</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Topics Mastered</p>
                  <h3 className="text-3xl font-bold">{reportData.totalCompleted}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Topics Remaining</p>
                  <h3 className="text-3xl font-bold">{reportData.totalTopics - reportData.totalCompleted}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Current Rank</p>
                  <h3 className="text-3xl font-bold">A+</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-xl mb-6">Subject Performance</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.subjectWise}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                          {reportData.subjectWise.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="font-bold text-xl mb-6">Completion Mix</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {reportData.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex justify-center gap-8 mt-4">
                    {reportData.pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm font-medium text-slate-600">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Keep it up!</h3>
                  <p className="text-indigo-100 max-w-md mb-6">You've completed {reportData.overall}% of your syllabus. Consistent practice is the key to cracking JEE Mains.</p>
                  <button 
                    onClick={() => setActiveTab('syllabus')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                  >
                    Continue Studying
                  </button>
                </div>
                <Sparkles className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/10 rotate-12" />
              </div>
            </motion.div>
          )}

          {activeTab === 'quizzes' && (
            <motion.div 
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Practice Quizzes</h2>
                <p className="text-slate-500">Test your knowledge with chapter-wise multiple choice questions.</p>
              </div>

              {quizStep === 'selection' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-indigo-100/20">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                      <Trophy className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Start a New Quiz</h3>
                    <p className="text-slate-500 mb-8">Select a subject to get a randomized set of 5 questions from various topics.</p>
                    
                    <div className="space-y-3 mb-8">
                      {['All', 'Physics', 'Chemistry', 'Mathematics'].map(s => (
                        <button
                          key={s}
                          onClick={() => setQuizSubject(s as any)}
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between font-bold ${quizSubject === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                        >
                          {s}
                          {quizSubject === s && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={startQuiz}
                      className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                    >
                      <Zap className="w-6 h-6" />
                      Begin Quiz
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-emerald-600 rounded-[40px] p-10 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold mb-2">Why Practice?</h4>
                        <p className="text-emerald-100 text-sm leading-relaxed opacity-90">Regular testing helps identify weak areas and improves speed and accuracy for the actual JEE exam.</p>
                      </div>
                      <Award className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 -rotate-12" />
                    </div>
                    
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white">
                      <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-400" />
                        Quiz Tips
                      </h4>
                      <ul className="space-y-4">
                        {[
                          'Read every option carefully before selecting.',
                          'Use the explanation to learn from mistakes.',
                          'Try to solve without using a calculator first.',
                          'Review your summary at the end.'
                        ].map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-400">
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">{i+1}</div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {quizStep === 'active' && currentQuiz.length > 0 && (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={resetQuiz} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Question {currentQuestionIndex + 1} of {currentQuiz.length}</span>
                        <h3 className="font-bold text-slate-900">{currentQuiz[currentQuestionIndex].subject} • {currentQuiz[currentQuestionIndex].topic}</h3>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-100 rounded-xl font-mono font-bold text-slate-600">
                      {Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100)}%
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl mb-8">
                    <p className="text-xl font-medium text-slate-800 mb-10 leading-relaxed">
                      {currentQuiz[currentQuestionIndex].question}
                    </p>

                    <div className="space-y-4">
                      {currentQuiz[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = userAnswers[currentQuestionIndex] === idx;
                        const isCorrect = currentQuiz[currentQuestionIndex].correctAnswer === idx;
                        
                        let buttonClass = "w-full p-6 rounded-3xl border-2 text-left font-bold transition-all flex items-center justify-between ";
                        if (showFeedback) {
                          if (isCorrect) buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                          else if (isSelected) buttonClass += "border-red-500 bg-red-50 text-red-700";
                          else buttonClass += "border-slate-50 text-slate-300";
                        } else {
                          buttonClass += isSelected ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-50";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={showFeedback}
                            className={buttonClass}
                          >
                            <span className="flex items-center gap-4">
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              {option}
                            </span>
                            {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                            {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <HelpCircle className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold uppercase tracking-widest text-xs text-indigo-400">Explanation</h4>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{currentQuiz[currentQuestionIndex].explanation}</p>
                        </div>

                        <button
                          onClick={nextQuestion}
                          className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                        >
                          {currentQuestionIndex === currentQuiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {quizStep === 'summary' && (
                <div className="max-w-2xl mx-auto text-center">
                  <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl shadow-indigo-100/50 mb-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Trophy className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-2">Quiz Complete!</h3>
                    <p className="text-slate-500 mb-12">Here's how you performed in this session.</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Score</p>
                        <p className="text-5xl font-black text-slate-900">
                          {userAnswers.filter((ans, idx) => ans === currentQuiz[idx].correctAnswer).length}
                          <span className="text-2xl text-slate-300">/{currentQuiz.length}</span>
                        </p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                        <p className="text-5xl font-black text-indigo-600">
                          {Math.round((userAnswers.filter((ans, idx) => ans === currentQuiz[idx].correctAnswer).length / currentQuiz.length) * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={startQuiz}
                        className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                      >
                        Try Another Quiz
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="w-full py-5 rounded-3xl bg-slate-50 text-slate-600 font-bold text-lg hover:bg-slate-100 transition-all"
                      >
                        Back to Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div 
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Study Notes</h2>
                  <p className="text-slate-500">Expert revision notes for every chapter.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsHandwritingMode(!isHandwritingMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold text-sm ${isHandwritingMode ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Handwriting Mode
                  </button>
                  <button 
                    onClick={() => setActiveTab('syllabus')}
                    className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    Back to Syllabus
                  </button>
                </div>
              </div>

              {!selectedTopicForNote ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">No Chapter Selected</h3>
                  <p className="text-slate-500 mb-6">Select a chapter from the syllabus tracker to view its revision notes.</p>
                  <button 
                    onClick={() => setActiveTab('syllabus')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Go to Syllabus
                  </button>
                </div>
              ) : (
                <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden ${isHandwritingMode ? 'notebook-paper' : ''}`}>
                  <div className={`p-8 border-b border-slate-50 flex items-center justify-between ${isHandwritingMode ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-widest mb-1 block ${isHandwritingMode ? 'text-indigo-600/50' : 'text-indigo-600'}`}>Quick Revision Note</span>
                      <h3 className={`text-2xl font-bold ${isHandwritingMode ? 'handwritten' : ''}`}>{selectedTopicForNote.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-medium">AI Generated</span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {isNoteLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="font-medium">Generating expert notes from top institutes...</p>
                      </div>
                    ) : (
                      <div className={`max-w-none prose prose-slate ${isHandwritingMode ? 'handwritten' : 'prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:my-2'}`}>
                        <Markdown>{notesCache[selectedTopicForNote.id]}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'doubts' && (
            <motion.div 
              key="doubts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-6"
            >
              {/* History Sidebar */}
              <div className="hidden lg:flex w-80 flex-col gap-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-slate-800">
                      <History className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold">Recent Doubts</h3>
                    </div>
                    {doubtHistory.length > 0 && (
                      <button 
                        onClick={() => {
                          setDoubtHistory([]);
                          localStorage.removeItem('ejee-doubt-history');
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {doubtHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-xs text-slate-400">No history yet</p>
                      </div>
                    ) : (
                      doubtHistory.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setMessages([
                              { role: 'user', text: item.question },
                              { role: 'model', text: item.answer }
                            ]);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                        >
                          <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-widest">{item.subject}</p>
                          <p className="text-sm text-slate-700 font-medium line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.question}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">How can I help you today?</h3>
                      <p className="text-slate-500 max-w-xs">Ask a question about Physics, Chemistry, or Math to get started.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your question here..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2">Study Timer</h2>
                <p className="text-slate-500">Focus on your goals with the Pomodoro technique.</p>
              </div>

              <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-100/50">
                <div className="flex justify-center gap-4 mb-12">
                  {[
                    { id: 'study', label: 'Study', color: 'indigo' },
                    { id: 'short', label: 'Short Break', color: 'emerald' },
                    { id: 'long', label: 'Long Break', color: 'blue' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => switchTimerMode(m.id as any)}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                        timerMode === m.id 
                        ? `bg-${m.color}-600 text-white shadow-lg shadow-${m.color}-200` 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="text-[120px] font-black text-slate-900 leading-none mb-12 font-mono tracking-tighter">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-6">
                  <button
                    onClick={toggleTimer}
                    className={`w-48 py-5 rounded-3xl text-xl font-bold transition-all ${
                      isTimerActive 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200'
                    }`}
                  >
                    {isTimerActive ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="w-20 py-5 rounded-3xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center"
                  >
                    <History className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Study</p>
                  <p className="text-2xl font-bold text-indigo-700">25 min</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Short Break</p>
                  <p className="text-2xl font-bold text-emerald-700">5 min</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Long Break</p>
                  <p className="text-2xl font-bold text-blue-700">15 min</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'calculator' && (
            <motion.div 
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Scientific Calculator</h2>
                <p className="text-slate-500">Quick calculations for your JEE preparation.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 bg-slate-900 text-white">
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => setIsDegreeMode(!isDegreeMode)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isDegreeMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {isDegreeMode ? 'DEG' : 'RAD'}
                    </button>
                    <div className="text-right text-slate-400 text-sm font-mono overflow-hidden whitespace-nowrap">
                      {calcInput || '0'}
                    </div>
                  </div>
                  <div className="text-right text-3xl font-bold h-10 font-mono overflow-hidden whitespace-nowrap">
                    {calcResult || '0'}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-4 gap-3">
                  {/* Scientific Buttons */}
                  {[
                    { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' }, { label: 'log', val: 'log10(' },
                    { label: 'asin', val: 'asin(' }, { label: 'acos', val: 'acos(' }, { label: 'atan', val: 'atan(' }, { label: 'ln', val: 'log(' },
                    { label: 'sqrt', val: 'sqrt(' }, { label: '^', val: '^' }, { label: 'π', val: 'pi' }, { label: 'e', val: 'e' },
                    { label: 'abs', val: 'abs(' }, { label: 'exp', val: 'exp(' }, { label: '(', val: '(' }, { label: ')', val: ')' }
                  ].map(btn => (
                    <button 
                      key={btn.label} 
                      onClick={() => handleCalcAction(btn.val)} 
                      className="p-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-[10px] uppercase"
                    >
                      {btn.label}
                    </button>
                  ))}

                  {/* Standard Buttons */}
                  <button onClick={() => handleCalcAction('AC')} className="p-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors">AC</button>
                  <button onClick={() => handleCalcAction('DEL')} className="p-4 bg-orange-50 text-orange-600 font-bold rounded-2xl hover:bg-orange-100 transition-colors">DEL</button>
                  <button onClick={() => handleCalcAction('/')} className="p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">/</button>
                  <button onClick={() => handleCalcAction('*')} className="p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">*</button>

                  {[7, 8, 9].map(n => (
                    <button key={n} onClick={() => handleCalcAction(n.toString())} className="p-4 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors">{n}</button>
                  ))}
                  <button onClick={() => handleCalcAction('-')} className="p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">-</button>

                  {[4, 5, 6].map(n => (
                    <button key={n} onClick={() => handleCalcAction(n.toString())} className="p-4 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors">{n}</button>
                  ))}
                  <button onClick={() => handleCalcAction('+')} className="p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">+</button>

                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => handleCalcAction(n.toString())} className="p-4 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors">{n}</button>
                  ))}
                  <button onClick={() => handleCalcAction('=')} className="row-span-2 p-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">=</button>

                  <button onClick={() => handleCalcAction('0')} className="col-span-2 p-4 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors">0</button>
                  <button onClick={() => handleCalcAction('.')} className="p-4 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors">.</button>
                </div>

                {calcHistory.length > 0 && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recent History</p>
                    <div className="space-y-2">
                      {calcHistory.map((h, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono text-slate-500">
                          <span>{h.expr}</span>
                          <span className="font-bold text-slate-800">= {h.res}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'formulas' && (
            <motion.div 
              key="formulas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Formula Sheet</h2>
                  <p className="text-slate-500">Quick reference for all important JEE formulas.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={selectedFormulaSubject}
                    onChange={(e) => setSelectedFormulaSubject(e.target.value as any)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Search formulas..."
                    value={formulaSearch}
                    onChange={(e) => setFormulaSearch(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-12">
                {FORMULAS.filter(cat => 
                  (selectedFormulaSubject === 'All' || cat.subject === selectedFormulaSubject) &&
                  (cat.category.toLowerCase().includes(formulaSearch.toLowerCase()) || 
                   cat.formulas.some(f => f.title.toLowerCase().includes(formulaSearch.toLowerCase())))
                ).map(category => (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        category.subject === 'Physics' ? 'bg-blue-100 text-blue-600' :
                        category.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {category.subject}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{category.category}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.formulas.filter(f => 
                        f.title.toLowerCase().includes(formulaSearch.toLowerCase()) || 
                        category.category.toLowerCase().includes(formulaSearch.toLowerCase())
                      ).map(formula => (
                        <div key={formula.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-bold text-slate-700 mb-4">{formula.title}</h4>
                          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center mb-4 overflow-x-auto">
                            <BlockMath math={formula.latex} />
                          </div>
                          {formula.description && (
                            <p className="text-sm text-slate-500 leading-relaxed">{formula.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pyqs' && (
            <motion.div 
              key="pyqs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Previous Year Questions</h2>
                <p className="text-slate-500">Practice with actual questions from past JEE Mains exams.</p>
              </div>

              <div className="space-y-6">
                {PYQS.map((pyq) => (
                  <PYQCard key={pyq.id} pyq={pyq} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function PYQCard({ pyq }: { pyq: PYQ; key?: string }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">{pyq.subject}</span>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">JEE Main {pyq.year}</span>
      </div>
      
      <p className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">{pyq.question}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {pyq.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(index)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selectedOption === index 
                ? (index === pyq.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700')
                : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedOption !== null && (
        <div className="flex flex-col gap-4">
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${selectedOption === pyq.correctAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {selectedOption === pyq.correctAnswer ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Correct Answer!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span className="font-bold">Incorrect. The correct answer is {String.fromCharCode(65 + pyq.correctAnswer)}.</span>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"
          >
            {showExplanation ? 'Hide Explanation' : 'View Explanation'}
          </button>

          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-slate-50 rounded-2xl text-slate-600 text-sm leading-relaxed"
            >
              <p className="font-bold mb-2 text-slate-800">Explanation:</p>
              {pyq.explanation}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
