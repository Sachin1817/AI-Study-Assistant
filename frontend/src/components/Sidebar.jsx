import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, FileText, BrainCircuit, MessageSquare, StickyNote, User, Settings, X, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload PDFs', path: '/upload', icon: FileUp },
    { name: 'AI Summarizer', path: '/summarizer', icon: FileText },
    { name: 'Quiz Playground', path: '/quiz', icon: BrainCircuit },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Smart Notes', path: '/notes', icon: StickyNote },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!user && location.pathname !== '/') return null;

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      <aside
        className={`fixed lg:sticky top-[61px] lg:top-[65px] left-0 z-40 w-64 h-[calc(100vh-61px)] lg:h-[calc(100vh-65px)] bg-brand-deep/95 border-r border-solid border-white/5 transition-transform duration-300 transform lg:translate-x-0 glass-panel flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Sidebar Panel */}
        <div className="flex-1 py-5 px-3 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between lg:hidden mb-4 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Navigation Menu</span>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative border border-solid ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-accent/20 to-brand-teal/5 text-white border-brand-accent/30 shadow-md shadow-brand-accent/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.name}</span>
                  
                  {/* Subtle active slide bar */}
                  {location.pathname === item.path && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-brand-accent to-brand-teal rounded-r-md" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Small branding Footer section */}
        <div className="p-4 border-t border-solid border-white/5 bg-brand-dark/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
            <GraduationCap className="w-4 h-4 text-brand-teal" />
            <span>AI Academic Assistant</span>
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Version 1.0.0 • Production Ready</p>
        </div>
      </aside>
    </>
  );
}
