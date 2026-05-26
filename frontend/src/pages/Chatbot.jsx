import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, Send, Book, AlertCircle, RefreshCw, HelpCircle, User, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { showToast } = useAuth();
  const [searchParams] = useSearchParams();

  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [querying, setQuerying] = useState(false);
  
  const chatBottomRef = useRef(null);

  // Quick suggestion prompts
  const suggestionTemplates = [
    "What are the primary formulas defined here?",
    "Can you outline a quick revision overview of this textbook?",
    "Identify the crucial vocabulary concepts and terms.",
    "Explain the core arguments proposed in the text."
  ];

  // Fetch PDFs at boot
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { default: API } = await import('../services/api');
        const response = await API.get('/pdfs/');
        setPdfs(response.data);
        
        const urlId = searchParams.get('pdf_id');
        if (urlId) {
          setSelectedPdfId(urlId);
          // Initial greeting
          const matchedPdf = response.data.find(p => p.id === urlId);
          if (matchedPdf) {
            greetUser(matchedPdf.title);
          }
        } else if (response.data.length > 0) {
          setSelectedPdfId(response.data[0].id);
          greetUser(response.data[0].title);
        } else {
          // Greeting without documents
          setMessages([
            {
              sender: 'ai',
              text: "Hello! I am your AI study copilot. Upload lecture notes or PDFs to start asking doubts and extracting formulas with document-level semantic accuracy!"
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPdfs(false);
      }
    };
    fetchPdfs();
  }, [searchParams]);

  // Keep chat viewport scrolled to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, querying]);

  const greetUser = (docTitle) => {
    setMessages([
      {
        sender: 'ai',
        text: `Active textbook: **${docTitle}** is successfully mapped in memory. Ask any specific questions, and I will search the text pages for answers!`
      }
    ]);
  };

  const handlePdfChange = (e) => {
    const pdfId = e.target.value;
    setSelectedPdfId(pdfId);
    setMessages([]);
    
    const matched = pdfs.find(p => p.id === pdfId);
    if (matched) {
      greetUser(matched.title);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    if (!selectedPdfId) {
      showToast('Please select a textbook to chat with.', 'error');
      return;
    }

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInputText('');
    
    setQuerying(true);

    try {
      const { default: API } = await import('../services/api');
      const response = await API.post('/chats/query', {
        pdf_id: selectedPdfId,
        query: query
      });

      // Add AI answer
      setMessages((prev) => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { sender: 'ai', text: "Apologies. I ran into issues looking up that answer in the vectors store. Please verify standard document parsing has completed." }
      ]);
      showToast('Failed to retrieve AI response.', 'error');
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] lg:h-[calc(100vh-110px)] flex flex-col gap-4 animate-fade-in">
      
      {/* Header controls strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-deep/50 border border-solid border-white/5 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-accent animate-pulse-glow" />
          <div>
            <h1 className="text-lg font-bold text-white">RAG Context Study Chatbot</h1>
            <p className="text-[11px] text-gray-400">Ask doubts, find formulas, and trace citations from pages</p>
          </div>
        </div>

        {/* Textbook selector */}
        {!loadingPdfs && pdfs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0">Textbook context:</span>
            <select
              value={selectedPdfId}
              onChange={handlePdfChange}
              className="px-3 py-2 rounded-xl border border-solid border-white/10 bg-brand-deep text-xs text-white focus:outline-none focus:border-brand-accent cursor-pointer max-w-xs truncate"
            >
              {pdfs.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingPdfs ? (
        <div className="flex-1 p-6 rounded-2xl bg-brand-deep/30 border border-solid border-white/5 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
        </div>
      ) : pdfs.length === 0 ? (
        <div className="flex-1 p-8 border border-dashed border-white/10 rounded-2xl text-center flex flex-col justify-center items-center gap-4 bg-brand-deep/20">
          <HelpCircle className="w-12 h-12 text-gray-600 animate-bounce" />
          <p className="text-sm text-gray-400">You must upload textbooks to enable semantic Q&A chatbot capabilities.</p>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-1.5 text-sm w-fit"
          >
            <span>Go to Upload Panel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Conversation Board */
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          
          {/* Main message chat pane */}
          <div className="flex-1 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 flex flex-col justify-between overflow-hidden glass-panel relative">
            <div className="absolute inset-0 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none opacity-20" />
            
            {/* Scrollable Conversation deck */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 relative z-10 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 max-w-2xl ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  } animate-slide-up`}
                >
                  <div className={`p-2.5 rounded-full border border-solid shrink-0 h-fit ${
                    msg.sender === 'user' 
                      ? 'bg-brand-teal/20 border-brand-teal/10 text-brand-teal' 
                      : 'bg-brand-accent/25 border-brand-accent/20 text-brand-accent'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border border-solid whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-brand-teal/10 border-brand-teal/15 text-white'
                      : 'bg-white/5 border-white/5 text-gray-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Dynamic Loading pulser message */}
              {querying && (
                <div className="flex gap-3 max-w-lg animate-pulse">
                  <div className="p-2.5 rounded-full bg-brand-accent/25 border border-solid border-brand-accent/20 text-brand-accent shrink-0">
                    <Brain className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-solid border-white/5 text-xs text-gray-500 w-32">
                    Looking up context...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input send bar footer */}
            <div className="p-3 border-t border-solid border-white/5 bg-brand-deep/80 flex gap-2 relative z-10">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask any question about this study material..."
                className="flex-1 px-4 py-3 rounded-xl border border-solid border-white/10 bg-white/5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-all"
                disabled={querying}
              />
              <button
                onClick={() => handleSend()}
                disabled={querying || !inputText.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white hover:shadow-brand-accent/20 hover:scale-105 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick template suggestions Side Panel (Desktop only) */}
          <div className="hidden lg:block w-72 p-5 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-4 glass-panel shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <span>Quick revision Queries</span>
            </h3>
            <p className="text-[10px] text-gray-500">Click any card template below to query the active document context instantly.</p>
            
            <div className="space-y-2.5 pt-2">
              {suggestionTemplates.map((temp, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(temp)}
                  disabled={querying}
                  className="w-full p-3 rounded-xl border border-solid border-white/5 bg-brand-dark/20 text-left text-xs text-gray-400 hover:text-white hover:border-brand-accent/30 hover:bg-brand-accent/5 transition-all"
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
