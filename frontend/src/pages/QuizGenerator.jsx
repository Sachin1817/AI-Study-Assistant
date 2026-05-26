import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrainCircuit, BookOpen, AlertCircle, Award, RefreshCw, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { QuizSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function QuizGenerator() {
  const { showToast } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  
  // Game Play states
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { default: API } = await import('../services/api');
        const response = await API.get('/pdfs/');
        setPdfs(response.data);
        
        const urlPdfId = searchParams.get('pdf_id');
        if (urlPdfId) {
          setSelectedPdfId(urlPdfId);
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

  const handleGenerate = async () => {
    if (!selectedPdfId) {
      showToast('Please select a textbook first.', 'error');
      return;
    }

    setLoading(true);
    setQuizFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setAllAnswers([]);
    setIsAnswered(false);

    try {
      const { default: API } = await import('../services/api');
      const response = await API.post('/quizzes/generate', {
        pdf_id: selectedPdfId,
        num_questions: questionCount,
        difficulty: difficulty
      });

      setQuizId(response.data.id);
      setQuestions(response.data.questions);
      showToast('Quiz compiled successfully! Good luck.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to compile quiz questions from document text.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (val) => {
    if (isAnswered) return;
    
    setAllAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIdx] = val;
      return newAnswers;
    });

    setSelectedAnswer(val);
    setIsAnswered(true);

    const isCorrect = val === questions[currentIdx].correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      showToast('Correct answer!', 'success');
    } else {
      showToast('Incorrect choice.', 'error');
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    setSubmittingAttempt(true);

    const finalPercent = Math.round((score / questions.length) * 100);

    // Trigger celebratory confetti on high scores
    if (finalPercent >= 70) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    try {
      const { default: API } = await import('../services/api');
      await API.post(`/quizzes/${quizId}/submit`, {
        answers: allAnswers
      });
      showToast(`Quiz completed! Score: ${finalPercent}%`, 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAttempt(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Segment */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-brand-accent" />
          <span>Interactive Quiz Playground</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Test your comprehension, practice core topics, and track performance scores.
        </p>
      </div>

      {pdfLoading ? (
        <QuizSkeleton />
      ) : pdfs.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-brand-deep/20">
          <p className="text-sm text-gray-400">Please upload a document to proceed with interactive quiz challenges.</p>
          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-1.5 text-sm w-fit mx-auto"
          >
            <span>Go to Upload Panel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : !quizId ? (
        /* 1. Selection & Generation Config Form */
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6">
          <h2 className="text-lg font-bold text-white">Configure Challenge</h2>
          
          <div className="space-y-4">
            {/* select document */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Textbook</label>
              <select
                value={selectedPdfId}
                onChange={(e) => setSelectedPdfId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-solid border-white/10 bg-brand-deep text-sm text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer"
              >
                <option value="">-- Choose Material --</option>
                {pdfs.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Config selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-solid border-white/10 bg-brand-deep text-sm text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Difficulty Grade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-solid border-white/10 bg-brand-deep text-sm text-white focus:outline-none focus:border-brand-accent transition-all cursor-pointer"
                >
                  <option value="easy">Easy Foundation</option>
                  <option value="medium">Intermediate Standard</option>
                  <option value="hard">Advanced Mastery</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedPdfId}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Analyzing text & forming questions...</span>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  <span>Start AI Challenge</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : quizFinished ? (
        /* 2. End of Game Score card view */
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6 text-center animate-scale-up">
          <Award className="w-16 h-16 text-brand-teal mx-auto animate-bounce" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Challenge Completed!</h2>
            <p className="text-xs text-gray-400">You scored standard performance metrics in the exam</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-solid border-white/5 inline-block">
            <p className="text-[10px] uppercase font-semibold text-gray-500">Your Score Ratio</p>
            <p className="text-4xl font-extrabold text-white mt-1">
              {score} / {questions.length}
            </p>
            <p className="text-xs font-semibold text-brand-teal mt-1">
              {Math.round((score / questions.length) * 100)}% Accuracy
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setQuizId(null)}
              className="flex-1 px-4 py-3 rounded-xl text-xs font-semibold border border-solid border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Config Panel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-accent to-brand-teal text-white hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Test</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. Interactive Active Gameplay board */
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-brand-deep/50 border border-solid border-white/5 space-y-6 animate-slide-up relative">
          <div className="flex items-center justify-between border-b border-solid border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">Question Progression</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                Question {currentIdx + 1} of {questions.length}
              </p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Correct Answers</span>
              <p className="text-sm font-bold text-white mt-0.5">{score} Hits</p>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-accent to-brand-teal h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {questions[currentIdx].question}
            </h3>

            {/* Answer option decks */}
            <div className="grid grid-cols-1 gap-3">
              {questions[currentIdx].options.map((val, idx) => {
                const isSelected = selectedAnswer === val;
                const isCorrect = val === questions[currentIdx].correct_answer;
                
                let optionStyle = 'border-white/5 bg-brand-dark/20 text-gray-300 hover:text-white hover:bg-white/5';
                
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle = 'border-brand-success bg-brand-success/15 text-white';
                  } else if (isSelected) {
                    optionStyle = 'border-red-600 bg-red-600/10 text-white';
                  } else {
                    optionStyle = 'border-white/5 bg-brand-dark/20 text-gray-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(val)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl border border-solid text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                  >
                    <span>{val}</span>
                    {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-brand-success shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option details and AI explanations */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-white/5 border border-solid border-white/5 text-xs text-gray-400 leading-relaxed animate-fade-in">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1 text-[11px] text-brand-teal uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                <span>AI Concept Review</span>
              </span>
              {questions[currentIdx].explanation || "Detailed logical breakdown generated by StudyAI analysis engines."}
            </div>
          )}

          {/* Navigation action bars */}
          <div className="flex justify-between items-center pt-4 border-t border-solid border-white/5">
            <button
              onClick={() => {
                if (window.confirm("Abandon current quiz challenge?")) {
                  setQuizId(null);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-solid border-transparent hover:border-white/10 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quit Game</span>
            </button>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-brand-teal text-white font-semibold hover:shadow-brand-accent/20 hover:shadow-md transition-all flex items-center gap-1 text-xs"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Challenge'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
