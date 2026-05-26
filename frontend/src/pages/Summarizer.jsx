import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileText, Play, Eye, Clipboard, HelpCircle, Check, Volume2, ArrowRight } from 'lucide-react';
import { NotesSkeleton } from '../components/LoadingSkeleton';
import AudioPlayer from '../components/AudioPlayer';
import { useAuth } from '../context/AuthContext';

export default function Summarizer() {
  const { showToast } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [activeTab, setActiveTab] = useState('concise'); // concise, bullets, flashcards
  const [summaryData, setSummaryData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync initial PDF list
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { default: API } = await import('../services/api');
        const response = await API.get('/pdfs/');
        setPdfs(response.data);
        
        // Auto-select PDF from search query if specified
        const queryId = searchParams.get('pdf_id');
        if (queryId) {
          setSelectedPdfId(queryId);
          fetchSummary(queryId, activeTab);
        } else if (response.data.length > 0) {
          setSelectedPdfId(response.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdfs();
  }, [searchParams]);

  const fetchSummary = async (pdfId, type) => {
    if (!pdfId) return;
    setLoading(true);
    setAudioPath(''); // reset speech tracks
    
    try {
      const { default: API } = await import('../services/api');
      const response = await API.post(`/summaries/generate`, {
        pdf_id: pdfId,
        summary_type: type
      });
      setSummaryData(response.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to compile summary. The file text might be empty.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedPdfId) {
      fetchSummary(selectedPdfId, tab);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const textToCopy = typeof summaryData.content === 'string' 
      ? summaryData.content 
      : JSON.stringify(summaryData.content, null, 2);
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copied study outline to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoiceExplain = async () => {
    if (!summaryData || !selectedPdfId) return;
    setVoiceLoading(true);
    try {
      const { default: API } = await import('../services/api');
      const response = await API.post(`/summaries/voice`, {
        pdf_id: selectedPdfId,
        summary_type: activeTab
      });
      setAudioPath(response.data.audio_url);
      showToast('Audio explanation synthesized successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to synthesize explanation voice file.', 'error');
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-8 h-8 text-brand-accent" />
          <span>AI Summarizer Suite</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Extract study points, compile high-yield summaries, and generate contextual audio guides instantly.
        </p>
      </div>

      {pdfLoading ? (
        <NotesSkeleton />
      ) : pdfs.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-brand-deep/20">
          <p className="text-sm text-gray-400">Please upload a document to proceed with AI summary generation.</p>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-1.5 text-sm w-fit mx-auto"
          >
            <span>Go to Upload Panel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
          {/* Controls & Voice Panel */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Focus Controls</h2>
              
              {/* Textbook Select Menu */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Textbook</label>
                <select
                  value={selectedPdfId}
                  onChange={(e) => {
                    setSelectedPdfId(e.target.value);
                    setSummaryData(null);
                    setAudioPath('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-solid border-white/10 bg-brand-deep text-sm text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer"
                >
                  <option value="">-- Choose Material --</option>
                  {pdfs.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Summary Type Controls */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Study Style</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'concise', name: 'Concise Summary', desc: 'Core outlines and high-level ideas' },
                    { id: 'bullets', name: 'Detailed Bullets', desc: 'Chapter-wise breakdowns & concepts' },
                    { id: 'flashcards', name: 'Exam Q&A Cards', desc: 'Key flash revision terms & facts' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleTabChange(style.id)}
                      className={`p-3 rounded-xl border border-solid text-left transition-all ${
                        activeTab === style.id
                          ? 'border-brand-accent bg-brand-accent/15 text-white shadow-md'
                          : 'border-white/5 bg-brand-dark/20 text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <p className="text-xs font-bold">{style.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run summary button */}
            {!summaryData && (
              <button
                onClick={() => fetchSummary(selectedPdfId, activeTab)}
                disabled={loading || !selectedPdfId}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <span>Compile Study Outline</span>
              </button>
            )}

            {/* Dynamic Voice Explainer triggers */}
            {summaryData && (
              <div className="pt-6 border-t border-solid border-white/5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Audio Explainer Tools</h3>
                
                {audioPath ? (
                  <AudioPlayer audioUrl={audioPath} />
                ) : (
                  <button
                    onClick={handleVoiceExplain}
                    disabled={voiceLoading}
                    className="w-full py-3 rounded-xl border border-solid border-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal font-semibold transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {voiceLoading ? (
                      <span className="animate-pulse">Synthesizing audio explanation...</span>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 animate-bounce" />
                        <span>Listen to Explainer Voice</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text Summary Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <NotesSkeleton />
            ) : summaryData ? (
              <div className="p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4 animate-fade-in relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-accent" />
                    <span>Study Material Breakdown</span>
                  </h2>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-solid border-white/10 transition-all flex items-center gap-1 text-xs font-medium"
                      title="Copy content"
                    >
                      {copied ? <Check className="w-4 h-4 text-brand-success" /> : <Clipboard className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Render compiled outline contents */}
                <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-brand-dark/20 p-4 rounded-xl border border-solid border-white/5 max-h-[500px] overflow-y-auto">
                  {typeof summaryData.content === 'string' ? (
                    summaryData.content
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(summaryData.content) ? (
                        summaryData.content.map((item, index) => (
                          <div key={index} className="p-3 bg-white/5 rounded-xl border border-solid border-white/5">
                            <p className="font-bold text-white text-xs">{item.question || item.title || `Flashcard #${index + 1}`}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.answer || item.desc || item}</p>
                          </div>
                        ))
                      ) : (
                        JSON.stringify(summaryData.content, null, 2)
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-gray-500 font-semibold text-right">
                  Generated via Groq Llama-3 AI Engine
                </div>
              </div>
            ) : (
              <div className="p-12 border border-solid border-white/5 rounded-2xl bg-brand-deep/20 text-center flex flex-col justify-center items-center gap-3">
                <HelpCircle className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-white">Awaiting Focus Configuration</p>
                  <p className="text-xs text-gray-400 mt-1">Select an active textbook in the side panel and hit compile to synthesize summary charts.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
