'use client';

import { useState, useRef } from 'react';
import { ProjectInput, ProjectType, OutputTone, GeneratedPitch, PROJECT_TYPE_LABELS, TONE_LABELS } from '@/lib/types';
import { generatePitch } from '@/lib/generator';
import { exampleProjects } from '@/lib/examples';
import { ResultsPanel } from '@/components/results-panel';
import { InterviewSimulator } from '@/components/interview-simulator';
import { ArrowRight, Loader as Loader2, Zap, Sparkles, FileText, MessageSquare, Linkedin, ChevronRight, Check } from 'lucide-react';

const projectTypes: { value: ProjectType; label: string }[] = [
  { value: 'saas', label: PROJECT_TYPE_LABELS.saas },
  { value: 'portfolio', label: PROJECT_TYPE_LABELS.portfolio },
  { value: 'ecommerce', label: PROJECT_TYPE_LABELS.ecommerce },
  { value: 'ai-tool', label: PROJECT_TYPE_LABELS['ai-tool'] },
  { value: 'dashboard', label: PROJECT_TYPE_LABELS.dashboard },
  { value: 'other', label: PROJECT_TYPE_LABELS.other },
];

const toneOptions: { value: OutputTone; label: string }[] = [
  { value: 'professional', label: TONE_LABELS.professional },
  { value: 'senior', label: TONE_LABELS.senior },
  { value: 'concise', label: TONE_LABELS.concise },
  { value: 'interview', label: TONE_LABELS.interview },
];

export default function GeneratePage() {
  const [form, setForm] = useState<ProjectInput>({
    name: '',
    description: '',
    techStack: '',
    projectType: 'saas',
    tone: 'professional',
  });

  const [result, setResult] = useState<GeneratedPitch | null>(null);
  const [isStronger, setIsStronger] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationTime, setGenerationTime] = useState<number | undefined>(undefined);
  const [resultKey, setResultKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [loadedExampleId, setLoadedExampleId] = useState<string | null>(null);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [inputGlow, setInputGlow] = useState(false);
  const [generateRipple, setGenerateRipple] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0); // 0=idle 1,2,3=phases
  const [thinkingWords, setThinkingWords] = useState(0); // word count revealed
  const thinkingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const updateField = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const THINKING_PHRASES = [
    'Analyzing your project…',
    'Structuring impact…',
    'Optimizing for recruiters…',
  ];

  const handleGenerate = async () => {
    if (!form.name.trim() || !form.description.trim()) return;

    // Clear any leftover timers
    thinkingTimersRef.current.forEach(clearTimeout);
    thinkingTimersRef.current = [];

    setIsGenerating(true);
    setResult(null);
    setIsStronger(false);
    setThinkingPhase(1);
    setThinkingWords(0);

    // Phase transitions at 0, 650, 1000ms — total delay stays 1800ms
    const scheduleWords = (phrase: string, startDelay: number) => {
      const words = phrase.split(' ');
      words.forEach((_, i) => {
        const t = setTimeout(() => setThinkingWords(i + 1), startDelay + i * 80);
        thinkingTimersRef.current.push(t);
      });
    };

    scheduleWords(THINKING_PHRASES[0], 60);

    const t1 = setTimeout(() => { setThinkingPhase(2); setThinkingWords(0); scheduleWords(THINKING_PHRASES[1], 60); }, 650);
    const t2 = setTimeout(() => { setThinkingPhase(3); setThinkingWords(0); scheduleWords(THINKING_PHRASES[2], 60); }, 1150);
    thinkingTimersRef.current.push(t1, t2);

    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const pitch = generatePitch(form, false);
    const elapsed = (performance.now() - start) / 1000;
    setResult(pitch);
    setGenerationTime(elapsed);
    setHasGenerated(true);
    setResultKey((k) => k + 1);
    setIsGenerating(false);
    setThinkingPhase(0);
    setThinkingWords(0);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleMakeStronger = async () => {
    if (!result) return;
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const strongerPitch = generatePitch(form, true);
    setResult(strongerPitch);
    setIsStronger(true);
    setIsGenerating(false);
  };

  const isValid = form.name.trim().length > 0 && form.description.trim().length > 0;

  // Derived values for live preview panel
  const previewName = form.name.trim() || 'CloudSync Dashboard';
  const previewDesc = form.description.trim() || 'A real-time analytics dashboard that monitors cloud infrastructure health and alerts teams before outages.';
  const previewStack = form.techStack.trim() || 'Next.js, TypeScript, PostgreSQL';
  const hasAnyInput = form.name.trim().length > 0 || form.description.trim().length > 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Workspace</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Pitch Generator
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Describe your project. Get content for every channel.
              </p>
            </div>
            <InterviewSimulator />
          </div>
        </div>

        <div className={`grid gap-6 ${hasGenerated ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>
          {/* Left: Input Panel */}
          <div className={hasGenerated ? 'lg:col-span-4' : 'lg:col-span-5'}>
            <div ref={formRef} className={`panel-float rounded-xl border bg-white/[0.02] overflow-hidden transition-all duration-500 focus-within:border-cyan-500/20 focus-within:shadow-[0_0_70px_-10px_rgba(56,189,248,0.22)] ${inputGlow ? 'border-cyan-500/40 shadow-[0_0_50px_-8px_rgba(6,182,212,0.35)]' : 'border-white/[0.06]'}`}>
              <div className="border-b border-white/[0.06] px-5 py-3 flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Project Input</span>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. CloudSync Dashboard"
                    className="flex h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Short Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="e.g. A real-time analytics dashboard that monitors cloud infrastructure health and alerts teams before outages"
                    rows={3}
                    className="flex w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    value={form.techStack}
                    onChange={(e) => updateField('techStack', e.target.value)}
                    placeholder="e.g. Next.js, TypeScript, PostgreSQL"
                    className="flex h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-cyan-500/40 focus-visible:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Project Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {projectTypes.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => updateField('projectType', pt.value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                          form.projectType === pt.value
                            ? 'border-white/[0.15] bg-white/[0.08] text-zinc-200'
                            : 'border-white/[0.06] bg-transparent text-zinc-600 hover:border-white/[0.1] hover:bg-white/[0.03]'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Output Tone
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {toneOptions.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => updateField('tone', t.value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                          form.tone === t.value
                            ? 'border-white/[0.15] bg-white/[0.08] text-zinc-200'
                            : 'border-white/[0.06] bg-transparent text-zinc-600 hover:border-white/[0.1] hover:bg-white/[0.03]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      setGenerateRipple(true);
                      setTimeout(() => setGenerateRipple(false), 460);
                      handleGenerate();
                    }}
                    disabled={!isValid || isGenerating}
                    className="btn-generate-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {generateRipple && !isGenerating && <span className="btn-generate-ripple" />}
                    {isGenerating && !hasGenerated ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Pitch
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  {hasGenerated && result && (
                    <button
                      onClick={handleMakeStronger}
                      disabled={isGenerating}
                      className="btn-glass flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Upgrading...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" />
                          {isStronger ? 'Strengthened' : 'Make It Stronger'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Output */}
          <div ref={resultsRef} className={hasGenerated ? 'lg:col-span-8' : 'lg:col-span-7'}>
            {hasGenerated && result ? (
              <div key={resultKey} className="results-fade-in">
                <ResultsPanel result={result} isStronger={isStronger} generationTime={generationTime} />
              </div>
            ) : isGenerating ? (
              /* ── Live AI thinking panel ── */
              <div className="h-full min-h-[400px] rounded-xl border border-cyan-500/[0.18] bg-white/[0.02] overflow-hidden relative shadow-[0_0_60px_-12px_rgba(56,189,248,0.2)]">
                {/* Animated top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent thinking-scan" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-cyan-400/80">Generating</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          thinkingPhase >= i ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Thinking lines */}
                <div className="p-6 space-y-3">
                  {THINKING_PHRASES.map((phrase, idx) => {
                    const phaseNum = idx + 1;
                    const isActive = thinkingPhase === phaseNum;
                    const isDone = thinkingPhase > phaseNum;
                    const words = phrase.split(' ');
                    return (
                      <div
                        key={phrase}
                        className={`flex items-start gap-3 transition-all duration-400 ${
                          isActive ? 'opacity-100' : isDone ? 'opacity-40' : 'opacity-10'
                        }`}
                      >
                        <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? 'border-emerald-500/40 bg-emerald-500/10'
                            : isActive
                            ? 'border-cyan-500/40 bg-cyan-500/10'
                            : 'border-white/[0.08] bg-transparent'
                        }`}>
                          {isDone && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
                          {isActive
                            ? words.slice(0, thinkingWords).join(' ')
                            : isDone
                            ? phrase
                            : ''}
                          {isActive && thinkingWords < words.length && (
                            <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-cyan-300/90 animate-pulse" />
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Filler skeleton lines */}
                <div className="px-6 space-y-2.5">
                  {[60, 80, 45, 70, 55].map((w, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full bg-white/[0.04] animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="preview-placeholder-shimmer group h-full min-h-[400px] rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/[0.18] hover:shadow-[0_8px_50px_-8px_rgba(56,189,248,0.18)]">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Output Preview</span>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] transition-colors duration-300 ${hasAnyInput ? 'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-300' : 'border-white/[0.08] bg-white/[0.04] text-zinc-500'}`}>
                    {hasAnyInput ? 'Live preview' : 'Preview example'}
                  </span>
                </div>

                {/* Preview cards — opacity-60 to indicate placeholder */}
                <div className="p-5 space-y-4 opacity-60">

                  {/* CV Description */}
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 transition-colors duration-300 group-hover:border-white/[0.1]">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-cyan-400/70" />
                      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">CV Description</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-zinc-300">
                      <span className="font-medium text-zinc-200">{previewName}</span> — {previewDesc.length > 110 ? previewDesc.slice(0, 110) + '…' : previewDesc} Built with {previewStack}.
                    </p>
                  </div>

                  {/* Interview Answer */}
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 transition-colors duration-300 group-hover:border-white/[0.1]">
                    <div className="mb-2 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400/70" />
                      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Interview Answer</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-zinc-300">
                      &ldquo;I built <span className="font-medium text-zinc-200">{previewName}</span> because {previewDesc.length > 80 ? previewDesc.slice(0, 80).toLowerCase() + '…' : previewDesc.toLowerCase()} I used {previewStack} to ship a production-ready solution.&rdquo;
                    </p>
                  </div>

                  {/* LinkedIn Post */}
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 transition-colors duration-300 group-hover:border-white/[0.1]">
                    <div className="mb-2 flex items-center gap-2">
                      <Linkedin className="h-3.5 w-3.5 text-blue-400/70" />
                      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">LinkedIn Post</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-zinc-300">
                      Just shipped <span className="font-medium text-zinc-200">{previewName}</span>. {previewDesc.length > 90 ? previewDesc.slice(0, 90) + '…' : previewDesc} Stack: {previewStack}. #buildinpublic #webdev
                    </p>
                  </div>
                </div>

                {/* Bottom gradient + hint text */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 pb-5 pt-12 text-center">
                  <p className="text-[12px] text-zinc-500">
                    {hasAnyInput ? 'Click Generate Pitch to get your full structured content' : 'Start typing to see your pitch take shape'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Example Projects (when no results) */}
        {!hasGenerated && (
          <div className="mt-12">
            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                Quick Start
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">
                Start with a real project
              </h2>
              <p className="mt-1 text-sm text-zinc-600">Select a project to auto-fill the generator.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exampleProjects.slice(0, 6).map((project, idx) => {
                const isLoaded = loadedExampleId === project.id;
                const isFlashing = flashingId === project.id;
                const typeToProjectType = (t: string): ProjectType =>
                  t === 'SaaS' ? 'saas' : t === 'AI Tool' ? 'ai-tool' : t === 'E-commerce' ? 'ecommerce' : t === 'Dashboard' ? 'dashboard' : 'other';
                return (
                  <button
                    key={project.id}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => {
                      setFlashingId(project.id);
                      setTimeout(() => setFlashingId(null), 320);
                      setForm({
                        name: project.name,
                        description: project.cvLine.split(', ').slice(1).join(', '),
                        techStack: project.stack.join(', '),
                        projectType: typeToProjectType(project.type),
                        tone: 'professional',
                      });
                      setLoadedExampleId(project.id);
                      setInputGlow(true);
                      setTimeout(() => setInputGlow(false), 1200);
                      setTimeout(() => {
                        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 60);
                    }}
                    className={`example-card-enter premium-hover-card group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-[250ms] ease-out ${
                      isFlashing
                        ? 'border-cyan-400/60 bg-cyan-400/[0.08] shadow-[0_0_30px_-4px_rgba(34,211,238,0.4)]'
                        : isLoaded
                        ? 'border-cyan-500/30 bg-cyan-500/[0.05] shadow-[0_0_40px_-8px_rgba(34,211,238,0.25)] -translate-y-1'
                        : 'border-white/[0.07] bg-white/[0.02] hover:bg-gradient-to-br hover:from-cyan-500/[0.04] hover:to-blue-600/[0.04]'
                    }`}
                  >
                    {/* Radial glow corner */}
                    <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-cyan-400/[0.06] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top row: type badge + loaded badge */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {project.type}
                      </span>
                      {isLoaded && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-[10px] text-emerald-300">
                          <Check className="h-2.5 w-2.5" />
                          Loaded
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      {project.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-600 group-hover:text-zinc-400 group-hover:bg-white/[0.07] transition-colors">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Hover CTA */}
                    <div className="mt-3 flex items-center gap-1 overflow-hidden h-0 opacity-0 group-hover:h-5 group-hover:opacity-100 transition-all duration-200">
                      <span className="text-[11px] text-cyan-400">Click to generate pitch</span>
                      <ChevronRight className="h-3 w-3 text-cyan-400 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
