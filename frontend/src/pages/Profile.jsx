import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save, Key, RefreshCw } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, showToast } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.username || 'study');
  const [submitting, setSubmitting] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Username cannot be empty.', 'error');
      return;
    }

    setSubmitting(true);
    // Generate Dicebear SVG link
    const newPic = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
    const result = await updateProfile(username, newPic);
    setSubmitting(false);
  };

  const rollAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarSeed(seed);
    showToast('New random profile avatar preview loaded!', 'info');
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <User className="w-8 h-8 text-brand-accent" />
          <span>My Profile Portal</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Customize your credentials details and toggle adventurer avatars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        {/* Left avatar segment card */}
        <div className="p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6 text-center glass-panel">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`}
              alt="Adventurer Avatar"
              className="w-full h-full rounded-full border-2 border-solid border-brand-accent p-1 object-cover bg-brand-deep shadow-lg"
            />
            <button
              onClick={rollAvatar}
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-brand-accent hover:bg-brand-accentHover text-white rounded-full transition-all border border-solid border-white/10 hover:rotate-180 duration-500 shadow-md"
              title="Roll custom seed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{user.username}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>

          <div className="pt-4 border-t border-solid border-white/5 text-left space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Account Status</span>
              <span className="font-semibold text-brand-success">Active Standard</span>
            </div>
            <div className="flex justify-between">
              <span>Registration ID</span>
              <span className="font-mono text-[10px] text-gray-500">{user.id.substring(0, 12)}...</span>
            </div>
          </div>
        </div>

        {/* Right profile forms configuration */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6 glass-panel">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-solid border-white/5">
            <Shield className="w-5 h-5 text-brand-teal" />
            <span>Profile Configuration</span>
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">User Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="User Name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-solid border-white/5 bg-brand-dark/20 text-sm text-gray-500 cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-solid border-white/5">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:scale-[1.01] transition-all flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
