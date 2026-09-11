import { useEffect, useRef } from "react";

/* ─── Utilities ─── */
const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};
const mixRgb = (
  from: { r: number; g: number; b: number },
  to: { r: number; g: number; b: number },
  amount: number
) => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
});
const rgbToCss = (rgb: { r: number; g: number; b: number }) =>
  `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const resolveFontSize = (
  value: number | string,
  container: HTMLElement,
  fontWeight: number | string,
  fontFamily: string
): number => {
  if (typeof value === "number") return value;
  const probe = document.createElement("span");
  probe.textContent = "M";
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;font-size:${value};font-weight:${fontWeight};font-family:${fontFamily}`;
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
  probe.remove();
  return size;
};

const waitForFonts = async (font: string) => {
  if (!("fonts" in document)) return;
  try { await (document.fonts as FontFaceSet).load(font); } catch {}
  await (document.fonts as FontFaceSet).ready;
};

/* ─── Component ─── */
interface ParticleTextProps {
  text?: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "mount" | "hover" | "click";
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ParticleText({
  text = "Stackweb",
  particleSize = 2.2,
  density = 4,
  color = "#f4f1ea",         // cream — matches site foreground
  highlightColor = "#f4f1ea", // keep white, no purple
  scatter = 190,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 42,
  repelRadius = 120,
  idleDrift = 0.8,
  trigger = "mount",
  fontSize = "clamp(4.5rem, 19.5vw, 19.5vw)",
  fontWeight = 900,
  fontFamily = "'Barlow Condensed', 'Anton', sans-serif",
  glow = false,
  className = "",
  style,
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Particle = {
      x: number; y: number; startX: number; startY: number;
      targetX: number; targetY: number; size: number; color: string;
      seed: number; depth: number; delay: number;
    };

    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let gatherStart = 0;
    let reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };

    const startGather = (fromScatter = true) => {
      if (!particles.length) return;
      const now = performance.now();
      const spread = reducedMotion ? 0 : scatter;
      particles.forEach((p) => {
        if (fromScatter) {
          const angle = p.seed * Math.PI * 2;
          const dist = spread * (0.35 + p.depth * 0.75);
          p.x = p.targetX + Math.cos(angle) * dist + (p.depth - 0.5) * spread * 0.55;
          p.y = p.targetY + Math.sin(angle) * dist + (p.seed - 0.5) * spread * 0.55;
        }
        p.startX = p.x;
        p.startY = p.y;
        p.delay = reducedMotion ? 0 : p.seed * stagger;
      });
      gatherStart = now;
      gathering = true;
    };

    const drawParticle = (p: Particle) => {
      ctx.fillStyle = p.color;
      if (p.size <= 2.1) {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        return;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;
      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;
      let complete = true;

      particles.forEach((p) => {
        let bx = p.targetX, by = p.targetY, progress = 1;
        if (gathering) {
          const local = (now - gatherStart - p.delay) / Math.max(1, reducedMotion ? 1 : gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          bx = p.startX + (p.targetX - p.startX) * eased;
          by = p.startY + (p.targetY - p.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!reducedMotion && idleDrift > 0) {
          const t = now * 0.001;
          bx += Math.sin(t * 0.9 + p.seed * 10) * idleDrift * p.depth;
          by += Math.cos(t * 0.75 + p.depth * 10) * idleDrift * p.depth;
        }

        if (pointer.active && !reducedMotion && pointerRepel > 0 && repelRadius > 0) {
          const dx = bx - pointer.smoothX, dy = by - pointer.smoothY;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < repelRadius) {
            const force = Math.pow(1 - dist / repelRadius, 2) * pointerRepel;
            bx += (dx / dist) * force;
            by += (dy / dist) * force;
          }
        }

        const follow = reducedMotion ? 1 : 0.22;
        p.x += (bx - p.x) * follow;
        p.y += (by - p.y) * follow;
        ctx.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1);
        drawParticle(p);
      });

      ctx.globalAlpha = 1;
      if (gathering && complete) gathering = false;
      animationFrame = requestAnimationFrame(render);
    };

    const sampleText = async () => {
      const current = ++buildId;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const computed = window.getComputedStyle(container);
      const resolvedFamily = fontFamily === "inherit" ? computed.fontFamily || "sans-serif" : fontFamily;
      let resolvedSize = resolveFontSize(fontSize, container, fontWeight, resolvedFamily);
      let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (current !== buildId) return;

      const off = document.createElement("canvas");
      const offCtx = off.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      const content = String(text || " ");
      const maxW = width * 0.98;
      offCtx.font = font;
      let m = offCtx.measureText(content);
      if (m.width > maxW) {
        resolvedSize = Math.max(18, resolvedSize * (maxW / m.width));
        font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (current !== buildId) return;
        offCtx.font = font;
        m = offCtx.measureText(content);
      }

      const left = Math.ceil(m.actualBoundingBoxLeft || 0);
      const right = Math.ceil(m.actualBoundingBoxRight || m.width);
      const ascent = Math.ceil(m.actualBoundingBoxAscent || resolvedSize * 0.78);
      const descent = Math.ceil(m.actualBoundingBoxDescent || resolvedSize * 0.22);
      const pad = Math.max(12, Math.ceil(resolvedSize * 0.08));
      off.width = Math.max(1, left + right) + pad * 2;
      off.height = Math.max(1, ascent + descent) + pad * 2;
      offCtx.clearRect(0, 0, off.width, off.height);
      offCtx.font = font;
      offCtx.textAlign = "left";
      offCtx.textBaseline = "alphabetic";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillText(content, pad - left, pad + ascent);

      const img = offCtx.getImageData(0, 0, off.width, off.height);
      const targets: { x: number; y: number; alpha: number }[] = [];
      const step = Math.max(2, Math.floor(density));

      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const a = img.data[(y * off.width + x) * 4 + 3] ?? 0;
          if (a > 40) targets.push({ x: width / 2 - off.width / 2 + x, y: height / 2 - off.height / 2 + y, alpha: a / 255 });
        }
      }

      const maxP = Math.max(900, Math.min(5200, Math.floor((width * height) / 90)));
      const stride = Math.max(1, Math.ceil(targets.length / maxP));
      const baseRgb = hexToRgb(color);
      const hlRgb = hexToRgb(highlightColor);
      const selected = targets.filter((_, i) => i % stride === 0);

      particles = selected.map((target, i) => {
        const seed = ((i * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((i * 233 + 97) % 1000) / 1000) * 0.9;
        const blend = baseRgb && hlRgb ? clamp(target.x / Math.max(1, width) + (seed - 0.5) * 0.35, 0, 1) : 0;
        const pColor = baseRgb && hlRgb ? rgbToCss(mixRgb(baseRgb, hlRgb, blend)) : color;
        const angle = seed * Math.PI * 2;
        const dist = (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75);
        const sx = target.x + Math.cos(angle) * dist + (seed - 0.5) * scatter * 0.45;
        const sy = target.y + Math.sin(angle) * dist + (depth - 0.9) * scatter * 0.45;
        return {
          x: reducedMotion ? target.x : sx, y: reducedMotion ? target.y : sy,
          startX: sx, startY: sy, targetX: target.x, targetY: target.y,
          size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)),
          color: pColor, seed, depth, delay: seed * stagger,
        };
      });

      pointer.x = width / 2; pointer.y = height / 2;
      pointer.smoothX = pointer.x; pointer.smoothY = pointer.y;

      if (reducedMotion) {
        particles.forEach((p) => { p.x = p.targetX; p.y = p.targetY; p.startX = p.targetX; p.startY = p.targetY; p.delay = 0; });
        gathering = false;
      } else {
        startGather(false);
      }

      if (animationFrame === null) animationFrame = requestAnimationFrame(render);
    };

    const queueSample = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(sampleText);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };
    const onEnter = (e: PointerEvent) => { onMove(e); if (trigger === "hover") startGather(true); };
    const onClick = () => { if (trigger === "click") startGather(true); };

    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onMqChange = (e: MediaQueryListEvent) => { reducedMotion = e.matches; sampleText(); };
    mq?.addEventListener("change", onMqChange);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    const ro = new ResizeObserver(queueSample);
    ro.observe(container);
    sampleText();

    return () => {
      buildId += 1;
      ro.disconnect();
      mq?.removeEventListener("change", onMqChange);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    };
  }, [text, particleSize, density, color, highlightColor, scatter, gatherDuration, stagger,
      pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow]);

  return (
    <div
      ref={containerRef}
      className={`relative block w-full overflow-hidden touch-none isolate ${className}`}
      style={{ minHeight: "20vw", ...style }}
      aria-label={text}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" aria-hidden="true" />
      <span className="absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 whitespace-nowrap border-0">{text}</span>
    </div>
  );
}
