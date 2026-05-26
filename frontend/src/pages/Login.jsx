import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, LogIn, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Pre-login safety checks
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    if (searchParams.get('expired') === 'true') {
      setFeedback({ type: 'warning', text: 'Active study session expired. Please log in again.' });
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    
    if (!email || !password) {
      setFeedback({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFeedback({ type: 'error', text: result.error });
    }
  };

  const handleGoogleLogin = async () => {
    setFeedback({ type: '', text: '' });
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFeedback({ type: 'error', text: result.error });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 relative">
      {/* Background synth glows */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-brand-accent/5 blur-3xl animate-pulse-glow" />
      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-brand-deep/80 border border-solid border-white/10 glass-panel shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-teal text-white shadow-lg w-fit mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-gray-400">Log in to resume your study plans and chat with your files</p>
        </div>

        {/* Feedback warnings alerts */}
        {feedback.text && (
          <div className={`p-3.5 rounded-xl border border-solid flex items-start gap-2.5 text-xs animate-fade-in ${
            feedback.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
              <Link to="#" className="text-[11px] font-semibold text-brand-teal hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
            disabled={submitting}
          >
            {submitting ? (
              <span className="animate-pulse">Signing In...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider bar */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-solid border-white/5" />
          </div>
          <span className="relative px-3 bg-brand-deep text-[10px] font-bold uppercase tracking-wider text-gray-500 z-10">or</span>
        </div>

        {/* Google Popup Access button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl border border-solid border-white/10 hover:border-brand-accent/20 bg-brand-dark/20 text-gray-300 hover:text-white font-semibold transition-all flex items-center justify-center gap-2.5 text-xs hover:bg-brand-accent/5"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>


        {/* Switch portal footer */}
        <p className="text-xs text-center text-gray-400 pt-2 border-t border-solid border-white/5">
          New to StudyAI?{' '}
          <Link to="/register" className="font-semibold text-brand-teal hover:underline">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}
