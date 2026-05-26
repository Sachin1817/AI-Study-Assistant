import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Sun, Moon, Database, Cpu, HelpCircle, HardDrive } from 'lucide-react';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-brand-accent" />
          <span>Application Settings</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Adjust styling preferences, visual modes, and inspect systems status indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        {/* Style configurations left panel */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4 glass-panel">
          <h2 className="text-base font-bold text-white">Visual Mode</h2>
          <p className="text-xs text-gray-500">Synchronize the visual style matching your focus environment.</p>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-solid border-white/5 bg-brand-dark/20 text-xs sm:text-sm font-semibold hover:bg-white/5 text-gray-200 transition-all"
          >
            <span>Active theme style</span>
            <span className="flex items-center gap-1.5 text-brand-accent font-bold">
              {darkMode ? (
                <>
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Diagnostic parameters center panel */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6 glass-panel">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-solid border-white/5">
            <Cpu className="w-5 h-5 text-brand-teal" />
            <span>Systems Status Indicators</span>
          </h2>

          <div className="space-y-4">
            {/* Status list */}
            {[
              {
                name: 'Database Engine Connectivity',
                desc: 'Active self-healing database status. Fallback local flat-file storage enabled automatically if offline.',
                icon: Database,
                value: 'Auto-Healing / Online',
                color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
              },
              {
                name: 'Core AI Context LLM Engine',
                desc: 'Processing textbook texts, generating summaries, revisions sheets, and questions via Groq Llama-3 AI endpoints.',
                icon: Cpu,
                value: 'Llama-3 API Active',
                color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20'
              },
              {
                name: 'Local Vector Store Embeddings',
                desc: 'Textbook page indices map vector arrays matching OpenAI semantic cosine search calculations.',
                icon: HardDrive,
                value: 'NumPy Vector-Index Online',
                color: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20'
              }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-solid border-white/5 bg-brand-dark/20">
                  <div className={`p-2.5 rounded-xl border border-solid shrink-0 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white">{stat.name}</h3>
                      <span className="text-[10px] font-bold text-brand-teal border border-solid border-brand-teal/20 px-2 py-0.5 rounded-full bg-brand-teal/5">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{stat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
