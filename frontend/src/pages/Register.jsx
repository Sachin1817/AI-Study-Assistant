import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Mail, Lock, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register(username, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMsg('');
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 relative">
      {/* Background radial synth glow */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-brand-teal/5 blur-3xl animate-pulse-glow" />
      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-brand-deep/80 border border-solid border-white/10 glass-panel shadow-2xl relative z-10 space-y-6">
        
        {/* Header content */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-teal text-white shadow-lg w-fit mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-gray-400">Join StudyAI to analyze papers, generate tests, and listen to guides</p>
        </div>

        {/* Diagnostic errors banner */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-solid border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 animate-fade-in">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">User Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sachin18"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                disabled={submitting}
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Password</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-sm"
            disabled={submitting}
          >
            {submitting ? (
              <span className="animate-pulse">Creating Account...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
          onClick={handleGoogleRegister}
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


        {/* Footer switches links */}
        <p className="text-xs text-center text-gray-400 pt-2 border-t border-solid border-white/5">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-teal hover:underline">Log in to your account</Link>
        </p>
      </div>
    </div>
  );
}
