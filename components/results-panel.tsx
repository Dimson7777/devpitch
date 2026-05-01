'use client';

import { useState, useEffect, useRef } from 'react';
import { GeneratedPitch } from '@/lib/types';
import { Target, FileText, Linkedin, MessageSquare, Code as Code2, Copy, Check, ChevronDown, ChevronUp, Zap, Clock } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex h-7 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
      {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
    </button>
  );
}

function LiveDot() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="relative flex h-1.5 w-1.5">
      {pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

/* Typing animation hook */
function useTypingEffect(text: string, speed: number = 8, delay: number = 0) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i += speed;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return displayed;
}

const confidenceLabels: Record<string, string> = {
  'Elevator Pitch': 'Recruiter-ready',
  'CV Description': 'Recruiter-ready',
  'LinkedIn Description': 'Strong post',
  'Interview Answer': 'Strong answer',
  'Technical Breakdown': 'Deep dive',
};

function PitchCard({
  icon: Icon,
  label,
  content,
  badge,
  staggerDelay = 0,
}: {
  icon: React.ElementType;
  label: string;
  content: string;
  badge?: string;
  staggerDelay?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const confidence = confidenceLabels[label];
  const typedContent = useTypingEffect(content, 6, staggerDelay + 100);
  const isTypingDone = typedContent.length >= content.length;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), staggerDelay);
    return () => clearTimeout(timer);
  }, [staggerDelay]);

  return (
    <div
      className={`premium-hover-card rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-[250ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors duration-300 ${
            isHovered ? 'border-white/[0.14] bg-white/[0.07]' : 'border-white/[0.08] bg-white/[0.04]'
          }`}>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold">{label}</span>
          {badge && (
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">{badge}</span>
          )}
          {confidence && (
            <span className="flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              <LiveDot />
              {confidence}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <button onClick={() => setExpanded(!expanded)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4 pt-3">
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
            {isTypingDone ? content : typedContent}
            {!isTypingDone && <span className="inline-block w-0.5 h-3.5 bg-cyan-400/60 animate-pulse ml-0.5" />}
          </p>
        </div>
      )}
    </div>
  );
}

function TechnicalBreakdownCard({
  breakdown,
  isStronger,
  staggerDelay = 0,
}: {
  breakdown: GeneratedPitch['technicalBreakdown'];
  isStronger: boolean;
  staggerDelay?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const badge = isStronger ? 'Stronger' : undefined;

  const sections = [
    { label: 'Architecture', content: breakdown.architecture },
    { label: 'Key Decisions', content: breakdown.keyDecisions },
    { label: 'Problems Solved', content: breakdown.problemsSolved },
    { label: 'Improvements', content: breakdown.improvements },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), staggerDelay);
    return () => clearTimeout(timer);
  }, [staggerDelay]);

  return (
    <div
      className={`premium-hover-card rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-[250ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors duration-300 ${
            isHovered ? 'border-white/[0.14] bg-white/[0.07]' : 'border-white/[0.08] bg-white/[0.04]'
          }`}>
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold">Technical Breakdown</span>
          {badge && (
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">{badge}</span>
          )}
          <span className="flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            <LiveDot />
            Deep dive
          </span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>
      {expanded && (
        <div className="p-4 pt-3 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</h4>
                <CopyButton text={section.content} />
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{section.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({
  result,
  isStronger,
  generationTime,
}: {
  result: GeneratedPitch;
  isStronger: boolean;
  generationTime?: number;
}) {
  const badge = isStronger ? 'Stronger' : undefined;

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-lg font-semibold">Generated Content</h2>
        {isStronger && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <Zap className="h-3 w-3" /> Strengthened
          </span>
        )}
        {generationTime && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Clock className="h-3 w-3" />
            Generated in {generationTime.toFixed(1)}s
          </span>
        )}
      </div>

      <PitchCard icon={Target} label="Elevator Pitch" content={result.elevatorPitch} badge={badge} staggerDelay={0} />
      <PitchCard icon={FileText} label="CV Description" content={result.cvDescription} badge={badge} staggerDelay={150} />
      <PitchCard icon={Linkedin} label="LinkedIn Description" content={result.linkedInDescription} badge={badge} staggerDelay={300} />
      <PitchCard icon={MessageSquare} label="Interview Answer" content={result.interviewAnswer} badge={badge} staggerDelay={450} />
      <TechnicalBreakdownCard breakdown={result.technicalBreakdown} isStronger={isStronger} staggerDelay={600} />
    </div>
  );
}
