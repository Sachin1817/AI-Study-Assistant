import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sun, Moon, LogOut, User, Settings as SettingsIcon, Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, darkMode, toggleDarkMode, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-solid border-white/5 px-4 py-3 flex items-center justify-between text-gray-200">
      {/* Brand Logo & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-accent to-brand-teal text-white shadow-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Study<span className="text-brand-accent">AI</span>
          </span>
        </Link>
      </div>

      {/* Control Tools */}
      <div className="flex items-center gap-4">
        {/* Toggle Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-solid border-white/5 transition-all shadow-md"
          title="Toggle visual style"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
        </button>

        {user ? (
          <div className="relative">
            {/* User Dropdown Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 border border-solid border-white/5 transition-all"
            >
              <img
                src={user.profile_pic || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                alt="Profile thumbnail"
                className="w-8 h-8 rounded-full border border-solid border-brand-accent object-cover bg-brand-deep"
              />
              <span className="hidden sm:inline text-sm font-medium mr-1 text-gray-300 hover:text-white transition-all">
                {user.username}
              </span>
            </button>

            {/* Profile Interactive Dropdown */}
            {dropdownOpen && (
              <>
                <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10" />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-brand-deep border border-solid border-white/10 shadow-2xl p-1.5 z-20 animate-fade-in glass-panel">
                  <div className="px-3 py-2 border-b border-solid border-white/5 mb-1">
                    <p className="text-xs text-gray-400">Logged in as</p>
                    <p className="text-sm font-semibold truncate text-white">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-brand-accent/20 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-brand-accent/20 transition-all"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 transition-all">
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-gradient-to-r from-brand-accent to-brand-teal hover:shadow-brand-accent/20 hover:shadow-lg text-white px-4 py-1.5 rounded-full transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
