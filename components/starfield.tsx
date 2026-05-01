'use client';

import { useEffect, useRef } from 'react';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let comets: Comet[] = [];
    let stars: Star[] = [];
    let drifters: Drifter[] = [];
    let bursts: Burst[] = [];
    let nextCometTime = 0;
    let nextHeroTime = 0;
    let frameCount = 0;
    let screenFlash = 0;
    let activeHeroMeteor = false;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    class Star {
      x: number; y: number; baseX: number; baseY: number;
      size: number; baseOpacity: number; pulse: number; pulseSpeed: number;
      twinklePhase: number; twinkleSpeed: number; depth: number;
      r: number; g: number; b: number;

      constructor(w: number, h: number) {
        this.baseX = Math.random() * w; this.baseY = Math.random() * h;
        this.x = this.baseX; this.y = this.baseY;
        this.size = Math.random() * 1.5 + 0.15;
        this.baseOpacity = Math.random() * 0.45 + 0.05;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.006 + 0.001;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.03 + 0.008;
        this.depth = Math.random() * 0.6 + 0.4;
        this.r = Math.round(180 + Math.random() * 40);
        this.g = Math.round(195 + Math.random() * 40);
        this.b = 255;
      }

      update(mx: number, my: number) {
        this.pulse += this.pulseSpeed;
        this.twinklePhase += this.twinkleSpeed;
        const p = this.depth * 10;
        this.x = this.baseX + mx * p;
        this.y = this.baseY + my * p;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const tw = 0.25 + 0.75 * Math.pow(Math.sin(this.twinklePhase), 2);
        const pl = 0.6 + 0.4 * Math.sin(this.pulse);
        const op = this.baseOpacity * tw * pl;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.01, this.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${op})`;
        ctx.fill();
        if (this.size > 1.1 && op > 0.12) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(0.01, this.size * 3.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${op * 0.06})`;
          ctx.fill();
        }
      }
    }

    class Drifter {
      x: number; y: number; baseX: number; baseY: number;
      size: number; opacity: number; vx: number; vy: number; depth: number;
      r: number; g: number; b: number;

      constructor(w: number, h: number) {
        this.baseX = Math.random() * w; this.baseY = Math.random() * h;
        this.x = this.baseX; this.y = this.baseY;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.15 + 0.03;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.depth = Math.random() * 0.3 + 0.7;
        this.r = Math.round(160 + Math.random() * 60);
        this.g = Math.round(200 + Math.random() * 40);
        this.b = 255;
      }

      update(mx: number, my: number, w: number, h: number) {
        this.baseX += this.vx; this.baseY += this.vy;
        if (this.baseX < -20) this.baseX = w + 20;
        if (this.baseX > w + 20) this.baseX = -20;
        if (this.baseY < -20) this.baseY = h + 20;
        if (this.baseY > h + 20) this.baseY = -20;
        const p = this.depth * 12;
        this.x = this.baseX + mx * p;
        this.y = this.baseY + my * p;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.01, this.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.01, this.size * 4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.opacity * 0.04})`;
        ctx.fill();
      }
    }

    class Burst {
      particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; }[] = [];
      active = true;

      constructor(x: number, y: number) {
        const count = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
          const speed = Math.random() * 2 + 0.5;
          this.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: Math.random() * 30 + 20,
            size: Math.random() * 1.5 + 0.5,
          });
        }
      }

      update() {
        let alive = false;
        for (const p of this.particles) {
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.96; p.vy *= 0.96;
          p.life++;
          if (p.life < p.maxLife) alive = true;
        }
        this.active = alive;
      }

      draw(ctx: CanvasRenderingContext2D) {
        for (const p of this.particles) {
          const ratio = 1 - p.life / p.maxLife;
          const op = ratio * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.01, p.size * ratio), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,225,255,${op})`;
          ctx.fill();
        }
      }
    }

    class Comet {
      x = 0; y = 0; length = 0; speed = 0; angle = 0;
      opacity = 0; width = 0; life = 0; maxLife = 0;
      active = false; isHero = false;
      prevPositions: { x: number; y: number }[] = [];
      curvature = 0;

      constructor() { this.active = false; }

      spawn(w: number, h: number, isHero: boolean = false) {
        this.isHero = isHero;
        const fromTop = Math.random() > 0.3;
        if (fromTop) {
          this.x = Math.random() * w * 1.3 - w * 0.15;
          this.y = -30 - Math.random() * 120;
        } else {
          this.x = w + 30 + Math.random() * 120;
          this.y = Math.random() * h * 0.35;
        }

        if (isHero) {
          this.length = Math.random() * 180 + 150;
          this.speed = Math.random() * 2.4 + 4.8;
          this.opacity = Math.random() * 0.2 + 0.56;
          this.width = Math.random() * 1.2 + 1.2;
          this.maxLife = Math.random() * 130 + 120;
        } else {
          this.length = Math.random() * 160 + 80;
          this.speed = Math.random() * 5 + 2;
          this.opacity = Math.random() * 0.45 + 0.3;
          this.width = Math.random() * 1.5 + 0.6;
          this.maxLife = Math.random() * 200 + 80;
        }

        this.angle = (Math.PI / 4) + (Math.random() * 0.5 - 0.25);
        // Some meteors curve slightly
        this.curvature = (Math.random() - 0.5) * 0.003;
        this.life = 0;
        this.active = true;
        this.prevPositions = [];
      }

      update(w: number, h: number): boolean {
        if (!this.active) return false;
        this.prevPositions.push({ x: this.x, y: this.y });
        if (this.prevPositions.length > 8) this.prevPositions.shift();

        // Apply curvature
        this.angle += this.curvature;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life++;

        const lifeRatio = this.life / this.maxLife;
        if (lifeRatio > 0.65) this.opacity *= 0.975;

        if (this.life > this.maxLife || this.y > h + 200 || this.x > w + 300 || this.opacity < 0.005) {
          this.active = false;
          return this.isHero;
        }
        return false;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        // Wide soft glow trail
        const glowGrad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        glowGrad.addColorStop(0, `rgba(140,190,255,0)`);
        glowGrad.addColorStop(0.5, `rgba(140,190,255,${this.opacity * 0.06})`);
        glowGrad.addColorStop(1, `rgba(170,220,255,${this.opacity * 0.18})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = this.width * (this.isHero ? 18 : 9);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main trail
        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, `rgba(180,210,255,0)`);
        gradient.addColorStop(0.35, `rgba(180,215,255,${this.opacity * 0.15})`);
        gradient.addColorStop(0.7, `rgba(210,230,255,${this.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(240,248,255,${this.opacity * 0.9})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Motion blur
        if (this.prevPositions.length > 2) {
          for (let i = 0; i < this.prevPositions.length - 1; i++) {
            const p = this.prevPositions[i];
            const alpha = (i / this.prevPositions.length) * this.opacity * 0.15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.01, this.width * 1.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,220,255,${alpha})`;
            ctx.fill();
          }
        }

        // Head glow
        const headSize = this.isHero ? this.width * 5 : this.width * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.01, headSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,225,255,${this.opacity * 0.15})`;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.01, this.width * (this.isHero ? 1.5 : 0.8)), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity * 0.9})`;
        ctx.fill();
      }
    }

    // Initialize
    const starCount = Math.min(220, Math.floor((canvas.width * canvas.height) / 4500));
    for (let i = 0; i < starCount; i++) stars.push(new Star(canvas.width, canvas.height));
    const drifterCount = Math.min(16, Math.floor(starCount / 12));
    for (let i = 0; i < drifterCount; i++) drifters.push(new Drifter(canvas.width, canvas.height));
    for (let i = 0; i < 16; i++) comets.push(new Comet());

    nextCometTime = 10;
    nextHeroTime = 320;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Screen flash
      if (screenFlash > 0.005) {
        ctx.fillStyle = `rgba(180,210,255,${screenFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        screenFlash *= 0.92;
      }

      stars.forEach((s) => { s.update(mx, my); s.draw(ctx); });
      drifters.forEach((d) => { d.update(mx, my, canvas.width, canvas.height); d.draw(ctx); });

      // Spawn regular meteors — natural random cadence
      if (frameCount >= nextCometTime) {
        const inactiveList = comets.filter((c) => !c.active);
        if (inactiveList.length > 0) {
          inactiveList[0].spawn(canvas.width, canvas.height, false);
          // Occasionally spawn a second one right after for a shower effect
          if (inactiveList.length > 1 && Math.random() < 0.25) {
            setTimeout(() => { if (inactiveList[1] && !inactiveList[1].active) inactiveList[1].spawn(canvas.width, canvas.height, false); }, 120);
          }
        }
        nextCometTime = frameCount + Math.floor(Math.random() * 80) + 18;
      }

      // Spawn hero meteor
      if (frameCount >= nextHeroTime) {
        const inactive = comets.find((c) => !c.active);
        if (inactive && !activeHeroMeteor) {
          inactive.spawn(canvas.width, canvas.height, true);
          activeHeroMeteor = true;
          screenFlash = 0.055;
        }
        nextHeroTime = frameCount + Math.floor(Math.random() * 280) + 300;
      }

      comets.forEach((comet) => {
        const wasHero = comet.update(canvas.width, canvas.height);
        if (wasHero) {
          activeHeroMeteor = false;
          screenFlash = Math.max(screenFlash, 0.02);
          // Shooting star burst at end position
          bursts.push(new Burst(comet.x, comet.y));
        }
        comet.draw(ctx);
      });

      // Update bursts
      bursts = bursts.filter((b) => b.active);
      bursts.forEach((b) => { b.update(); b.draw(ctx); });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.85 }}
    />
  );
}