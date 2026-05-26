import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Core UI Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Page Views
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PDFUpload from './pages/PDFUpload';
import Summarizer from './pages/Summarizer';
import QuizGenerator from './pages/QuizGenerator';
import Chatbot from './pages/Chatbot';
import NotesGenerator from './pages/NotesGenerator';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Security Route Protector
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent border-solid" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-gray-100 selection:bg-brand-accent selection:text-white transition-colors duration-300">
      {/* Premium Floating Header */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex relative">
        {/* Sticky side menu panel */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content viewport container (fills full desktop width next to sidebar) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Guarded Secure Workspace routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><PDFUpload /></PrivateRoute>} />
            <Route path="/summarizer" element={<PrivateRoute><Summarizer /></PrivateRoute>} />
            <Route path="/quiz" element={<PrivateRoute><QuizGenerator /></PrivateRoute>} />
            <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
            <Route path="/notes" element={<PrivateRoute><NotesGenerator /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

            {/* Error 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
