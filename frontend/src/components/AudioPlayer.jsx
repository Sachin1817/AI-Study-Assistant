import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function AudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);

  // Sync state whenever audio URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  // Sync play states
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleScrub = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!audioUrl) return null;
  const fullAudioPath = `http://localhost:8000${audioUrl}`;

  return (
    <div className="w-full p-4 rounded-2xl bg-brand-deep/80 border border-solid border-white/10 glass-panel flex flex-col gap-3 animate-fade-in shadow-xl relative overflow-hidden">
      {/* Background synth indicator glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/10 rounded-full blur-xl animate-pulse-glow" />

      {/* Hidden audio loader */}
      <audio
        ref={audioRef}
        src={fullAudioPath}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-teal uppercase tracking-wider">Voice explanation</p>
          <p className="text-sm font-semibold text-white mt-0.5">Read AI Study Insights Aloud</p>
        </div>
        
        {/* Direct Download tool */}
        <a
          href={fullAudioPath}
          download={`StudyAI_Explainer_${Date.now()}.mp3`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-solid border-white/5 transition-all"
          title="Download Explainer MP3"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>

      {/* Scrub bar timeline */}
      <div className="space-y-1.5">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleScrub}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-semibold text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Volume Scrubber */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-2">
          {/* Main trigger */}
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-brand-accent hover:bg-brand-accentHover text-white transition-all shadow-md hover:scale-105"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-full text-gray-400 hover:text-white transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-teal"
          />
        </div>
      </div>
    </div>
  );
}
