import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, BrainCircuit, MessageSquare, Flame, Sparkles, Plus, Clock, ChevronRight, CheckSquare } from 'lucide-react';
import { StatsSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stats and PDFs concurrently at component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { default: API } = await import('../services/api');
        const [statsRes, pdfsRes] = await Promise.all([
          API.get('/stats/'),
          API.get('/pdfs/'),
        ]);

        setStats(statsRes.data);
        setPdfs(pdfsRes.data);
      } catch (err) {
        console.error("Dashboard fetching failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = stats
    ? [
        {
          name: 'Study Material',
          value: stats.total_pdfs,
          desc: 'Uploaded PDF books',
          icon: FileText,
          color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20'
        },
        {
          name: 'Tests Completed',
          value: stats.quizzes_completed,
          desc: 'AI generated quizzes',
          icon: BrainCircuit,
          color: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20'
        },
        {
          name: 'Average Score',
          value: `${stats.average_score}%`,
          desc: 'Score on active attempts',
          icon: CheckSquare,
          color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
        },
        {
          name: 'Study Streak',
          value: `${stats.study_streak} Days`,
          desc: 'Consecutive study logs',
          icon: Flame,
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        }
      ]
    : [];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Dynamic Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-brand-accent" />
            <span>Study Dashboard</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your streak, review uploaded materials, and launch custom study guides.
          </p>
        </div>

        <Link
          to="/upload"
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:shadow-md transition-all flex items-center justify-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Material</span>
        </Link>
      </div>

      {/* 1. Statistics Cards Deck */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {statsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-deep/60 border border-solid border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">{card.name}</span>
                  <div className={`p-2 rounded-xl border border-solid ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{card.value}</h3>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Secondary grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Recent Uploaded Textbooks catalog */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-teal" />
              <span>Uploaded Textbooks</span>
            </h2>
            <Link to="/upload" className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {pdfs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/5 rounded-xl space-y-3 bg-brand-dark/20">
              <p className="text-sm text-gray-400">No study materials uploaded yet.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-brand-accent border border-solid border-brand-accent/20 hover:bg-white/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First PDF</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto pr-1">
              {pdfs.slice(0, 5).map((pdf) => (
                <div key={pdf.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-brand-teal/10 text-brand-teal border border-solid border-brand-teal/5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-sm">{pdf.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Uploaded {new Date(pdf.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/summarizer?pdf_id=${pdf.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Summarize
                    </Link>
                    <Link
                      to={`/chatbot?pdf_id=${pdf.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-accent/25 text-brand-accent border border-solid border-brand-accent/20 hover:bg-brand-accent/30 hover:text-white transition-all"
                    >
                      Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities feed log */}
        <div className="p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Recent Activity Feed</span>
            </h2>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-white/5 rounded-xl" />
                ))}
              </div>
            ) : !stats || stats.recent_activities?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No study sessions recorded yet.</p>
            ) : (
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {stats.recent_activities.map((act, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="mt-0.5">
                      {act.type === 'upload' && <Plus className="w-4 h-4 text-brand-teal" />}
                      {act.type === 'quiz' && <BrainCircuit className="w-4 h-4 text-brand-accent" />}
                      {act.type === 'quiz_attempt' && <CheckSquare className="w-4 h-4 text-brand-success" />}
                      {act.type === 'chat' && <MessageSquare className="w-4 h-4 text-amber-400" />}
                      {act.type === 'note' && <FileText className="w-4 h-4 text-violet-400" />}
                      {!['upload', 'quiz', 'quiz_attempt', 'chat', 'note'].includes(act.type) && (
                        <Sparkles className="w-4 h-4 text-brand-teal" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium leading-tight">{act.description}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(act.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-solid border-white/5 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Let's maintain this momentum!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
