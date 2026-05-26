import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StickyNote, Download, Clipboard, FileText, Sparkles, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { NotesSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export default function NotesGenerator() {
  const { showToast } = useAuth();
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [noteType, setNoteType] = useState('formulas'); // formulas, revision, questions
  const [notesData, setNotesData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Sync initial PDF list
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { default: API } = await import('../services/api');
        const response = await API.get('/pdfs/');
        setPdfs(response.data);
        if (response.data.length > 0) {
          setSelectedPdfId(response.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdfs();
  }, []);

  const handleGenerate = async () => {
    if (!selectedPdfId) {
      showToast('Please select a textbook first.', 'error');
      return;
    }

    setLoading(true);
    setNotesData(null);

    try {
      const { default: API } = await import('../services/api');
      const response = await API.post('/notes/generate', {
        pdf_id: selectedPdfId,
        include_formulas: true,
        include_exam_questions: true
      });
      
      let generatedContent = '';
      if (noteType === 'formulas') {
          generatedContent = response.data.formulas && response.data.formulas.length > 0 
              ? response.data.formulas.join('\n\n') 
              : 'No formulas found.';
      } else if (noteType === 'revision') {
          generatedContent = response.data.bullet_notes || 'No revision outlines found.';
      } else if (noteType === 'questions') {
          generatedContent = response.data.important_questions && response.data.important_questions.length > 0
              ? response.data.important_questions.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${q.answer}`).join('\n\n')
              : 'No questions found.';
      }

      setNotesData({ ...response.data, content: generatedContent });
      showToast('Revision sheet generated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to compile revision outlines. Material text might be limited.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notesData) return;
    navigator.clipboard.writeText(notesData.content);
    setCopied(true);
    showToast('Revision outlines copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notesData) return;
    const blob = new Blob([notesData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `StudyAI_Notes_${noteType}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Revision outline exported as TXT!', 'success');
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <StickyNote className="w-8 h-8 text-brand-accent animate-pulse-glow" />
          <span>Smart revision Notes Creator</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Synthesize custom mathematical formulas sheets, revision outlines, or targeted diagnostic exams.
        </p>
      </div>

      {pdfLoading ? (
        <NotesSkeleton />
      ) : pdfs.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-brand-deep/20">
          <p className="text-sm text-gray-400">Please upload a document to proceed with revisions generator.</p>
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
          {/* Controls Side Panel */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white">Focus Controls</h2>
            
            <div className="space-y-4">
              {/* textbook selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Textbook</label>
                <select
                  value={selectedPdfId}
                  onChange={(e) => {
                    setSelectedPdfId(e.target.value);
                    setNotesData(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-solid border-white/10 bg-brand-deep text-sm text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer"
                >
                  <option value="">-- Choose Material --</option>
                  {pdfs.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* revision outline selectors */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Revision Category</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'formulas', name: 'Formulas & Equations', desc: 'Mathematical / Scientific outlines' },
                    { id: 'revision', name: 'Revision Outline', desc: 'Key topic outlines & definitions' },
                    { id: 'questions', name: 'Targeted Exam Qs', desc: 'Up to 20 questions covering all topics' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setNoteType(style.id);
                        setNotesData(null);
                      }}
                      className={`p-3 rounded-xl border border-solid text-left transition-all ${
                        noteType === style.id
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

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedPdfId}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>Compile revision Sheet</span>
            </button>
          </div>

          {/* Revision Output Result Pane */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <NotesSkeleton />
            ) : notesData ? (
              <div className="p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4 animate-fade-in relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-teal" />
                    <span>revision Sheet Output</span>
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

                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg text-brand-teal hover:text-white hover:bg-brand-teal/20 border border-solid border-brand-teal/25 transition-all flex items-center gap-1 text-xs font-medium bg-brand-teal/10"
                      title="Export TXT File"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export TXT</span>
                    </button>
                  </div>
                </div>

                {/* Print details */}
                <div className="prose prose-invert max-w-none text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-brand-dark/20 p-5 rounded-xl border border-solid border-white/5 max-h-[500px] overflow-y-auto font-mono scrollbar-thin">
                  {notesData.content}
                </div>

                <div className="text-[10px] text-gray-500 font-semibold text-right">
                  Synthesized via Groq Llama-3 AI Engine
                </div>
              </div>
            ) : (
              <div className="p-12 border border-solid border-white/5 rounded-2xl bg-brand-deep/20 text-center flex flex-col justify-center items-center gap-3">
                <HelpCircle className="w-10 h-10 text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-white">Awaiting Focus Configuration</p>
                  <p className="text-xs text-gray-400 mt-1">Select an active textbook in the side panel and hit compile to synthesize your custom outline sheet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
