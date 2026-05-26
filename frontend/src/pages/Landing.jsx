import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, BrainCircuit, Mic, FileText, CheckCircle, Zap, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      title: "PDF Text Extraction & OCR",
      desc: "Upload textbooks, research articles, or scanned notes. Our robust OCR engine parses the data instantly.",
      icon: FileUpIcon
    },
    {
      title: "AI Summarizer",
      desc: "Generate concise key points, extensive summaries, and quick-revision exam flashcards in seconds.",
      icon: FileText
    },
    {
      title: "Smart Quiz Generator",
      desc: "Automatically compile MCQs, True/False, or Short Answer challenges. Practice, score, and excel.",
      icon: BrainCircuit
    },
    {
      title: "Semantic RAG Chatbot",
      desc: "Chat directly with your documents. Ask questions, extract answers, and clarify doubts with context-aware responses.",
      icon: MessageSquareIcon
    },
    {
      title: "Voice Explanations",
      desc: "Synthesize study summaries into audio. Listen on the go, change settings, and download explaining files.",
      icon: Mic
    },
    {
      title: "Smart Revision Notes",
      desc: "Create comprehensive mathematical formula sheets, revision outlines, and important diagnostic questions.",
      icon: StickyNoteIcon
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen">
      {/* Premium background radial gradient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-accent/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-teal/5 blur-[150px] animate-pulse-glow" />

      {/* Main Hero Banner Segment */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-solid border-white/10 text-xs font-semibold text-brand-accent animate-fade-in shadow-md">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span>Supercharging Academic Efficiency with AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white max-w-4xl mx-auto">
          The Ultimate <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-[#a78bfa] to-brand-teal">AI Study Suite</span> for Smart Students
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Upload your notes and textbooks, and let our advanced AI extract formulas, build quizzes, read summaries aloud, and answer your complex questions instantly.
        </p>

        {/* Action Call buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group text-sm"
          >
            <span>{user ? "Go to Dashboard" : "Start Studying for Free"}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-solid border-white/10 text-gray-300 font-semibold hover:bg-white/5 hover:text-white transition-all text-sm"
          >
            Watch Demo Setup
          </Link>
        </div>

        {/* Simple Interactive Landing Stats Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto pt-12 border-t border-solid border-white/5 animate-fade-in">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">99%</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Accuracy Ratio</p>
          </div>
          <div className="border-x border-solid border-white/5">
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-accent">10x</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Faster Summaries</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-teal">24/7</p>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Chat Support</p>
          </div>
        </div>
      </div>

      {/* Feature Showcases Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Comprehensive Core Capabilities</h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Our study suite consolidates modern educational modules into a unified dashboard, eliminating fragmentations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-brand-deep/60 border border-solid border-white/5 hover:border-white/15 transition-all duration-300 glow-card flex flex-col gap-4 group"
              >
                <div className="p-3 rounded-xl bg-brand-accent/10 text-brand-accent w-fit group-hover:bg-brand-accent/20 transition-all border border-solid border-brand-accent/5">
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-brand-accent transition-colors">{feat.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-fidelity security / trust strip */}
      <section className="max-w-4xl mx-auto px-4 py-12 border-t border-solid border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/5 border border-solid border-white/5 text-gray-400">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-teal shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Security & Privacy Compliant</p>
              <p className="text-xs text-gray-500 mt-0.5">Your uploads and chat logs are fully secure, hashed, and private.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <CheckCircle className="w-4 h-4 text-brand-success" />
            <span>GDPR Ready</span>
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mx-1" />
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Fast Processing</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// Temporary internal icons for layout consistency
const FileUpIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const MessageSquareIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const StickyNoteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
