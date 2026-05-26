import React, { useState, useRef } from 'react';
import { Upload, File, Eye, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function FileUploader({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useOcr, setUseOcr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    if (!file.name.lowerCase?.endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Invalid file format. Please select a PDF file.');
      return;
    }
    // Limit file size to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(15);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('use_ocr', useOcr);

    // Simulate progress updates for a smoother visual feel
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      // Direct upload endpoint using our configured Axios services
      const { default: API } = await import('../services/api');
      const response = await API.post('/pdfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressTimer);
      setProgress(100);
      
      setTimeout(() => {
        onUploadSuccess(response.data);
        // Clear uploader state
        setSelectedFile(null);
        setUploading(false);
        setProgress(0);
      }, 800);

    } catch (err) {
      clearInterval(progressTimer);
      setUploading(false);
      setProgress(0);
      const detail = err.response?.data?.detail || 'Document processing failed. Please ensure the PDF is readable.';
      setErrorMsg(detail);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* File Ingestion Container Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? triggerFileInput : undefined}
        className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          dragActive 
            ? 'border-brand-accent bg-brand-accent/10 scale-[1.01]' 
            : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4 w-full max-w-xs animate-fade-in">
            <RefreshCw className="w-10 h-10 text-brand-accent animate-spin mx-auto" />
            <div>
              <p className="text-sm font-medium text-white">Ingesting study material...</p>
              <p className="text-xs text-gray-400 mt-1">Extracting text & calculating vector indices</p>
            </div>
            {/* Linear Progress Indicator Bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-accent to-brand-teal h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-teal">{progress}% Complete</span>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-full bg-brand-accent/20 text-brand-accent w-fit mx-auto border border-solid border-brand-accent/20">
              <File className="w-10 h-10" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-full bg-white/5 text-gray-400 w-fit mx-auto group-hover:text-white group-hover:bg-white/10 transition-all border border-solid border-white/5">
              <Upload className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Drag & drop your study PDF here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse local files (PDF only, up to 15MB)</p>
            </div>
          </div>
        )}
      </div>

      {/* OCR Options Toggle & Upload Trigger Banner */}
      {selectedFile && !uploading && (
        <div className="p-4 rounded-2xl bg-brand-deep border border-solid border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between animate-slide-up">
          {/* OCR Scanned Options Trigger */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-brand-accent/15 text-brand-accent border border-solid border-brand-accent/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useOcr}
                  onChange={(e) => setUseOcr(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-brand-accent focus:ring-brand-accent cursor-pointer"
                />
                <span>Enable OCR Scanning (Scanned PDFs)</span>
              </label>
              <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm">
                Runs Optical Character Recognition on image-only study notes. Takes a bit longer to process.
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedFile(null)}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-solid border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              className="flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-accent to-brand-teal text-white hover:shadow-brand-accent/20 hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Process Material</span>
            </button>
          </div>
        </div>
      )}

      {/* Diagnostic Errors Message Banner */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-solid border-red-500/20 text-red-400 flex items-start gap-2.5 text-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Processing Failed</p>
            <p className="mt-0.5 text-[11px] text-red-300/80">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
