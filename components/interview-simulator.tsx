'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, Clock, ChevronRight, RotateCcw, ArrowRight, Check, AlertTriangle, Zap } from 'lucide-react';

/* ─── Questions bank ─── */
const QUESTIONS = [
  {
    id: 'q1',
    category: 'Project',
    text: 'Tell me about a project you\'re proud of.',
    hint: 'Lead with the problem you solved, not the tech you used.',
  },
  {
    id: 'q2',
    category: 'Challenge',
    text: 'Describe a technical challenge you faced and how you resolved it.',
    hint: 'Name the specific bug or bottleneck — vague answers lose points.',
  },
  {
    id: 'q3',
    category: 'Impact',
    text: 'Walk me through a project where you had measurable impact.',
    hint: 'Numbers matter — latency, uptime, conversion, time saved.',
  },
  {
    id: 'q4',
    category: 'Trade-off',
    text: 'Tell me about a trade-off you made in a recent project.',
    hint: 'Show you can reason about constraints, not just solutions.',
  },
  {
    id: 'q5',
    category: 'Collaboration',
    text: 'Describe a time you improved an existing system.',
    hint: 'Explain what was broken, what you changed, and what improved.',
  },
];

/* ─── Transformation preview lines ─── */
const IMPROVED_LINES = [
  <>I built this because our team lacked <strong>a single source of truth</strong> for the problem we were solving.</>,
  <>I used <strong>the right tools for the constraints</strong> — performance, maintainability, and shipping speed all mattered.</>,
  <>The result was measurable: <span className="text-emerald-300">adoption went up, manual work went down</span>. I\'d do it differently in one way — I\'d instrument it sooner.</>,
];

const TRANSFORM_STEPS = [
  'Analyzing your answer…',
  'Improving clarity…',
  'Adding technical depth…',
  'Refining impact statement…',
];

/* ─── Score logic ─── */
function computeScore(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;
  const lower = answer.toLowerCase();

  const techKeywords = ['built', 'implemented', 'deployed', 'integrated', 'optimized', 'fixed', 'refactored', 'api', 'database', 'performance', 'latency', 'scale', 'cache', 'async', 'render', 'query', 'bottleneck', 'race condition', 'algorithm'];
  const structureKeywords = ['because', 'problem', 'solution', 'result', 'impact', 'reduced', 'improved', 'then', 'which meant', 'ended up', 'led to'];
  const techHits = techKeywords.filter((k) => lower.includes(k)).length;
  const structHits = structureKeywords.filter((k) => lower.includes(k)).length;

  const clarity: 'Strong' | 'Medium' | 'Weak' = wc >= 60 ? 'Strong' : wc >= 25 ? 'Medium' : 'Weak';
  const depth: 'Good' | 'Needs work' = techHits >= 2 ? 'Good' : 'Needs work';
  const structure: 'Good' | 'Improve ending' = structHits >= 2 ? 'Good' : 'Improve ending';

  return { clarity, depth, structure, wordCount: wc };
}

const CLARITY_COLOR = { Strong: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.08]', Medium: 'text-amber-300 border-amber-500/20 bg-amber-500/[0.08]', Weak: 'text-red-300 border-red-500/20 bg-red-500/[0.08]' };
const DEPTH_COLOR = { Good: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.08]', 'Needs work': 'text-amber-300 border-amber-500/20 bg-amber-500/[0.08]' };
const STRUCT_COLOR = { Good: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.08]', 'Improve ending': 'text-amber-300 border-amber-500/20 bg-amber-500/[0.08]' };

const CLARITY_POINTS = { Strong: 90, Medium: 66, Weak: 38 };
const DEPTH_POINTS = { Good: 84, 'Needs work': 54 };
const STRUCT_POINTS = { Good: 82, 'Improve ending': 56 };

function meterTextColor(value: number) {
  if (value >= 75) return 'text-emerald-300';
  if (value >= 50) return 'text-amber-300';
  return 'text-red-300';
}

function meterTrackGradient(value: number) {
  if (value >= 75) return 'linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #34d399 100%)';
  if (value >= 50) return 'linear-gradient(90deg, #ef4444 0%, #f59e0b 65%, #fbbf24 100%)';
  return 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)';
}

/* ─── Timer display ─── */
function pad(n: number) { return String(n).padStart(2, '0'); }

type Phase = 'idle' | 'answering' | 'submitted' | 'transforming' | 'result';

/* ─── Main component ─── */
export function InterviewSimulator() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [qIndex, setQIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [userAnswer, setUserAnswer] = useState('');
  const [transformStep, setTransformStep] = useState(0);
  const [revealedLineCount, setRevealedLineCount] = useState(0);
  const [showStructured, setShowStructured] = useState(false);
  const [score, setScore] = useState<ReturnType<typeof computeScore> | null>(null);
  const [animatedClarity, setAnimatedClarity] = useState(0);
  const [animatedDepth, setAnimatedDepth] = useState(0);
  const [animatedStructure, setAnimatedStructure] = useState(0);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [typedFeedbackCount, setTypedFeedbackCount] = useState(0);
  const [showImprovedAnswer, setShowImprovedAnswer] = useState(false);
  const [isImprovingAnswer, setIsImprovingAnswer] = useState(false);
  const [improvedRevealCount, setImprovedRevealCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const question = QUESTIONS[qIndex];

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== 'answering') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Transformation pipeline ── */
  useEffect(() => {
    if (phase !== 'transforming') return;
    const t0 = setTimeout(() => setTransformStep(1), 500);
    const t1 = setTimeout(() => setTransformStep(2), 1000);
    const t2 = setTimeout(() => setTransformStep(3), 1500);
    // Start line reveal
    const t3 = setTimeout(() => setRevealedLineCount(1), 1200);
    const t4 = setTimeout(() => setRevealedLineCount(2), 1500);
    const t5 = setTimeout(() => setRevealedLineCount(3), 1800);
    const t6 = setTimeout(() => {
      setShowStructured(true);
      setPhase('result');
    }, 2200);
    return () => [t0, t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [phase]);

  /* ── Focus textarea on answering start ── */
  useEffect(() => {
    if (phase === 'answering') {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [phase]);

  /* ── Lock body scroll while open ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (phase !== 'result' || !score) return;
    const targetClarity = CLARITY_POINTS[score.clarity];
    const targetDepth = DEPTH_POINTS[score.depth];
    const targetStructure = STRUCT_POINTS[score.structure];
    const targetConfidence = Math.round((targetClarity + targetDepth + targetStructure) / 3);
    const start = performance.now();
    const duration = 700;
    let rafId = 0;

    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedClarity(Math.round(targetClarity * eased));
      setAnimatedDepth(Math.round(targetDepth * eased));
      setAnimatedStructure(Math.round(targetStructure * eased));
      setAnimatedConfidence(Math.round(targetConfidence * eased));
      if (t < 1) rafId = requestAnimationFrame(animate);
    };

    setAnimatedClarity(0);
    setAnimatedDepth(0);
    setAnimatedStructure(0);
    setAnimatedConfidence(0);
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [phase, score]);

  const feedbackLines = score
    ? [
        score.wordCount < 25
          ? `You answered in ${score.wordCount} words. Stretch to 60+ so your reasoning feels complete.`
          : score.wordCount < 60
          ? `Good momentum at ${score.wordCount} words. Add one concrete metric to raise recruiter confidence.`
          : `Strong density at ${score.wordCount} words. Your answer has enough depth for follow-up questions.`,
        score.depth === 'Needs work'
          ? 'Add one technical decision and one trade-off to increase engineering signal.'
          : 'Technical depth landed well. Keep naming decisions and constraints explicitly.',
        score.structure === 'Improve ending'
          ? 'Close with measurable impact so your ending feels decisive.'
          : 'Your structure is clear. Keep ending with an outcome statement.',
      ]
    : [];

  useEffect(() => {
    if (phase !== 'result' || !score) return;
    setTypedFeedbackCount(0);
    const interval = setInterval(() => {
      setTypedFeedbackCount((prev) => {
        if (prev >= feedbackLines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 260);
    return () => clearInterval(interval);
  }, [phase, score, feedbackLines.length]);

  const startInterview = useCallback(() => {
    setPhase('answering');
    setSecondsLeft(60);
    setUserAnswer('');
    setTransformStep(0);
    setRevealedLineCount(0);
    setShowStructured(false);
    setScore(null);
    setTypedFeedbackCount(0);
    setShowImprovedAnswer(false);
    setIsImprovingAnswer(false);
    setImprovedRevealCount(0);
  }, []);

  const handleSubmit = useCallback(() => {
    clearInterval(timerRef.current!);
    const computed = computeScore(userAnswer);
    setScore(computed);
    setPhase('submitted');
    // Slight delay before transformation starts so user sees "submitted" state
    setTimeout(() => {
      setTransformStep(0);
      setRevealedLineCount(0);
      setShowStructured(false);
      setPhase('transforming');
    }, 600);
  }, [userAnswer]);

  const tryAgain = useCallback(() => {
    setPhase('idle');
    setUserAnswer('');
    setTransformStep(0);
    setRevealedLineCount(0);
    setShowStructured(false);
    setScore(null);
    setSecondsLeft(60);
    setTypedFeedbackCount(0);
    setShowImprovedAnswer(false);
    setIsImprovingAnswer(false);
    setImprovedRevealCount(0);
  }, []);

  const nextQuestion = useCallback(() => {
    setQIndex((i) => (i + 1) % QUESTIONS.length);
    tryAgain();
  }, [tryAgain]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setPhase('idle');
      setUserAnswer('');
      setTransformStep(0);
      setRevealedLineCount(0);
      setShowStructured(false);
      setScore(null);
      setSecondsLeft(60);
      setTypedFeedbackCount(0);
      setShowImprovedAnswer(false);
      setIsImprovingAnswer(false);
      setImprovedRevealCount(0);
    }, 300);
  }, []);

  const improvedAnswerLines = [
    'I built this project to solve a concrete team problem, not just to explore tools.',
    'I made deliberate technical choices based on scale and maintainability constraints.',
    'The result improved speed and reliability, and I can clearly explain what I would improve next.',
  ];

  const handleImproveAnswer = useCallback(() => {
    if (isImprovingAnswer) return;
    setShowImprovedAnswer(true);
    setIsImprovingAnswer(true);
    setImprovedRevealCount(0);
    const t0 = setTimeout(() => setImprovedRevealCount(1), 260);
    const t1 = setTimeout(() => setImprovedRevealCount(2), 520);
    const t2 = setTimeout(() => {
      setImprovedRevealCount(3);
      setIsImprovingAnswer(false);
    }, 780);
    return () => [t0, t1, t2].forEach(clearTimeout);
  }, [isImprovingAnswer]);

  /* ── Timer color ── */
  const timerColor =
    secondsLeft <= 10 ? 'text-red-400' :
    secondsLeft <= 20 ? 'text-amber-400' :
    'text-cyan-300';
  const timerPulse = secondsLeft <= 10 && phase === 'answering';
  const timerBorder =
    secondsLeft <= 10 ? 'border-red-500/25 bg-red-500/[0.06]' :
    secondsLeft <= 20 ? 'border-amber-500/25 bg-amber-500/[0.06]' :
    'border-cyan-500/20 bg-cyan-500/[0.06]';

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="btn-glass inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-medium transition-all hover:-translate-y-0.5"
      >
        <Mic className="h-4 w-4 text-cyan-400" />
        Interview Simulator
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/[0.07] px-1.5 py-0.5 text-[10px] text-cyan-300">NEW</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="simulator-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="simulator-panel relative z-10 w-full max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0a0c10] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_-12px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(56,189,248,0.12)] overflow-hidden">

            {/* Glow border accent */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan-500/[0.08]" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/[0.08]">
                  <Mic className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">Interview Simulator</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    Question {qIndex + 1} of {QUESTIONS.length} · {question.category}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* Question card */}
              <div className={`rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 ${phase === 'answering' ? 'sim-question-active' : ''}`}>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">Recruiter asks</p>
                <p className="text-[17px] font-semibold leading-snug text-zinc-100">&ldquo;{question.text}&rdquo;</p>
                <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-zinc-600">
                  <span className="mt-px shrink-0">💡</span>
                  {question.hint}
                </p>
              </div>

              {/* IDLE phase */}
              {phase === 'idle' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <p className="text-sm text-zinc-500">You have <span className="font-semibold text-zinc-200">60 seconds</span>. Answer like you&apos;re speaking, not writing.</p>
                  <button
                    onClick={startInterview}
                    className="btn-cta inline-flex h-10 items-center gap-2 rounded-xl px-6 text-sm"
                  >
                    <Clock className="h-4 w-4" />
                    Start 60-Second Answer
                  </button>
                  <p className="text-[11px] text-zinc-700">Timer starts immediately. No pressure — this is practice.</p>
                </div>
              )}

              {/* ANSWERING phase */}
              {phase === 'answering' && (
                <div className="space-y-3">
                  {/* Timer bar */}
                  <div className={`flex items-center justify-between rounded-lg border px-4 py-2.5 transition-all duration-500 ${timerBorder} ${timerPulse ? 'animate-pulse' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Clock className={`h-3.5 w-3.5 ${timerColor} transition-colors`} />
                      <span className="text-[11px] text-zinc-400">Time remaining</span>
                    </div>
                    <span className={`font-mono text-lg font-bold tabular-nums transition-colors ${timerColor}`}>
                      {pad(Math.floor(secondsLeft / 60))}:{pad(secondsLeft % 60)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-0.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${(secondsLeft / 60) * 100}%`,
                        background: secondsLeft <= 10 ? '#f87171' : secondsLeft <= 20 ? '#fbbf24' : '#22d3ee',
                      }}
                    />
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Answer like you're in the room. Use 'I' — tell the actual story..."
                    rows={6}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-700">
                      {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      <span className="ml-2 text-zinc-800">· aim for 60+</span>
                    </span>
                    <button
                      onClick={handleSubmit}
                      disabled={userAnswer.trim().length < 5}
                      className="btn-cta inline-flex h-8 items-center gap-1.5 rounded-lg px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMITTED (brief flash before transform) */}
              {phase === 'submitted' && (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
                  <span className="text-sm text-zinc-400">Analyzing your answer…</span>
                </div>
              )}

              {/* TRANSFORMING phase */}
              {phase === 'transforming' && (
                <div className="rounded-xl border border-cyan-500/[0.2] bg-cyan-500/[0.04] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-300">Live transformation</p>
                    <span className="text-[11px] text-zinc-500">{TRANSFORM_STEPS[transformStep]}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Original */}
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 opacity-60">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Original</p>
                      <p className="text-[12px] leading-relaxed text-zinc-400 line-clamp-6 whitespace-pre-wrap">{userAnswer}</p>
                    </div>
                    {/* Improved */}
                    <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Improved</p>
                      <div className="space-y-1.5 text-[12px] leading-relaxed text-zinc-200 min-h-[80px]">
                        {IMPROVED_LINES.slice(0, revealedLineCount).map((line, i) => (
                          <p key={i} className="animate-in fade-in duration-300">{line}</p>
                        ))}
                        {revealedLineCount < IMPROVED_LINES.length && (
                          <span className="inline-block h-4 w-[2px] bg-cyan-300/80 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RESULT phase */}
              {phase === 'result' && score && (
                <div className="space-y-4">
                  {/* Confidence meter */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Confidence Meter</p>
                      <span className={`text-[11px] font-semibold ${meterTextColor(animatedConfidence)}`}>{animatedConfidence}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${animatedConfidence}%`,
                          background: meterTrackGradient(animatedConfidence),
                          boxShadow: '0 0 14px rgba(34, 211, 238, 0.22)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Score cards */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2.5">Interview Score</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`rounded-xl border px-3 py-3 text-center ${CLARITY_COLOR[score.clarity]}`}>
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Clarity</p>
                        <p className="text-sm font-semibold">{score.clarity}</p>
                        <p className={`mt-1 text-[11px] font-mono font-medium ${meterTextColor(animatedClarity)}`}>{animatedClarity}</p>
                      </div>
                      <div className={`rounded-xl border px-3 py-3 text-center ${DEPTH_COLOR[score.depth]}`}>
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Tech Depth</p>
                        <p className="text-sm font-semibold">{score.depth}</p>
                        <p className={`mt-1 text-[11px] font-mono font-medium ${meterTextColor(animatedDepth)}`}>{animatedDepth}</p>
                      </div>
                      <div className={`rounded-xl border px-3 py-3 text-center ${STRUCT_COLOR[score.structure]}`}>
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Structure</p>
                        <p className="text-sm font-semibold">{score.structure}</p>
                        <p className={`mt-1 text-[11px] font-mono font-medium ${meterTextColor(animatedStructure)}`}>{animatedStructure}</p>
                      </div>
                    </div>
                  </div>

                  {/* Typed feedback */}
                  <div className="rounded-xl border border-cyan-500/[0.15] bg-cyan-500/[0.04] p-3.5">
                    <div className="mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-cyan-300" />
                      <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-300">Coach Feedback</p>
                    </div>
                    <ul className="space-y-1.5">
                      {feedbackLines.slice(0, typedFeedbackCount).map((line) => (
                        <li key={line} className="text-[12px] leading-relaxed text-zinc-300 animate-in fade-in duration-300">{line}</li>
                      ))}
                      {typedFeedbackCount < feedbackLines.length && (
                        <li className="inline-block h-4 w-[2px] bg-cyan-300/80 animate-pulse" />
                      )}
                    </ul>
                  </div>

                  {/* Improve answer */}
                  <div className="space-y-2">
                    <button
                      onClick={handleImproveAnswer}
                      disabled={isImprovingAnswer}
                      className="btn-glass inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {isImprovingAnswer ? 'Improving…' : 'Improve Answer'}
                    </button>
                    {showImprovedAnswer && (
                      <div className="rounded-xl border border-emerald-500/18 bg-emerald-500/[0.05] p-3.5 space-y-1.5">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-300">AI Coach Rewrite</p>
                        {improvedAnswerLines.slice(0, improvedRevealCount).map((line, idx) => (
                          <p key={line} className="text-[12px] leading-relaxed text-zinc-200 animate-in fade-in duration-300" style={{ animationDelay: `${idx * 40}ms` }}>{line}</p>
                        ))}
                        {isImprovingAnswer && <span className="inline-block h-4 w-[2px] bg-emerald-300/80 animate-pulse" />}
                      </div>
                    )}
                  </div>

                  {/* Improved version (structured) */}
                  {showStructured && (
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Suggested structure</p>
                      {[
                        { label: 'Problem', text: 'State the gap or constraint you were solving — not the tech, the need.' },
                        { label: 'Solution', text: 'Explain what you built and the key technical decision that defined it.' },
                        { label: 'Result', text: 'End with a measurable outcome: speed, adoption, cost, time saved.' },
                      ].map(({ label, text }) => (
                        <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[10px] uppercase tracking-widest text-cyan-300/80 mb-1">{label}</p>
                          <p className="text-[12px] leading-relaxed text-zinc-400">{text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={tryAgain}
                      className="btn-glass inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Try Again
                    </button>
                    <button
                      onClick={nextQuestion}
                      className="btn-cta inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs"
                    >
                      Next Question
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
