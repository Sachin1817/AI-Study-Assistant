import React from 'react';

// Modular Pulser block
const PulseLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-white/10 rounded-lg animate-pulse ${className}`} />
);

export const CardSkeleton = () => {
  return (
    <div className="w-full p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4">
      <PulseLine className="h-6 w-1/3 bg-brand-accent/20" />
      <div className="space-y-2">
        <PulseLine />
        <PulseLine className="w-5/6" />
        <PulseLine className="w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <PulseLine className="h-9 w-24" />
        <PulseLine className="h-9 w-20" />
      </div>
    </div>
  );
};

export const NotesSkeleton = () => {
  return (
    <div className="w-full p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6">
      <div className="space-y-3">
        <PulseLine className="h-7 w-1/4 bg-brand-teal/20" />
        <PulseLine className="h-4 w-1/2" />
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <PulseLine className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <PulseLine />
            <PulseLine className="w-11/12" />
          </div>
        </div>
        
        <div className="flex gap-3 items-start">
          <PulseLine className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <PulseLine />
            <PulseLine className="w-5/6" />
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <PulseLine className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <PulseLine />
            <PulseLine className="w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <PulseLine className="h-4 w-1/2" />
            <PulseLine className="h-8 w-8 rounded-full" />
          </div>
          <PulseLine className="h-8 w-1/3 bg-brand-accent/20" />
        </div>
      ))}
    </div>
  );
};

export const QuizSkeleton = () => {
  return (
    <div className="w-full p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6">
      <div className="space-y-2">
        <PulseLine className="h-4 w-20 bg-brand-teal/20" />
        <PulseLine className="h-6 w-3/4" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="flex items-center gap-3 p-3 rounded-xl border border-solid border-white/5">
            <PulseLine className="h-5 w-5 rounded-full shrink-0" />
            <PulseLine className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <PulseLine className="h-10 w-28" />
        <PulseLine className="h-4 w-16" />
      </div>
    </div>
  );
};
