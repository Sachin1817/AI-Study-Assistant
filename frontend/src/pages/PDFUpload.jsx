import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, FileText, Trash2, Eye, BrainCircuit, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { CardSkeleton } from '../components/LoadingSkeleton';

export default function PDFUpload() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch standard PDFs lists
  const fetchPdfs = async () => {
    try {
      const { default: API } = await import('../services/api');
      const response = await API.get('/pdfs/');
      setPdfs(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync study materials library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleUploadSuccess = (newPdf) => {
    setPdfs((prev) => [newPdf, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this textbook? This will wipe all associated summary cache and chatbot vectors.")) return;
    
    setDeletingId(id);
    try {
      const { default: API } = await import('../services/api');
      await API.delete(`/pdfs/${id}`);
      setPdfs((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <FileUp className="w-8 h-8 text-brand-accent" />
          <span>Study Materials Library</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload books, lecture PDFs, or scanned papers. Let our AI map contents, execute OCR checks, and build vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
        {/* Core Drag & Drop module */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white">Upload New PDF</h2>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Uploaded materials list grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-teal" />
              <span>Ingested Library ({pdfs.length})</span>
            </h2>
            
            <button
              onClick={() => {
                setLoading(true);
                fetchPdfs();
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-solid border-white/5"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-red-500/10 border border-solid border-red-500/20 text-red-400 rounded-2xl text-sm flex gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMsg}</span>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-brand-deep/20">
              <FileText className="w-12 h-12 text-gray-600 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-white">No materials uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Upload a PDF textbook on the left panel to begin your AI-assisted review.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="p-5 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-brand-accent/15 text-brand-accent border border-solid border-brand-accent/10">
                        <FileText className="w-5 h-5" />
                      </div>
                      <button
                        onClick={() => handleDelete(pdf.id)}
                        disabled={deletingId === pdf.id}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete material"
                      >
                        {deletingId === pdf.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-accent transition-colors" title={pdf.title}>
                        {pdf.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Pages: {pdf.pages_count} • Uploaded {new Date(pdf.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Immediate actions triggers panel */}
                  <div className="flex items-center gap-2 pt-2 border-t border-solid border-white/5">
                    <Link
                      to={`/summarizer?pdf_id=${pdf.id}`}
                      className="flex-1 px-3 py-2 rounded-lg text-center text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Summarize</span>
                    </Link>
                    <Link
                      to={`/chatbot?pdf_id=${pdf.id}`}
                      className="flex-1 px-3 py-2 rounded-lg text-center text-xs font-semibold bg-brand-accent/25 border border-solid border-brand-accent/25 text-brand-accent hover:bg-brand-accent/35 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat QA</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
