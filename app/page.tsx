'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Starfield } from '@/components/starfield';
import { exampleProjects } from '@/lib/examples';
import { ArrowRight, FileText, Linkedin, MessageSquare, Briefcase, Copy, Check, X, ChevronRight, Sparkles, Mic, Clock, CircleHelp as HelpCircle, Code as Code2, FolderOpen, Globe, Zap, ChevronDown } from 'lucide-react';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Flash effect on Transform click ─── */
function useFlashTransform() {
  const [flash, setFlash] = useState(false);
  const trigger = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }, []);
  return { flash, trigger };
}

/* ─── Rotating placeholder ─── */
function useRotatingPlaceholder(phrases: string[], interval = 3000) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const phrase = phrases[index];
    if (isTyping) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex++;
        setDisplayText(phrase.slice(0, charIndex));
        if (charIndex >= phrase.length) {
          clearInterval(typeInterval);
          setTimeout(() => { setIsTyping(false); }, 1500);
        }
      }, 40);
      return () => clearInterval(typeInterval);
    } else {
      let charIndex = phrase.length;
      const deleteInterval = setInterval(() => {
        charIndex--;
        setDisplayText(phrase.slice(0, charIndex));
        if (charIndex <= 0) {
          clearInterval(deleteInterval);
          setIndex((prev) => (prev + 1) % phrases.length);
          setIsTyping(true);
        }
      }, 25);
      return () => clearInterval(deleteInterval);
    }
  }, [index, isTyping, phrases]);

  return displayText;
}

/* ─── Live Output Preview Card (hero right column) ─── */
function HeroOutputPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  const outputs = [
    {
      id: 'cv',
      label: 'CV Output',
      badge: 'Recruiter-ready',
      badgeClass: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10',
      short: 'CV',
      content: (
        <p className="text-[12px] leading-relaxed text-zinc-400">
          Built InvoiceFlow Play, a SaaS billing platform handling subscription lifecycle and plan upgrades.
          Integrated Stripe webhooks with <span className="text-cyan-300 font-medium">idempotency keys</span> and fixed a concurrent update race condition using <span className="text-emerald-300 font-medium">optimistic locking</span>.
        </p>
      ),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Post',
      badge: 'Strong post',
      badgeClass: 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10',
      short: 'LinkedIn',
      content: (
        <p className="text-[12px] leading-relaxed text-zinc-400 whitespace-pre-line">
          Shipped InvoiceFlow Play, a billing platform built from scratch.{`\n\n`}
          The hardest bug: two concurrent plan changes corrupting state. Resolved with <span className="text-cyan-300 font-medium">versioned writes</span> and conflict retries, cutting billing incidents by <span className="text-emerald-300 font-medium">~80%</span>.
        </p>
      ),
    },
    {
      id: 'interview',
      label: 'Interview Answer',
      badge: 'Strong answer',
      badgeClass: 'text-amber-300 border-amber-500/20 bg-amber-500/10',
      short: 'Interview',
      content: (
        <p className="text-[12px] leading-relaxed text-zinc-400">
          I built InvoiceFlow Play because Stripe gives payment primitives but not subscription business logic.
          The tricky part was a race condition on upgrades, so I built reproduction tooling and fixed it with <span className="text-cyan-300 font-medium">optimistic concurrency control</span>, which made upgrades reliable and reduced manual fixes.
        </p>
      ),
    },
  ];

  const particles = [
    { left: '14%', top: '22%', size: 2, factor: 10 },
    { left: '80%', top: '30%', size: 1.5, factor: 14 },
    { left: '70%', top: '68%', size: 2.5, factor: 8 },
    { left: '26%', top: '72%', size: 1.5, factor: 12 },
    { left: '56%', top: '52%', size: 2, factor: 9 },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseParallax({ x, y });
  };

  const resetParallax = () => setMouseParallax({ x: 0, y: 0 });

  const cardTransform = `perspective(1200px) rotateX(${(-mouseParallax.y * 4).toFixed(2)}deg) rotateY(${(mouseParallax.x * 5).toFixed(2)}deg) scale(${isHovering ? 1.01 : 1})`;

  return (
    <div
      className="preview-slide-in relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        resetParallax();
      }}
    >
      <div className="hero-preview-ambient pointer-events-none absolute -inset-7 -z-10 rounded-[30px]" />

      <div
        ref={cardRef}
        className="relative rounded-2xl border border-white/[0.14] bg-white/[0.06] backdrop-blur-xl overflow-hidden transition-transform duration-300 ease-out shadow-[0_30px_84px_-22px_rgba(0,0,0,0.78),0_14px_40px_-18px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_36px_rgba(34,211,238,0.08)]"
        style={{ transform: cardTransform }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.08),transparent_48%)]" />

        {particles.map((p, idx) => (
          <span
            key={idx}
            className="pointer-events-none absolute rounded-full bg-cyan-300/30"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              transform: `translate(${mouseParallax.x * p.factor}px, ${mouseParallax.y * p.factor}px)`,
              transition: 'transform 220ms ease-out',
              filter: 'blur(0.2px)',
            }}
          />
        ))}

        {/* Window chrome */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-white/[0.015]">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
            </div>
            <span className="text-[11px] text-zinc-600 font-mono">live output simulation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-emerald-500/80">updating</span>
          </div>
        </div>

        <div className="relative z-10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{outputs[activeIndex].label}</span>
            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${outputs[activeIndex].badgeClass}`}>{outputs[activeIndex].badge}</span>
          </div>

          <div className="relative min-h-[118px]">
            {outputs.map((item, idx) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  idx === activeIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-white/[0.06] px-4 py-3 flex items-center justify-between bg-white/[0.01]">
          <span className="text-[10px] text-zinc-700 font-mono">InvoiceFlow Play · SaaS</span>
          <div className="flex gap-1">
            {outputs.map((item, idx) => (
              <span
                key={item.id}
                className={`rounded px-1.5 py-0.5 text-[9px] transition-colors duration-300 ${
                  idx === activeIndex
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'bg-white/[0.04] text-zinc-700'
                }`}
              >
                {item.short}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transformRipple, setTransformRipple] = useState(false);
  const { flash, trigger: triggerFlash } = useFlashTransform();
  const heroSectionRef = useRef<HTMLElement>(null);
  const cursorLightRef = useRef<HTMLDivElement>(null);
  const previewDesktopWrapRef = useRef<HTMLDivElement>(null);
  const previewMobileWrapRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const currentRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const heroPlaceholder = useRotatingPlaceholder([
    'Built a billing system with Stripe, ran into race conditions...',
    'Made an AI planner that turns rough ideas into task lists...',
    'Built a headless Shopify storefront from the API up...',
    'Created a real-time infra dashboard, browser was choking on data...',
  ], 3500);

  const handleTransform = useCallback(() => {
    if (isGenerating || isTransitioning) return;
    triggerFlash();
    setIsGenerating(true);
    setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => router.push('/generate'), 500);
    }, 1050);
  }, [router, triggerFlash, isGenerating, isTransitioning]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTransform();
  };

  useEffect(() => {
    const section = heroSectionRef.current;
    if (!section) return;

    const particleStrength = [11, 16, 8, 13, 10];

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.px += (target.px - current.px) * 0.14;
      current.py += (target.py - current.py) * 0.14;

      particleRefs.current.forEach((el, idx) => {
        if (!el) return;
        const strength = particleStrength[idx] ?? 10;
        el.style.transform = `translate3d(${current.x * strength}px, ${current.y * strength}px, 0)`;
      });

      [previewDesktopWrapRef.current, previewMobileWrapRef.current].forEach((el) => {
        if (!el) return;
        // Opposite-direction drift for depth
        el.style.transform = `translate3d(${current.x * -7}px, ${current.y * -7}px, 0)`;
      });

      if (cursorLightRef.current) {
        cursorLightRef.current.style.transform = `translate3d(${current.px - 180}px, ${current.py - 180}px, 0)`;
      }

      const moving =
        Math.abs(target.x - current.x) > 0.002 ||
        Math.abs(target.y - current.y) > 0.002 ||
        Math.abs(target.px - current.px) > 0.25 ||
        Math.abs(target.py - current.py) > 0.25;

      if (moving) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      targetRef.current.x = ((relX / rect.width) - 0.5) * 2;
      targetRef.current.y = ((relY / rect.height) - 0.5) * 2;
      targetRef.current.px = relX;
      targetRef.current.py = relY;
      if (cursorLightRef.current) cursorLightRef.current.style.opacity = '0.92';
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(animate);
    };

    const onLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      const rect = section.getBoundingClientRect();
      targetRef.current.px = rect.width * 0.56;
      targetRef.current.py = rect.height * 0.38;
      if (cursorLightRef.current) cursorLightRef.current.style.opacity = '0';
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(animate);
    };

    const rect = section.getBoundingClientRect();
    targetRef.current.px = rect.width * 0.56;
    targetRef.current.py = rect.height * 0.38;
    currentRef.current.px = targetRef.current.px;
    currentRef.current.py = targetRef.current.py;

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);

    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={heroSectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layered depth background */}
      <div className="absolute inset-0 -z-10">
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_38%,transparent_25%,rgba(0,0,0,0.6)_100%)]" />
        {/* Core glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[1100px] rounded-full bg-blue-950/45 blur-[180px]" />
        {/* Cyan accent */}
        <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cyan-950/20 blur-[140px]" />
        {/* Left accent */}
        <div className="absolute left-[10%] top-1/2 h-[350px] w-[350px] rounded-full bg-indigo-950/20 blur-[110px]" />
      </div>

      {/* Soft cursor-following light */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div
          ref={cursorLightRef}
          className="absolute h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),rgba(59,130,246,0.08)_40%,transparent_72%)] blur-3xl opacity-0"
          style={{ transition: 'opacity 260ms ease-out', willChange: 'transform, opacity' }}
        />
      </div>

      {/* Hero background particles with subtle parallax */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        {[
          { left: '11%', top: '26%', size: '3px' },
          { left: '82%', top: '22%', size: '2px' },
          { left: '74%', top: '63%', size: '2.5px' },
          { left: '20%', top: '74%', size: '2px' },
          { left: '52%', top: '57%', size: '2.5px' },
        ].map((p, idx) => (
          <span
            key={idx}
            ref={(el) => { particleRefs.current[idx] = el; }}
            className="absolute rounded-full bg-cyan-200/30"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size, filter: 'blur(0.2px)', willChange: 'transform' }}
          />
        ))}
      </div>

      {/* Flash overlay */}
      {flash && (
        <div className="fixed inset-0 z-[90] pointer-events-none">
          <div className="absolute inset-0 bg-cyan-400/5 animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        </div>
      )}

      {/* Cinematic transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      <div className="relative z-10 w-full mx-auto max-w-6xl px-6 pt-28 pb-12">
        <div className="grid lg:grid-cols-[1fr_370px] gap-12 xl:gap-20 items-center">

          {/* ── Left: headline + input ── */}
          <div className="hero-fade-in relative">
            <div className="pointer-events-none absolute -left-16 -top-14 h-[320px] w-[420px] rounded-full bg-[radial-gradient(circle_at_42%_40%,rgba(34,211,238,0.22),rgba(59,130,246,0.14)_42%,transparent_74%)] blur-2xl" />
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-[11px] text-zinc-400 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Your developer pitch workspace
            </div>

            <h1 className="text-[2.6rem] font-bold tracking-tight leading-[1.06] sm:text-5xl lg:text-[3.25rem]">
              <span className="bg-gradient-to-b from-white via-white/90 to-zinc-500 bg-clip-text text-transparent">Your projects are better than your CV.</span>
              <br />
              <span className="text-shimmer">Prove it in one minute.</span>
            </h1>

            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-zinc-500">
              Paste rough notes and get a sharp CV line, a credible LinkedIn post, and an interview answer that sounds like an engineer who actually shipped.
            </p>

            {/* Input bar */}
            <div className="mt-8 max-w-xl">
              <div className="hero-command-bar group relative flex items-center rounded-xl border border-white/[0.09] bg-black/30 backdrop-blur-xl shadow-[0_14px_42px_-24px_rgba(0,0,0,0.9),0_0_64px_-18px_rgba(56,189,248,0.26)] transition-all duration-300 focus-within:border-cyan-500/35 focus-within:bg-white/[0.04] focus-within:scale-[1.01]">
                <div className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 bg-gradient-to-r from-cyan-500/[0.15] via-indigo-500/[0.08] to-violet-500/[0.16] pointer-events-none" />
                <span className="ml-3 mr-1 inline-flex h-6 items-center rounded-md border border-cyan-500/20 bg-cyan-500/[0.08] px-2 text-[10px] font-medium uppercase tracking-wider text-cyan-300 font-mono">
                  /pitch
                </span>
                <span className="hero-command-cursor pointer-events-none h-3.5 w-[2px] rounded-full bg-cyan-300/90" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={heroPlaceholder || 'Describe a project you built...'}
                  className="relative z-10 w-full bg-transparent px-2 py-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setTransformRipple(true);
                    setTimeout(() => setTransformRipple(false), 430);
                    handleTransform();
                  }}
                  disabled={isGenerating || isTransitioning}
                  className={`btn-hero-transform group/transform relative z-10 mr-2 flex h-8 min-w-[120px] items-center justify-center gap-1.5 rounded-xl px-4 text-xs${isGenerating ? ' btn-loading' : ''}`}
                >
                  {transformRipple && !isGenerating && <span className="btn-hero-ripple" />}
                  {isGenerating ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                      Generating…
                    </>
                  ) : (
                    <><Sparkles className="h-3 w-3" /> Transform <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover/transform:translate-x-0.5" /></>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <Link href="/generate" className="group/cta inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-all hover:text-white">
                  Build My Pitch
                  <ChevronRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
                <span className="h-3 w-px bg-zinc-800" />
                <button
                  onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group/cta inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-all hover:text-white"
                >
                  See Example
                  <ChevronRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['CV line', 'LinkedIn post', 'Interview answer', 'Portfolio copy'].map((pill) => (
                  <span key={pill} className="inline-flex items-center rounded-full border border-cyan-500/18 bg-cyan-500/[0.08] px-2.5 py-1 text-[10px] font-medium text-cyan-200 shadow-[0_0_16px_-10px_rgba(34,211,238,0.65)]">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: desktop preview card ── */}
          <div ref={previewDesktopWrapRef} className="hidden lg:block relative" style={{ willChange: 'transform' }}>
            <div className="pointer-events-none absolute -inset-4 rounded-[30px] border border-cyan-500/10" />
            <svg className="pointer-events-none absolute -inset-10 h-[480px] w-[480px] text-cyan-400/22" viewBox="0 0 480 480" fill="none" aria-hidden="true">
              <path d="M52 320C78 242 142 174 224 146C306 118 388 130 438 186" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="4 8" />
            </svg>

            <div className="hero-float-tag absolute -left-16 top-10 opacity-85">
              <div className="pointer-events-none absolute left-full top-1/2 h-px w-10 -translate-y-1/2 bg-gradient-to-r from-cyan-400/40 to-transparent" />
              <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-[10px] font-medium text-zinc-300 backdrop-blur-sm shadow-[0_0_16px_-10px_rgba(34,211,238,0.5)]">CV-ready</span>
            </div>
            <div className="hero-float-tag absolute -right-20 top-[126px] opacity-80" style={{ animationDelay: '0.45s' }}>
              <div className="pointer-events-none absolute right-full top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-l from-cyan-400/40 to-transparent" />
              <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-[10px] font-medium text-zinc-300 backdrop-blur-sm shadow-[0_0_16px_-10px_rgba(34,211,238,0.5)]">Interview-ready</span>
            </div>
            <div className="hero-float-tag absolute -left-12 bottom-8 opacity-82" style={{ animationDelay: '0.9s' }}>
              <div className="pointer-events-none absolute left-full top-1/2 h-px w-9 -translate-y-1/2 bg-gradient-to-r from-cyan-400/40 to-transparent" />
              <span className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-[10px] font-medium text-zinc-300 backdrop-blur-sm shadow-[0_0_16px_-10px_rgba(34,211,238,0.5)]">Recruiter-friendly</span>
            </div>

            <HeroOutputPreview />
          </div>
        </div>

        {/* Mobile preview card */}
        <div ref={previewMobileWrapRef} className="lg:hidden mt-10" style={{ willChange: 'transform' }}>
          <HeroOutputPreview />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-zinc-500">
        <span className="hero-scroll-hint text-[11px] tracking-wide">Scroll to see examples</span>
        <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
      </div>
    </section>
  );
}

/* ─── Workspace Demo ─── */
function WorkspaceDemo() {
  const { ref, visible } = useInView();
  const rawNotes = `built a billing thing\nhandles subscriptions\nstripe integration\nusers can manage plans\ngot webhooks working\nfixed race conditions`;
  const steps = [{ num: '01', label: 'Clarify impact' }, { num: '02', label: 'Add technical depth' }, { num: '03', label: 'Package for recruiters' }];
  const polished = `Built InvoiceFlow Play, a SaaS billing platform handling subscription lifecycle and plan upgrades. Integrated Stripe webhooks with idempotency keys and resolved a concurrent update race condition using optimistic locking in PostgreSQL.`;

  return (
    <section className="py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">How It Works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Rough notes to recruiter-ready</h2>
        </div>
        <div className={`grid gap-0 md:grid-cols-[1fr_auto_1fr] transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 md:rounded-r-none md:border-r-0">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Raw Notes</span>
            </div>
            <div className="space-y-1.5 font-mono text-[13px] text-zinc-600 leading-relaxed">
              {rawNotes.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center gap-3 px-4 py-5">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[10px] font-mono font-bold text-zinc-400">{step.num}</div>
                <span className="text-[10px] text-zinc-600 whitespace-nowrap">{step.label}</span>
                {i < steps.length - 1 && <div className="h-6 w-px bg-gradient-to-b from-white/[0.08] to-transparent" />}
              </div>
            ))}
          </div>
          <div className="mt-4 md:mt-0 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5 md:rounded-l-none md:border-l-0">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-emerald-500/70">Interview-Ready</span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-300">{polished}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['CV', 'LinkedIn', 'Interview', 'Portfolio'].map((tag) => (
                <span key={tag} className="rounded-md bg-white/[0.04] border border-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Interview Impact ─── */
function InterviewImpact() {
  const { ref, visible } = useInView();
  const [showModal, setShowModal] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStep, setTransformStep] = useState(0);
  const [revealedLineCount, setRevealedLineCount] = useState(0);
  const [showStructuredFeedback, setShowStructuredFeedback] = useState(false);

  const before = "I made a dashboard with login and charts.";
  const after = "I built a role-based analytics dashboard with authentication, protected routes, and reusable data views. The main challenge was turning raw user activity into clear visual insights without making the interface feel overloaded.";
  const interviewAnswer = `So the project I'm most proud of is an analytics dashboard I built for our team. The problem was that we had all this user activity data sitting in logs, but nobody could actually see what was happening without asking an engineer to run a query.

I designed the whole thing — the data pipeline, the API layer, and the frontend. The stack is Next.js with a Node backend and PostgreSQL. I went with role-based access early because I knew different teams needed different views — support needed user-level detail, execs needed aggregate trends.

The hardest part was the data visualization. We were pulling thousands of events per minute and the initial version just... lagged. I had to implement downsampling on the backend and windowed rendering on the frontend. Once I got that right, the dashboard went from a cool prototype to something people actually used daily.

The result: three teams adopted it within the first month, and it cut our "can someone pull this data" requests by about 80%.`;
  const technicalDepthPoints = [
    "Implemented JWT-based auth with role middleware on both API and UI routes",
    "Built a downsampling layer that aggregates minute-level data into hourly/daily views",
    "Used virtualized rendering for charts with 10k+ data points",
    "Designed a reusable chart component system with shared tooltip and zoom behavior",
  ];
  const followUpQuestions = [
    "How did you handle the initial data modeling?",
    "What would you change if you had to scale to 10x the users?",
    "How did you decide between server-side and client-side rendering for the charts?",
    "What trade-offs did you make between real-time updates and performance?",
    "How did you onboard other teams onto the dashboard?",
  ];
  const transformationSteps = [
    'Analyzing your answer...',
    'Improving clarity...',
    'Adding technical depth...',
    'Refining impact...',
  ];
  const improvedPreviewLines = [
    <>I built a role-based analytics dashboard because our teams lacked <strong className="font-semibold text-zinc-100">a shared view of user behavior</strong>.</>,
    <>I implemented Next.js, Node, and PostgreSQL, then added <strong className="font-semibold text-zinc-100">downsampling</strong> and <strong className="font-semibold text-zinc-100">virtualized charts</strong> to handle heavy event volume.</>,
    <>That rollout drove adoption across three teams and cut ad-hoc data requests by <span className="font-semibold text-emerald-300 animate-pulse">about 80%</span>.</>,
  ];
  const improvedAnswer = {
    problem: 'Our teams had high-volume product data, but no shared view of behavior without asking engineering for one-off queries.',
    solution: 'I built a role-based analytics dashboard in Next.js, Node, and PostgreSQL, then added downsampling and virtualized chart rendering to keep performance stable under heavy event volume.',
    result: 'The dashboard was adopted by three teams in the first month and reduced ad-hoc data pull requests by about 80%.',
  };

  const formatSeconds = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!showModal) {
      setIsYourTurn(false);
      setSecondsLeft(60);
      setUserAnswer('');
      setShowFeedback(false);
      setIsTransforming(false);
      setTransformStep(0);
      setRevealedLineCount(0);
      setShowStructuredFeedback(false);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal || !isYourTurn || showFeedback || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showModal, isYourTurn, showFeedback, secondsLeft]);

  useEffect(() => {
    if (!isTransforming) return;

    setTransformStep(0);
    const step1 = setTimeout(() => setTransformStep(1), 500);
    const step2 = setTimeout(() => setTransformStep(2), 1000);
    const step3 = setTimeout(() => setTransformStep(3), 1500);

    const revealStart = setTimeout(() => {
      let line = 0;
      const revealInterval = setInterval(() => {
        line += 1;
        setRevealedLineCount(line);
        if (line >= improvedPreviewLines.length) {
          clearInterval(revealInterval);
        }
      }, 180);
    }, 1200);

    const done = setTimeout(() => {
      setIsTransforming(false);
      setShowStructuredFeedback(true);
    }, 1900);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(revealStart);
      clearTimeout(done);
    };
  }, [isTransforming, improvedPreviewLines.length]);

  const getPersonalizedFeedback = () => {
    const trimmed = userAnswer.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;

    if (words < 24) {
      return {
        summary: 'Your answer is too short. Try explaining the problem and your role.',
        notes: [
          'Start with the context before jumping to tools.',
          'Make your ownership explicit in one sentence.',
          'End with a concrete result, even if it is directional.',
        ],
      };
    }

    if (words < 75) {
      return {
        summary: 'Good start, but add more technical detail and impact.',
        notes: [
          'You explained the problem clearly, but your solution felt rushed.',
          'Name one technical decision and why it mattered.',
          'Add a measurable outcome to make the ending stronger.',
        ],
      };
    }

    return {
      summary: 'Strong structure. Improve clarity and tighten the ending.',
      notes: [
        'Nice technical detail, but simplify wording in the middle section.',
        'Keep one challenge and one fix so the story stays crisp.',
        'Strong answer. Add measurable impact in the final line.',
      ],
    };
  };

  const personalizedFeedback = getPersonalizedFeedback();

  return (
    <section className="py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Interview Impact</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Built for the moment recruiters ask:</h2>
          <p className="mt-1 text-lg text-zinc-400 italic">&ldquo;Tell me about this project.&rdquo;</p>
        </div>
        <div className={`grid gap-4 md:grid-cols-2 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-zinc-600" /><span className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Before</span></div>
            <p className="text-sm text-zinc-600 italic">&ldquo;{before}&rdquo;</p>
          </div>
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5">
            <div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" /><span className="text-[11px] font-medium uppercase tracking-widest text-emerald-500/70">After</span></div>
            <p className="text-sm text-zinc-300">&ldquo;{after}&rdquo;</p>
          </div>
        </div>
        <div className={`mt-6 text-center transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button onClick={() => setShowModal(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 text-xs font-medium text-zinc-300 transition-all hover:bg-white/[0.06] hover:shadow-[0_0_24px_rgba(56,189,248,0.08)] active:scale-[0.96]">
            <Mic className="h-3.5 w-3.5" /> Practice this answer
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="pricing-overlay-fade absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="pricing-modal-pop relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-cyan-500/[0.24] bg-zinc-950/90 backdrop-blur-xl shadow-[0_18px_80px_-16px_rgba(56,189,248,0.32)]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-md px-6 py-4">
              <div className="flex items-center gap-2"><Mic className="h-4 w-4 text-cyan-400" /><h3 className="text-sm font-semibold">Interview Practice</h3></div>
              <button onClick={() => setShowModal(false)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-cyan-500/[0.16] bg-cyan-500/[0.04] p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Live Interview Mode</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.1] px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Simulated recruiter question
                  </span>
                </div>
                <p className="text-sm text-zinc-200">&ldquo;Tell me about this project.&rdquo;</p>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan-400" /><p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">60-Second Answer Framework</p></div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Problem</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">Our teams had high-volume activity logs but no shared view of product behavior without manual queries.</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Solution</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">Built a role-based analytics dashboard with scoped views, reusable chart modules, and protected routes.</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Challenge</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">Rendering thousands of events per minute caused lag until downsampling and windowed rendering were introduced.</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600">Result</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">Three teams adopted the dashboard in month one, reducing ad-hoc data pull requests by roughly 80%.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Your Turn</p>
                  {!isYourTurn && (
                    <button
                      onClick={() => {
                        setIsYourTurn(true);
                        setSecondsLeft(60);
                        setShowFeedback(false);
                        setIsTransforming(false);
                        setTransformStep(0);
                        setRevealedLineCount(0);
                        setShowStructuredFeedback(false);
                      }}
                      className="btn-glass inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px]"
                    >
                      Try answering yourself
                    </button>
                  )}
                </div>

                {isYourTurn && (
                  <>
                    <div className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-2">
                      <span className="text-[11px] text-zinc-300">Countdown</span>
                      <span className="font-mono text-sm font-semibold text-cyan-300">{formatSeconds(secondsLeft)}</span>
                    </div>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Start your 60-second answer..."
                      rows={4}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-cyan-500/40 transition-colors resize-none"
                    />
                    {!showFeedback && (
                      <button
                        onClick={() => {
                          setShowFeedback(true);
                          setShowStructuredFeedback(false);
                          setRevealedLineCount(0);
                          setIsTransforming(true);
                        }}
                        className="btn-cta inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[11px]"
                      >
                        Get Feedback
                      </button>
                    )}
                  </>
                )}

                {showFeedback && isTransforming && !showStructuredFeedback && (
                  <div className="rounded-lg border border-cyan-500/[0.2] bg-cyan-500/[0.04] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-300">Live transformation preview</p>
                      <span className="text-[11px] text-zinc-400">{transformationSteps[transformStep]}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 opacity-65">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600">Original</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-400 whitespace-pre-line">{userAnswer || 'Your answer will appear here...'}</p>
                      </div>
                      <div className="rounded-md border border-cyan-500/20 bg-black/[0.3] p-3">
                        <p className="text-[10px] uppercase tracking-widest text-cyan-300">Improved Version</p>
                        <div className="mt-1 space-y-1.5 text-[12px] leading-relaxed text-zinc-200 min-h-[96px]">
                          {improvedPreviewLines.slice(0, revealedLineCount).map((line, idx) => (
                            <p key={idx} className="animate-in fade-in duration-200">{line}</p>
                          ))}
                          {revealedLineCount < improvedPreviewLines.length && <span className="inline-block h-4 w-[2px] bg-cyan-300/80 animate-pulse" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showFeedback && showStructuredFeedback && (
                  <div className="rounded-lg border border-cyan-500/[0.2] bg-cyan-500/[0.04] p-4 space-y-3 transition-all duration-300 opacity-100 translate-y-0">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-300">Feedback from simulated interviewer</p>
                    <p className="text-[12px] leading-relaxed text-zinc-200">{personalizedFeedback.summary}</p>
                    <ul className="space-y-1.5 text-[12px] text-zinc-300">
                      {personalizedFeedback.notes.map((note) => (
                        <li key={note} className="flex items-start gap-2">
                          <span className="mt-1 h-1 w-1 rounded-full bg-cyan-400/70 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-md border border-white/[0.08] bg-black/[0.25] p-3 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">Improved version</p>
                      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-cyan-300">Problem</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{improvedAnswer.problem}</p>
                      </div>
                      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-cyan-300">Solution</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{improvedAnswer.solution}</p>
                      </div>
                      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-cyan-300">Result</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{improvedAnswer.result}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan-400" /><p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">60-Second Interview Answer</p></div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] leading-relaxed text-zinc-400 whitespace-pre-line">{interviewAnswer}</div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><Code2 className="h-3.5 w-3.5 text-cyan-400" /><p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Technical Depth Points</p></div>
                <ul className="space-y-2">{technicalDepthPoints.map((point) => (<li key={point} className="flex items-start gap-2 text-[13px] text-zinc-400"><span className="mt-1.5 h-1 w-1 rounded-full bg-cyan-400/60 shrink-0" />{point}</li>))}</ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><HelpCircle className="h-3.5 w-3.5 text-cyan-400" /><p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Follow-Up Questions Recruiters Might Ask</p></div>
                <ul className="space-y-2">{followUpQuestions.map((question) => (<li key={question} className="flex items-start gap-2 text-[13px] text-zinc-500 italic"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />{question}</li>))}</ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Example Gallery ─── */
function ExampleGallery() {
  const { ref, visible } = useInView();
  const [openId, setOpenId] = useState<string | null>(null);
  const openExample = exampleProjects.find((e) => e.id === openId);
  const featuredProjectId = exampleProjects[0]?.id;

  return (
    <section id="examples" className="py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Example Projects</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Real projects. Real outputs.</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-lg mx-auto">Click any card to see the full output — CV line, interview answer, elevator pitch, and LinkedIn post.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exampleProjects.map((project, i) => {
            const isFeatured = project.id === featuredProjectId;
            return (
            <div
              key={project.id}
              className={`premium-hover-card group relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-[250ms] ease-out ${
                isFeatured
                  ? 'border-cyan-500/[0.24] bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-indigo-500/[0.05] lg:scale-[1.03] shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_14px_44px_-14px_rgba(56,189,248,0.36)] hover:!-translate-y-2 hover:!scale-[1.04] hover:shadow-[0_0_34px_rgba(56,189,248,0.28),0_22px_58px_-14px_rgba(79,70,229,0.34)]'
                  : 'border-white/[0.07] bg-white/[0.025]'
              } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
              onClick={() => setOpenId(project.id)}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-blue-500/[0.03] rounded-2xl" />
              <div className="relative z-10 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-zinc-500">{project.type}</span>
                  {isFeatured && (
                    <span className="rounded-full border border-cyan-500/24 bg-cyan-500/[0.1] px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      Most Impactful
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {project.stack.slice(0, 2).map((tech) => (
                    <span key={tech} className="rounded-md bg-white/[0.04] border border-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-600">{tech}</span>
                  ))}
                  {project.stack.length > 2 && <span className="rounded-md bg-white/[0.04] border border-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-600">+{project.stack.length - 2}</span>}
                </div>
              </div>
              <h3 className="relative z-10 text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors duration-200">{project.name}</h3>
              <p className="relative z-10 mt-2 text-[12px] leading-relaxed text-zinc-500 line-clamp-2">{project.interviewPreview}</p>
              <div className="relative z-10 mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-zinc-400 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/[0.06] group-hover:text-cyan-400 transition-all duration-[250ms] ease-out group-hover:translate-x-0.5">
                  View pitch <ChevronRight className="h-3 w-3 transition-transform duration-[250ms] ease-out group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          )})}
        </div>
      </div>

      {openExample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpenId(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-md px-6 py-4">
              <div className="flex items-center gap-3"><span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-500">{openExample.type}</span><h3 className="text-sm font-semibold">{openExample.name}</h3></div>
              <button onClick={() => setOpenId(null)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">Stack</p>
                <div className="flex flex-wrap gap-1.5">{openExample.stack.map((tech) => (<span key={tech} className="rounded-md bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400">{tech}</span>))}</div>
              </div>
              <CopySection label="Rough Notes" content={openExample.roughNotes} mono />
              <CopySection label="CV Line" content={openExample.cvLine} />
              <CopySection label="Interview Answer" content={openExample.interviewPreview} />
              <CopySection label="Elevator Pitch" content={openExample.fullPitch.elevatorPitch} />
              <CopySection label="LinkedIn Post" content={openExample.fullPitch.linkedInDescription} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CopySection({ label, content, mono }: { label: string; content: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">{label}</p>
        <button onClick={handleCopy} className="flex h-6 items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 text-[10px] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300">
          {copied ? <><Check className="h-2.5 w-2.5" /> Copied</> : <><Copy className="h-2.5 w-2.5" /> Copy</>}
        </button>
      </div>
      <div className={`rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] leading-relaxed text-zinc-400 whitespace-pre-line ${mono ? 'font-mono text-zinc-600' : ''}`}>{content}</div>
    </div>
  );
}

/* ─── Output Formats ─── */
function OutputFormats() {
  const { ref, visible } = useInView();
  const formats = [
    {
      icon: FileText,
      label: 'CV Description',
      description: 'Ownership, impact, and technical depth — packed into one tight paragraph.',
      preview: 'Built InvoiceFlow Play, a SaaS billing platform handling subscription lifecycle and plan upgrades. Integrated Stripe webhooks with idempotency keys and resolved a race condition using optimistic locking in PostgreSQL.',
      accent: 'text-blue-400',
      iconBg: 'border-blue-500/[0.15] bg-blue-500/[0.07]',
      span: 'sm:col-span-2',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn Post',
      description: 'Hook, context, and what made it technically hard — structured to perform.',
      preview: "Shipped InvoiceFlow Play — a billing platform from scratch.\n\nStripe handles payments. It doesn't handle two requests hitting the same subscription at once...",
      accent: 'text-cyan-400',
      iconBg: 'border-cyan-500/[0.15] bg-cyan-500/[0.07]',
      span: 'sm:col-span-1',
    },
    {
      icon: MessageSquare,
      label: 'Interview Answer',
      description: 'STAR-format, specific, and honest. Ready to rehearse before a call.',
      preview: "The hardest bug was a race condition on plan upgrades. Two concurrent writes, no lock. I reproduced it with custom tooling, then fixed it with optimistic locking at the DB level...",
      accent: 'text-emerald-400',
      iconBg: 'border-emerald-500/[0.15] bg-emerald-500/[0.07]',
      span: 'sm:col-span-1',
    },
    {
      icon: Briefcase,
      label: 'Portfolio Copy',
      description: 'Plain-language description that makes sense to non-technical visitors and recruiters.',
      preview: 'A SaaS billing tool that handles the subscription edge cases Stripe leaves to you — plan changes, proration, concurrent conflicts, and a self-service portal.',
      accent: 'text-amber-400',
      iconBg: 'border-amber-500/[0.15] bg-amber-500/[0.07]',
      span: 'sm:col-span-2',
    },
  ];

  return (
    <section className="py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Output Formats</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">One project. Four channels.</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">Every generation ships content for every format — no rewriting, no reformatting.</p>
        </div>
        <div className={`grid gap-3 sm:grid-cols-3 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {formats.map((fmt, i) => (
            <div
              key={fmt.label}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:border-cyan-500/[0.18] hover:shadow-[0_12px_40px_-8px_rgba(56,189,248,0.13)] hover:-translate-y-1 ${fmt.span}`}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-transparent rounded-2xl" />
              <div className={`relative z-10 mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${fmt.iconBg} ${fmt.accent}`}>
                <fmt.icon className="h-4 w-4" />
              </div>
              <h3 className="relative z-10 text-sm font-semibold text-zinc-200">{fmt.label}</h3>
              <p className="relative z-10 mt-1 text-[12px] leading-relaxed text-zinc-600">{fmt.description}</p>
              <div className="relative z-10 mt-4 rounded-lg border border-white/[0.05] bg-black/[0.2] p-3">
                <p className="font-mono text-[11px] leading-[1.65] text-zinc-500 line-clamp-3 whitespace-pre-line">{fmt.preview}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Section ─── */
function PricingSection() {
  const { ref, visible } = useInView();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const tiers = [
    { name: 'Free MVP', price: '0', description: 'Generate pitches. No account needed.', features: ['Unlimited generation', 'All output formats', 'Copy to clipboard', 'Make It Stronger'], cta: 'Get Started', highlight: false, id: 'free' },
    { name: 'Pro Demo', price: '12', description: 'Save projects, customize tone, export as PDF.', features: ['Everything in Free', 'Saved project library', 'Custom tone profiles', 'PDF export', 'Priority generation'], cta: 'Try Pro', highlight: true, id: 'pro' },
    { name: 'Portfolio Ready', price: '29', description: 'Full portfolio site with your project pages.', features: ['Everything in Pro', 'Portfolio website', 'Custom domain', 'Analytics', 'Team sharing'], cta: 'Go Portfolio', highlight: false, id: 'portfolio' },
  ];

  const handleTierClick = (tier: typeof tiers[0]) => {
    setSelectedTier(tier.id);
    if (tier.id === 'free') {
      setTimeout(() => router.push('/generate'), 220);
    } else if (tier.id === 'pro') {
      setTimeout(() => setShowProModal(true), 160);
    } else if (tier.id === 'portfolio') {
      setTimeout(() => setShowPortfolioModal(true), 160);
    }
    setTimeout(() => setSelectedTier(null), 700);
  };

  return (
    <section className="py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Pricing</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Start free. Upgrade when you need.</h2>
          <p className="mt-2 text-sm text-zinc-500">No credit card required to get started.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 items-stretch">
          {tiers.map((tier, i) => (
            <div
              key={tier.id}
              onClick={() => handleTierClick(tier)}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
                selectedTier === tier.id
                  ? 'scale-[1.04] -translate-y-1.5 border-cyan-400/50 bg-white/[0.08] shadow-[0_0_46px_-4px_rgba(56,189,248,0.24)]'
                  : selectedTier
                    ? 'opacity-40 scale-[0.98]'
                    : tier.highlight
                      ? 'scale-[1.03] border-cyan-400/30 bg-white/[0.06] shadow-[0_0_44px_-12px_rgba(56,189,248,0.22),0_14px_34px_-16px_rgba(59,130,246,0.42)] hover:-translate-y-2 hover:border-cyan-300/45 hover:shadow-[0_0_56px_-12px_rgba(56,189,248,0.34),0_20px_46px_-16px_rgba(59,130,246,0.52)]'
                      : 'border-white/[0.08] bg-white/[0.02] hover:-translate-y-1.5 hover:border-cyan-400/26 hover:shadow-[0_14px_42px_-10px_rgba(56,189,248,0.18)]'
              } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 100}ms` : '0ms' }}
            >
              <div className={`pointer-events-none absolute inset-0 rounded-xl border opacity-100 ${
                tier.highlight
                  ? 'border-transparent bg-[linear-gradient(140deg,rgba(56,189,248,0.2),rgba(99,102,241,0.2),rgba(255,255,255,0.02))] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-px'
                  : 'border-transparent bg-[linear-gradient(140deg,rgba(56,189,248,0.14),rgba(99,102,241,0.1),rgba(255,255,255,0.01))] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-px'
              }`} />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-indigo-500/[0.08]" />
              {tier.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-0.5 text-[10px] font-semibold text-white shadow-[0_0_14px_rgba(56,189,248,0.45)]">Popular</div>}
              <h3 className={`relative z-10 ${tier.highlight ? 'text-base font-semibold text-white' : 'text-sm font-semibold text-zinc-100'}`}>{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={`font-bold ${tier.highlight ? 'text-4xl text-white' : 'text-3xl text-zinc-100'}`}>${tier.price}</span>
                <span className="text-xs text-zinc-500">/month</span>
              </div>
              <p className={`relative z-10 mt-2 text-[13px] ${tier.highlight ? 'text-zinc-300' : 'text-zinc-500'}`}>{tier.description}</p>
              <ul className="mt-4 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className={`relative z-10 flex items-start gap-2 text-[13px] ${tier.highlight ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" />{feature}
                  </li>
                ))}
              </ul>
              <div className={`relative z-10 mt-7 flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold tracking-wide ${
                tier.highlight
                  ? 'btn-cta'
                  : 'btn-glass'
              }`}>
                {tier.cta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowProModal(false)}>
          <div className="pricing-overlay-fade absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="pricing-modal-pop relative z-10 w-full max-w-lg rounded-2xl border border-cyan-500/[0.24] bg-zinc-950/90 backdrop-blur-xl shadow-[0_18px_80px_-16px_rgba(56,189,248,0.35)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2"><FolderOpen className="h-4 w-4 text-cyan-400" /><h3 className="text-sm font-semibold">Pro Demo</h3></div>
              <button onClick={() => setShowProModal(false)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-zinc-400">Upgrade your workflow with saved examples, polished exports, and faster generation.</p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Saved project library</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">PDF export</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Custom tone profiles</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Priority generation</span></div>
              </div>
              <Link href="/generate" className="btn-cta flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs">
                Try Pro Demo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPortfolioModal(false)}>
          <div className="pricing-overlay-fade absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="pricing-modal-pop relative z-10 w-full max-w-lg rounded-2xl border border-cyan-500/[0.24] bg-zinc-950/90 backdrop-blur-xl shadow-[0_18px_80px_-16px_rgba(56,189,248,0.35)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyan-400" /><h3 className="text-sm font-semibold">Portfolio Ready</h3></div>
              <button onClick={() => setShowPortfolioModal(false)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-zinc-400">Turn your generated content into recruiter-facing portfolio pages in one flow.</p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Generated portfolio project pages</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Custom domain ready</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Analytics preview</span></div>
                <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /><span className="text-xs text-zinc-300">Shareable recruiter link</span></div>
              </div>
              <Link href="/generate" className="btn-cta flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs">
                Generate Portfolio <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  const { ref, visible } = useInView();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { flash, trigger: triggerFlash } = useFlashTransform();

  const rotatingPlaceholder = useRotatingPlaceholder([
    'Built a billing tool with Stripe...',
    'Made an AI planner for tasks...',
    'Created a dashboard for monitoring...',
    'Built a community app for devs...',
  ], 4000);

  const handleTransform = useCallback(() => {
    triggerFlash();
    setIsTransitioning(true);
    setTimeout(() => router.push('/generate'), 500);
  }, [router, triggerFlash]);

  return (
    <section className="py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-3xl px-6">
        <div className={`relative overflow-hidden rounded-2xl border border-cyan-500/[0.16] p-10 md:p-16 text-center transition-all duration-700 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.14),rgba(59,130,246,0.07)_40%,rgba(255,255,255,0.01)_75%)] shadow-[0_0_52px_-14px_rgba(56,189,248,0.24),0_24px_60px_-28px_rgba(0,0,0,0.8)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Animated gradient glow behind card */}
          <div className="absolute -inset-1 -z-10 opacity-40">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 animate-pulse" />
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">You built it. Explain it before someone else gets the offer.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-300/85">
            Recruiters reject vague project descriptions in seconds. Turn your real engineering work into clear, credible proof before your next application.
          </p>

          <div className="mt-9 mx-auto w-full max-w-xl">
            <div className="group flex items-center rounded-xl border border-cyan-500/[0.14] bg-white/[0.04] backdrop-blur-md transition-all focus-within:border-cyan-400/30 focus-within:shadow-[0_0_76px_-14px_rgba(56,189,248,0.2)] focus-within:scale-[1.01]">
              <div className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
              <span className="pl-4 text-zinc-600 text-sm select-none relative z-10">$</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTransform()}
                  placeholder={rotatingPlaceholder}
                  className="relative z-10 w-full bg-transparent px-3 py-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
              <button
                onClick={handleTransform}
                disabled={isTransitioning}
                className="btn-cta relative z-10 mr-2 flex h-9 items-center gap-1.5 rounded-xl px-5 text-xs font-semibold shadow-[0_0_30px_-12px_rgba(56,189,248,0.45)]"
              >
                Transform <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {flash && (
        <div className="fixed inset-0 z-[90] pointer-events-none">
          <div className="absolute inset-0 bg-cyan-400/5 animate-ping" />
        </div>
      )}

      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}
    </section>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <HeroSection />
        <WorkspaceDemo />
        <InterviewImpact />
        <ExampleGallery />
        <OutputFormats />
        <PricingSection />
        <FinalCTA />
      </div>
    </main>
  );
}
