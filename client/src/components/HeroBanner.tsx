// ============================================================
// HeroBanner.tsx — Flash Banner with Royal Blue + Lavender
// AI Native · Data-backed decisions · Life Consultancy
// Formulas meet intelligence · Smart Helper
// ============================================================

import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface FloatingSymbol {
  text: string;
  x: number;
  y: number;
  opacity: number;
  size: number;
  speed: number;
  color: string;
}

// ─── Constants ───────────────────────────────────────────────
const ROYAL_BLUE_PALETTE = [
  "#1a3a8f", "#2563eb", "#1d4ed8", "#3b82f6", "#60a5fa",
];
const LAVENDER_PALETTE = [
  "#a78bfa", "#c4b5fd", "#8b5cf6", "#ddd6fe", "#7c3aed",
];
const MATH_SYMBOLS = [
  "∑", "∫", "∂", "∞", "π", "√", "Δ", "∇", "≈", "≡",
  "α", "β", "γ", "λ", "σ", "μ", "∈", "∀", "∃", "⊕",
  "f(x)", "y=ax²", "e^x", "log₂", "∏", "⊗", "∧", "∨",
];
const BINARY_STRINGS = [
  "01001000", "10110011", "11001010", "00110101",
  "10101010", "01110001", "11110000", "00001111",
];
const AI_KEYWORDS = [
  "AI", "ML", "NLP", "CNN", "RNN", "GPT", "LLM", "API",
  "BMI", "BMR", "TDEE", "CAGR", "ROI", "IRR",
];

// ─── Slide data (5 slides) ────────────────────────────────────
const SLIDES = [
  {
    headline: "AI Native",
    sub: "Intelligence built into every formula",
    accent: "Formulas meet intelligence",
    tag: "AI · Neural · Adaptive",
  },
  {
    headline: "Data-backed decisions",
    sub: "Every answer grounded in real formulas",
    accent: "Life Consultancy",
    tag: "Data · Insight · Precision",
  },
  {
    headline: "Smart Helper",
    sub: "Your personal knowledge operating system",
    accent: "Always by your side",
    tag: "Tools · Knowledge · Action",
  },
  {
    headline: "Life Consultancy",
    sub: "From question to clear decision",
    accent: "Formula Universe",
    tag: "Health · Finance · Growth",
  },
  {
    headline: "Formulas meet intelligence",
    sub: "Where mathematics and AI converge",
    accent: "AI Native · Data-backed",
    tag: "Formula · Logic · Intelligence",
  },
];

// ─── Wave path generator ──────────────────────────────────────
function buildWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  yBase: number
): string {
  let d = `M 0 ${yBase}`;
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = yBase + Math.sin((i / steps) * Math.PI * 2 * frequency + phase) * amplitude;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${width} ${height} L 0 ${height} Z`;
  return d;
}

// ─── Main Component ───────────────────────────────────────────
export function HeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const symbolsRef = useRef<FloatingSymbol[]>([]);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);

  // ── Slide auto-advance ──────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % SLIDES.length);
        setSlideVisible(true);
      }, 500);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // ── Canvas animation ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: 65 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color:
          Math.random() > 0.5
            ? ROYAL_BLUE_PALETTE[Math.floor(Math.random() * ROYAL_BLUE_PALETTE.length)]
            : LAVENDER_PALETTE[Math.floor(Math.random() * LAVENDER_PALETTE.length)],
      }));
    };

    // Init floating symbols
    const initSymbols = () => {
      const pool = [...MATH_SYMBOLS, ...BINARY_STRINGS, ...AI_KEYWORDS];
      symbolsRef.current = Array.from({ length: 30 }, () => ({
        text: pool[Math.floor(Math.random() * pool.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.22 + 0.06,
        size: Math.random() * 10 + 10,
        speed: Math.random() * 0.35 + 0.1,
        color: Math.random() > 0.45 ? "#60a5fa" : "#c4b5fd",
      }));
    };

    initParticles();
    initSymbols();

    // Draw background gradient
    const drawBackground = () => {
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#0f1f5c");
      bgGrad.addColorStop(0.45, "#1a3a8f");
      bgGrad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lavender diagonal slab — middle section
      ctx.save();
      ctx.beginPath();
      const slabTop = canvas.height * 0.28;
      const slabBot = canvas.height * 0.72;
      const skew = canvas.width * 0.2; // 70% wider (0.12 → 0.2)
      const slabHeight = slabBot - slabTop;
      const angleOffset = slabHeight * 0.1; // 5° more right tilt
      ctx.moveTo(-skew, slabTop);
      ctx.lineTo(canvas.width + skew, slabTop - angleOffset);
      ctx.lineTo(canvas.width + skew, slabBot - angleOffset);
      ctx.lineTo(-skew, slabBot);
      ctx.closePath();
      const lavGrad = ctx.createLinearGradient(0, slabTop, canvas.width, slabBot);
      lavGrad.addColorStop(0, "rgba(139,92,246,0.18)");
      lavGrad.addColorStop(0.4, "rgba(196,181,253,0.22)");
      lavGrad.addColorStop(1, "rgba(124,58,237,0.14)");
      ctx.fillStyle = lavGrad;
      ctx.fill();
      ctx.restore();

      // Radial glow top-left
      const glow1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.3, 0,
        canvas.width * 0.15, canvas.height * 0.3, canvas.width * 0.35
      );
      glow1.addColorStop(0, "rgba(37,99,235,0.28)");
      glow1.addColorStop(1, "rgba(37,99,235,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radial glow bottom-right
      const glow2 = ctx.createRadialGradient(
        canvas.width * 0.82, canvas.height * 0.65, 0,
        canvas.width * 0.82, canvas.height * 0.65, canvas.width * 0.3
      );
      glow2.addColorStop(0, "rgba(167,139,250,0.22)");
      glow2.addColorStop(1, "rgba(167,139,250,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw animated waves at bottom
    const drawWaves = (phase: number) => {
      const w = canvas.width;
      const h = canvas.height;

      // Wave 1 — deep royal blue, slow
      ctx.save();
      const path1 = new Path2D(buildWavePath(w, h, 18, 2.2, phase * 0.7, h * 0.78));
      const wg1 = ctx.createLinearGradient(0, h * 0.78, 0, h);
      wg1.addColorStop(0, "rgba(29,78,216,0.55)");
      wg1.addColorStop(1, "rgba(15,31,92,0.8)");
      ctx.fillStyle = wg1;
      ctx.fill(path1);
      ctx.restore();

      // Wave 2 — lavender, medium speed
      ctx.save();
      const path2 = new Path2D(buildWavePath(w, h, 14, 2.8, phase * 1.1 + 1.2, h * 0.83));
      const wg2 = ctx.createLinearGradient(0, h * 0.83, 0, h);
      wg2.addColorStop(0, "rgba(139,92,246,0.38)");
      wg2.addColorStop(1, "rgba(124,58,237,0.6)");
      ctx.fillStyle = wg2;
      ctx.fill(path2);
      ctx.restore();

      // Wave 3 — light lavender, faster
      ctx.save();
      const path3 = new Path2D(buildWavePath(w, h, 10, 3.5, phase * 1.6 + 2.5, h * 0.88));
      const wg3 = ctx.createLinearGradient(0, h * 0.88, 0, h);
      wg3.addColorStop(0, "rgba(196,181,253,0.28)");
      wg3.addColorStop(1, "rgba(167,139,250,0.5)");
      ctx.fillStyle = wg3;
      ctx.fill(path3);
      ctx.restore();

      // Wave 4 — white foam, fastest
      ctx.save();
      const path4 = new Path2D(buildWavePath(w, h, 6, 4.2, phase * 2.2 + 0.8, h * 0.93));
      const wg4 = ctx.createLinearGradient(0, h * 0.93, 0, h);
      wg4.addColorStop(0, "rgba(255,255,255,0.12)");
      wg4.addColorStop(1, "rgba(255,255,255,0.04)");
      ctx.fillStyle = wg4;
      ctx.fill(path4);
      ctx.restore();
    };

    // Draw connection lines between close particles
    const drawConnections = () => {
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            const alpha = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(147,197,253,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    // Draw particles
    const drawParticles = () => {
      particlesRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color + Math.round(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
    };

    // Draw floating symbols
    const drawSymbols = () => {
      symbolsRef.current.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.font = `${s.size}px 'Courier New', monospace`;
        ctx.fillStyle = s.color;
        ctx.fillText(s.text, s.x, s.y);
        ctx.restore();
      });
    };

    // Update positions
    const update = () => {
      phaseRef.current += 0.018; // wave speed — medium

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      symbolsRef.current.forEach((s) => {
        s.y -= s.speed;
        if (s.y < -30) {
          s.y = canvas.height + 20;
          s.x = Math.random() * canvas.width;
          const pool = [...MATH_SYMBOLS, ...BINARY_STRINGS, ...AI_KEYWORDS];
          s.text = pool[Math.floor(Math.random() * pool.length)];
        }
      });
    };

    // Animation loop
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawConnections();
      drawParticles();
      drawSymbols();
      drawWaves(phaseRef.current);
      update();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const slide = SLIDES[slideIndex];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "400px" }}
      aria-label="Formula Universe Hero Banner"
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Lavender diagonal overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, transparent 15%, rgba(196,181,253,0.06) 15%, rgba(196,181,253,0.06) 85%, transparent 85%)",
        }}
      />

      {/* Slide text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-16 text-center">
        {/* Tag line */}
        <div
          className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/70 backdrop-blur-sm"
          style={{
            transition: "opacity 0.5s ease",
            opacity: slideVisible ? 1 : 0,
          }}
        >
          {slide.tag}
        </div>

        {/* Main headline */}
        <h2
          className="mb-3 font-extrabold leading-tight tracking-tight text-white"
          style={{
            fontSize: "clamp(1.9rem, 5vw, 3.4rem)",
            textShadow:
              "0 2px 24px rgba(37,99,235,0.7), 0 0 40px rgba(167,139,250,0.4)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            opacity: slideVisible ? 1 : 0,
            transform: slideVisible ? "translateY(0)" : "translateY(14px)",
          }}
        >
          {slide.headline}
        </h2>

        {/* Sub headline */}
        <p
          className="mb-5 max-w-xl text-base font-medium text-white/80 md:text-lg"
          style={{
            transition: "opacity 0.5s ease 0.1s",
            opacity: slideVisible ? 1 : 0,
          }}
        >
          {slide.sub}
        </p>

        {/* Accent badge */}
        <div
          className="rounded-full px-5 py-2 text-sm font-bold tracking-wide text-white"
          style={{
            background:
              "linear-gradient(90deg, rgba(139,92,246,0.75) 0%, rgba(37,99,235,0.75) 100%)",
            border: "1px solid rgba(196,181,253,0.45)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 22px rgba(139,92,246,0.38)",
            transition: "opacity 0.5s ease 0.15s",
            opacity: slideVisible ? 1 : 0,
          }}
        >
          {slide.accent}
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setSlideVisible(false);
              setTimeout(() => {
                setSlideIndex(i);
                setSlideVisible(true);
              }, 400);
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === slideIndex ? "24px" : "8px",
              height: "8px",
              background:
                i === slideIndex
                  ? "rgba(196,181,253,0.95)"
                  : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
