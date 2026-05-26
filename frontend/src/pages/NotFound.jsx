import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-scale-up">
      <div className="p-4 rounded-full bg-brand-accent/10 border border-solid border-brand-accent/20 text-brand-accent animate-bounce">
        <HelpCircle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          The requested study path does not exist. Let's redirect you back to your workspace.
        </p>
      </div>

      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 text-xs"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
