/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sun,
  Moon,
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Lightbulb, 
  RotateCcw,
  Play,
  Dumbbell,
  LogOut,
  History,
  User as UserIcon,
  Menu,
  X,
  MessageSquare,
  Send,
  Sparkles,
  Flame,
  Trophy,
  Calendar,
  Zap,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeExerciseVideo, type ExerciseAnalysis } from './services/geminiService';
import { streamChatPlan, type ChatMessage } from './services/chatService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GoogleGenAI } from "@google/genai";

import { db } from './lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function LoginPage() {
  const { signInWithGoogle, error: authError } = useAuth();
  const { isDark } = useTheme();
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,#f1f5f9_0%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)] transition-colors duration-300">
      <div className="absolute top-6 right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center shadow-xl shadow-blue-500/20 mb-2">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-none">
            FormCheck <span className="text-blue-600 font-mono">AI</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Precision biomechanics and performance diagnostics for the elite athlete.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}

          <button 
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 bg-white dark:bg-slate-900 shadow-sm"
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
              className="w-5 h-5" 
              alt="Google" 
              referrerPolicy="no-referrer"
            />
            Continue with Google
          </button>
          
          <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            Tactical Access Node 
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-relaxed">
            By accessing this node, you agree to our standard athletic performance processing protocols and terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('leaderboardScore', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setLeaders(snap.docs.map(doc => doc.data()));
      } catch (err) {
        console.error("Leaderboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Activity className="w-10 h-10 text-blue-600 animate-spin" />
      <div className="text-[10px] font-black uppercase text-slate-400 tracking-[3px]">Indexing Elite Personnel</div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h2 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tightest uppercase leading-none">Global Elite</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[4px]">Verified Command Hierarchy</p>
      </motion.div>

      <div className="professional-card divide-y border-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-2xl">
        {leaders.map((leader, index) => (
          <motion.div 
            key={leader.uid || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-all ${index < 3 ? 'bg-blue-600/[0.02] dark:bg-blue-400/[0.02]' : ''}`}
          >
            <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                index === 0 ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-400/40 scale-110' : 
                index === 1 ? 'bg-slate-300 text-white shadow-lg' : 
                index === 2 ? 'bg-amber-600 text-white shadow-lg' : 
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative">
                  <img src={leader.photoURL || `https://picsum.photos/seed/${leader.uid}/100/100`} className="w-14 h-14 md:w-16 md:h-16 rounded-3xl border-2 border-white dark:border-slate-800 shadow-xl object-cover" alt="" referrerPolicy="no-referrer" />
                  {index === 0 && <Trophy className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />}
                </div>
                <div>
                  <div className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{leader.displayName}</div>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    <Zap className="w-2 h-2 text-blue-500" /> Tier {Math.floor((leader.leaderboardScore || 0) / 500) + 1} Operator
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-10 md:gap-16 lg:gap-24 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</div>
                <div className="flex items-center gap-1 font-black text-orange-500">
                  <Flame className="w-4 h-4 fill-orange-500" /> 
                  <span className="text-lg">{leader.currentStreak}</span>
                </div>
              </div>
              
              <div className="hidden sm:block text-center">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Variety</div>
                <div className="text-lg font-black text-blue-600">
                  {leader.uniqueExercises?.length || 0}
                </div>
              </div>

              <div className="text-right min-w-[100px]">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Command Score</div>
                <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                  {(leader.leaderboardScore || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

function MainApp() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  
  // View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'analyze' | 'chat' | 'history' | 'leaderboard'>('dashboard');
  
  // User Data State
  const [userData, setUserData] = useState<{
    currentStreak: number;
    totalCheckIns: number;
    lastCheckInDate: string | null;
    totalReps: number;
    uniqueExercises: string[];
    leaderboardScore: number;
  }>({
    currentStreak: 0,
    totalCheckIns: 0,
    lastCheckInDate: null,
    totalReps: 0,
    uniqueExercises: [],
    leaderboardScore: 0
  });

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ExerciseAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<(ExerciseAnalysis & { id: string })[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  });

  // Sync user profile
  useEffect(() => {
    const syncUserProfile = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Initial creation
            const initialData = {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              uid: user.uid,
              currentStreak: 0,
              totalCheckIns: 0,
              lastCheckInDate: null,
              totalReps: 0,
              uniqueExercises: [],
              leaderboardScore: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, initialData);
            setUserData({
              currentStreak: 0,
              totalCheckIns: 0,
              lastCheckInDate: null,
              totalReps: 0,
              uniqueExercises: [],
              leaderboardScore: 0
            });
          } else {
            const data = userSnap.data();
            // Update existing
            await updateDoc(userRef, {
              displayName: user.displayName,
              photoURL: user.photoURL,
              updatedAt: serverTimestamp()
            });
            setUserData({
              currentStreak: data.currentStreak || 0,
              totalCheckIns: data.totalCheckIns || 0,
              lastCheckInDate: data.lastCheckInDate || null,
              totalReps: data.totalReps || 0,
              uniqueExercises: data.uniqueExercises || [],
              leaderboardScore: data.leaderboardScore || 0
            });
          }
        } catch (err) {
          console.error("Data integrity sync failed:", err);
        }
        
        fetchHistory();
      }
    };

    syncUserProfile();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'analyses'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (ExerciseAnalysis & { id: string })[];
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file || !user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeExerciseVideo(file);
      setAnalysis(result);

      // Save to Firestore
      await addDoc(collection(db, 'users', user.uid, 'analyses'), {
        ...result,
        createdAt: serverTimestamp()
      });

      // Update User Aggregates & Leaderboard Score
      const userRef = doc(db, 'users', user.uid);
      const repsMatch = result.count.match(/\d+/);
      const newReps = repsMatch ? parseInt(repsMatch[0]) : 0;
      
      const isNewExercise = !userData.uniqueExercises.includes(result.exerciseName);
      const updatedExercises = isNewExercise 
        ? [...userData.uniqueExercises, result.exerciseName]
        : userData.uniqueExercises;
      
      const updatedReps = userData.totalReps + newReps;
      
      // Score = (Streak * 60) + (UniqueExercises * 10) + (TotalReps * 20)
      const newScore = (userData.currentStreak * 60) + (updatedExercises.length * 10) + (updatedReps * 20);

      await updateDoc(userRef, {
        totalReps: updatedReps,
        uniqueExercises: updatedExercises,
        leaderboardScore: newScore,
        updatedAt: serverTimestamp()
      });

      setUserData(prev => ({
        ...prev,
        totalReps: updatedReps,
        uniqueExercises: updatedExercises,
        leaderboardScore: newScore
      }));

      fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again with a shorter or clearer video.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setVideoUrl(null);
    setAnalysis(null);
    setError(null);
    setCurrentView('dashboard');
  };

  const handleCheckIn = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    if (userData.lastCheckInDate === today) return;

    const userRef = doc(db, 'users', user.uid);
    let newStreak = userData.currentStreak;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (userData.lastCheckInDate === yesterdayStr) {
      newStreak += 1;
    } else if (!userData.lastCheckInDate || userData.lastCheckInDate < yesterdayStr) {
      newStreak = 1;
    }

    const newScore = (newStreak * 60) + (userData.uniqueExercises.length * 10) + (userData.totalReps * 20);

    try {
      await updateDoc(userRef, {
        currentStreak: newStreak,
        lastCheckInDate: today,
        totalCheckIns: userData.totalCheckIns + 1,
        leaderboardScore: newScore,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'users', user.uid, 'checkins'), {
        date: today,
        completed: true,
        createdAt: serverTimestamp()
      });

      setUserData(prev => ({
        ...prev,
        currentStreak: newStreak,
        lastCheckInDate: today,
        totalCheckIns: prev.totalCheckIns + 1,
        leaderboardScore: newScore
      }));
    } catch (err) {
      console.error("Check-in failed", err);
      setError("Failed to record check-in.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const updatedHistory = [...chatMessages, userMessage];
      let assistantMessage = '';
      
      const stream = streamChatPlan(updatedHistory);
      
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        assistantMessage += chunk;
        setChatMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: assistantMessage };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setError('Chat failed. Please check your connection.');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Header Navigation */}
      <nav className="h-20 border-b border-slate-200 dark:border-slate-800 glass flex items-center justify-between px-6 md:px-10 shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-90"
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span 
            onClick={() => setCurrentView('dashboard')}
            className="font-display font-black text-lg md:text-xl tracking-tight uppercase text-slate-800 dark:text-slate-100 truncate cursor-pointer"
          >
            FormCheck <span className="text-blue-600">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Command
            </button>
            <button 
              onClick={() => { setCurrentView('analyze'); setFile(null); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'analyze' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Diagnostics
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'chat' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Strategy
            </button>
            <button 
              onClick={() => setCurrentView('leaderboard')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'leaderboard' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Elite
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800">
            <Flame className={`w-4 h-4 ${userData.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-400'}`} />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tighter">{userData.currentStreak}</span>
          </div>

          <ThemeToggle />

          <button 
            onClick={() => setCurrentView('chat')}
            className={`p-2 rounded-lg transition-all ${currentView === 'chat' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            title="Training Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setCurrentView('history')}
            className={`p-2 rounded-lg transition-all ${currentView === 'history' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            title="History"
          >
            <History className="w-5 h-5" />
          </button>

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>

          <div className="flex items-center gap-2 pl-1 md:pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-100 leading-none truncate max-w-[100px]">{user?.displayName}</div>
              <div className="text-[8px] font-bold uppercase text-slate-400">Auth-01</div>
            </div>
            {user?.photoURL ? (
              <img src={user.photoURL} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" alt="User" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <UserIcon className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <button 
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className={`flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 ${currentView !== 'dashboard' ? 'lg:grid lg:grid-cols-12 lg:gap-6' : ''} overflow-x-hidden overflow-y-auto`}>
        <AnimatePresence mode="wait">
          {currentView === 'leaderboard' ? (
            <motion.section
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full lg:col-span-12"
            >
              <Leaderboard />
            </motion.section>
          ) : currentView === 'dashboard' ? (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-6xl mx-auto space-y-8 py-4"
            >
              {/* Hero / Welcome Section */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-8 pb-4">
                <div className="space-y-6 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-[2px]">
                    <Zap className="w-3 h-3" /> System Synchronized
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-slate-800 dark:text-slate-100 tracking-tightest leading-[0.85]">
                    PERFORMANCE <br />
                    <span className="text-blue-600 uppercase">OS v4.0</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                    Elite musculoskeletal analysis and strategic training protocols for the dedicated athlete.
                  </p>
                </div>
                
                <div className="w-full lg:w-auto">
                  <div className={`p-8 md:p-10 professional-card border-none ring-1 ${userData.lastCheckInDate === new Date().toISOString().split('T')[0] ? 'ring-green-500/50 bg-green-50/10' : 'ring-blue-600/50 bg-blue-50/10'} flex flex-col items-center gap-8 shadow-2xl backdrop-blur-md`}>
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Athletic Streak</div>
                      <div className="flex items-center gap-4 justify-center">
                        <motion.div
                          animate={userData.currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Flame className={`w-12 h-12 ${userData.currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                        </motion.div>
                        <span className="text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{userData.currentStreak}</span>
                      </div>
                    </div>
                    {userData.lastCheckInDate !== new Date().toISOString().split('T')[0] ? (
                      <button 
                        onClick={handleCheckIn}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" /> CHECK-IN TODAY
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-3 py-5 px-10 bg-green-500 rounded-2xl text-white font-black text-sm uppercase tracking-widest">
                        <CheckCircle2 className="w-6 h-6" /> SESSION LOGGED
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="professional-card p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sessions</div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white">{userData.totalCheckIns}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" /> Lifetime progression track
                  </div>
                </div>

                <div className="professional-card p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Analyses</div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white">{history.length}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">Diagnostic history data stored</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => { setCurrentView('analyze'); setFile(null); }}
                  className="professional-card p-8 group cursor-pointer hover:border-blue-500 transition-all shadow-xl hover:shadow-blue-500/5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Diagnostic Scan</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upload training video for musculoskeletal analysis and rep verification.</p>
                </div>

                <div 
                  onClick={() => setCurrentView('chat')}
                  className="professional-card p-8 group cursor-pointer hover:border-blue-500 transition-all shadow-xl hover:shadow-blue-500/5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white dark:text-slate-900" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Strategic Command</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Generate 12-month transformation protocols and precision diet guides.</p>
                </div>
              </div>

              {/* Feed Preview */}
              <div className="professional-card divide-y border-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Feed Overview</div>
                  <button onClick={() => setCurrentView('history')} className="text-[10px] font-black text-blue-600 hover:underline uppercase">View Full History</button>
                </div>
                {history.slice(0, 3).map((item) => (
                   <div key={item.id} onClick={() => { setAnalysis(item); setFile(new File([], 'history')); setCurrentView('analyze'); }} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${item.isCorrect ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <div>
                          <div className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">{item.exerciseName}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date((item as any).createdAt?.seconds * 1000).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-900 dark:text-slate-100">{item.count}</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase">Volume</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                   </div>
                ))}
              </div>
            </motion.section>
          ) : currentView === 'analyze' && !file ? (
            <motion.section
              key="uploader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto px-4 lg:col-span-12"
            >
              <div 
                {...getRootProps()} 
                className={`
                  relative border-4 border-dashed rounded-2xl p-8 md:p-20
                  flex flex-col items-center justify-center gap-6 md:gap-8
                  transition-all duration-300 min-h-[300px] md:min-h-[400px] bg-white dark:bg-slate-900 shadow-sm
                  ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
                `}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                  <Upload className={`w-6 h-6 md:w-8 md:h-8 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                
                <div className="text-center space-y-3">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Drop performance data</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mx-auto font-medium">
                    Analyze biomechanics, rep counts, and movement efficiency instantly with computer vision.
                  </p>
                </div>

                <input {...getInputProps()} />
                
                <button className="md:hidden bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">
                  Choose Video
                </button>
              </div>
            </motion.section>
          ) : (
            <>
              {/* Left Column: Content Area (Col 1-7) */}
              <motion.section 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${currentView === 'chat' ? 'lg:col-span-4' : 'lg:col-span-7'} flex flex-col gap-6 max-h-full`}
              >
                {currentView === 'chat' ? (
                  <div className="professional-card h-full flex-1 min-h-[400px] max-h-[80vh] flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Performance AI</h2>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">Strategic Planning Mode</p>
                        </div>
                      </div>
                      <button onClick={() => setCurrentView('dashboard')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-50">
                          <Sparkles className="w-10 h-10 text-blue-500 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 max-w-[200px]">
                            Ready to architect your 12-month transformation or weekly diet.
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white font-medium rounded-tr-none' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                            }`}>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Command: Generate 12-month hypertrophy plan..."
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-12 transition-all placeholder:text-slate-400"
                        />
                        <button 
                          disabled={isChatLoading}
                          className="absolute right-2 p-2 text-blue-600 disabled:text-slate-300 transition-colors"
                        >
                          {isChatLoading ? <div className="w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : currentView === 'history' ? (
                  <div className="flex flex-col gap-4 lg:col-span-12 max-w-4xl mx-auto w-full">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Analysis History</h2>
                      <button onClick={() => setCurrentView('dashboard')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Back to dashboard</button>
                    </div>
                    
                    <div className="grid gap-4 pb-8">
                      {history.length > 0 ? history.map((item) => (
                        <div key={item.id} className="professional-card p-4 md:p-5 group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {new Date((item as any).createdAt?.seconds * 1000).toLocaleDateString()}
                              </div>
                              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-sm md:text-base">{item.exerciseName}</h3>
                            </div>
                            <div className={`px-2 py-1 rounded text-[9px] md:text-[10px] font-black ${item.isCorrect ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'}`}>
                              {item.isCorrect ? 'PASS' : 'FAIL'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Volume</div>
                              <div className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100">{item.count}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Efficiency</div>
                              <div className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100">{item.score}%</div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 gap-4">
                          <History className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No previous diagnostic data</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800 aspect-video w-full max-h-[600px] shrink-0">
                      <video 
                        ref={videoRef}
                        src={videoUrl || undefined} 
                        className="w-full h-full object-contain"
                        controls={!isAnalyzing}
                        autoPlay
                        muted
                        loop
                      />
                      
                      <AnimatePresence>
                        {isAnalyzing && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
                          >
                            <div className="relative">
                              <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full border-t-blue-500 animate-spin" />
                              <Activity className="absolute inset-0 m-auto w-6 h-6 text-blue-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold tracking-[3px] uppercase text-white mb-1">Scanning Skeletal Mesh</p>
                              <p className="text-[10px] uppercase font-bold text-blue-400 animate-pulse tracking-widest">Vision Engine: AI-v3.0</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isAnalyzing && (
                        <div className="absolute bottom-0 w-full h-12 bg-slate-900/80 backdrop-blur-md flex items-center px-6 gap-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                          <div className="text-[10px] text-white font-black uppercase tracking-[2px]">
                            Biometric Stream
                          </div>
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            ></motion.div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                      <div className="flex flex-col text-center sm:text-left w-full sm:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Stream</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-full sm:max-w-xs md:max-w-md">{file?.name}</span>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-end">
                        {!analysis && !isAnalyzing && (
                          <button 
                            onClick={handleStartAnalysis}
                            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
                          >
                            Execute Analysis
                          </button>
                        )}
                        <button 
                          onClick={handleReset}
                          className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                          title="Reset"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-tight">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
              </motion.section>

              {/* Right Column: Results Area (Col 8-12) */}
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${currentView === 'chat' ? 'lg:col-span-8' : 'lg:col-span-5'} flex flex-col gap-6`}
              >
                {!analysis && !isAnalyzing ? (
                  <div className="professional-card flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 gap-6 bg-white/50 dark:bg-slate-900/50 border-dashed border-2">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Calibration Phase</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-2">Initialize diagnostic protocols to view performance data</p>
                    </div>
                  </div>
                ) : analysis ? (
                  <>
                    {/* Identification Metric */}
                    <div className="professional-card p-6 flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Diagnostic Class</span>
                          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-none">
                            {analysis.exerciseName}
                          </h1>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">
                          {analysis.score > 90 ? 'OPTIMIZED' : 'UNSTABLE'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rep Count</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{analysis.count.split(' ')[0]}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{analysis.count.split(' ')[1] || 'REPS'}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stability Rate</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{analysis.score}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Status Card */}
                    <div className="professional-card flex flex-col border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-lg mb-4">
                      <div className={`${analysis.isCorrect ? 'bg-green-50/80 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'} px-6 py-4 border-b flex items-center justify-between`}>
                        <span className="text-[10px] font-black uppercase tracking-[2px]">Form Intelligence</span>
                        <span className="flex items-center gap-2 text-[10px] font-black">
                          <div className={`w-2.5 h-2.5 rounded-full ${analysis.isCorrect ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                          {analysis.isCorrect ? 'OPTIMAL' : 'TECHNIQUE ALERT'}
                        </span>
                      </div>
                      
                      <div className="p-6 flex flex-col gap-6 md:gap-8">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Diagnostic Summary</div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{analysis.feedback}"
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Optimization Protocol</div>
                          <div className="space-y-4">
                            {analysis.tips.map((tip, i) => (
                              <div key={i} className="flex gap-4 group">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-black text-slate-500 dark:text-slate-400 text-[10px] border border-slate-200 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  0{i+1}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-snug pt-1">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pro Correction */}
                        {!analysis.isCorrect && analysis.correctFormExplanation && (
                          <div className="mt-4">
                            <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl text-white shadow-xl border border-slate-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-3 h-3 text-blue-400" />
                                <div className="text-[9px] font-black uppercase tracking-[3px] text-slate-500">Corrective Guide</div>
                              </div>
                              <p className="text-xs leading-relaxed font-medium text-slate-300 italic">
                                "{analysis.correctFormExplanation}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="professional-card flex-1 flex flex-col items-center justify-center p-12 gap-4">
                     <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 animate-spin rounded-full"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Processing Stream...</span>
                  </div>
                )}
              </motion.section>
            </>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-10 md:h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 text-slate-400 dark:text-slate-500 font-mono text-[8px] md:text-[9px] uppercase tracking-widest shrink-0">
        <div className="flex gap-2 md:gap-4 truncate">
          <span>Vision Node: 2049-A</span>
          <span className="hidden sm:inline text-slate-200 dark:text-slate-800">|</span>
          <span className="hidden sm:inline">Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span className="hidden xs:inline">ENC_AES_256</span> SECURED
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Uplink...</span>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginPage />;
}


