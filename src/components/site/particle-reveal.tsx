import { useEffect, useRef, useState } from "react";

/* ─── Easing ─── */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/* ─── Types ─── */
type Particle = {
  /* canvas coords */
  x: number;
  y: number;
  /* where it lives when scattered (globe) */
  scatterX: number;
  scatterY: number;
  /* where it lives in the image */
  imageX: number;
  imageY: number;
  /* colour sampled from the photo */
  r: number;
  g: number;
  b: number;
  /* animation bookkeeping */
  startX: number;
  startY: number;
  seed: number;
  delay: number;
  size: number;
};

/* ─── Globe distribution helper ─── */
function globePosition(
  index: number,
  total: number,
  radius: number,
  yaw: number,
  tilt: number,
): [number, number, number] {
  const sphereY = 1 - (index / Math.max(total - 1, 1)) * 2;
  const ringRadius = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
  const angle = index * 2.39996323; // golden ratio spiral
  const sphereX = Math.cos(angle) * ringRadius;
  const sphereZ = Math.sin(angle) * ringRadius;
  const spunX = sphereX * Math.cos(yaw) + sphereZ * Math.sin(yaw);
  const spunZ = -sphereX * Math.sin(yaw) + sphereZ * Math.cos(yaw);
  return [
    spunX * radius,
    (sphereY * Math.cos(tilt) - spunZ * Math.sin(tilt)) * radius,
    (sphereY * Math.sin(tilt) + spunZ * Math.cos(tilt)) * radius,
  ];
}

/* ─── Component ─── */
interface ParticleRevealProps {
  /** URL of the image to reveal */
  src: string;
  alt: string;
  /** Total particles drawn */
  count?: number;
  /** Particle dot size in px */
  particleSize?: number;
  /** Globe radius as fraction of the shorter canvas edge */
  globeRadiusFactor?: number;
  /** Spring stiffness for gather */
  stiffness?: number;
  /** Crossfade duration ms when revealing the actual <img> */
  crossfadeDuration?: number;
  className?: string;
}

export function ParticleReveal({
  src,
  alt,
  count = 6000,
  particleSize = 2,
  globeRadiusFactor = 0.38,
  stiffness = 0.055,
  crossfadeDuration = 400,
  className = "",
}: ParticleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgVisible, setImgVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    /* ── State ── */
    let raf: number | null = null;
    let buildId = 0;
    let particles: Particle[] = [];
    let hovered = false;
    let globeYaw = Math.random() * Math.PI * 2;
    const TILT = -0.28;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    /* target "globe" or "image" fractions — 0 = globe, 1 = image */
    let morphTarget = 0; // where we want to be
    let morphCurrent = 0; // where we are (spring-driven each frame)

    /* ── Load & sample image ── */
    const loadAndSample = async (current: number) => {
      const rect = container.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (width < 1 || height < 1) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* --- sample the image into an offscreen canvas --- */
      const off = document.createElement("canvas");
      const SAMPLE_W = 200;
      const imgEl = imgRef.current;
      if (!imgEl) return;

      // ensure image is loaded
      if (!imgEl.complete || imgEl.naturalWidth === 0) {
        await new Promise<void>((res) => {
          imgEl.onload = () => res();
          imgEl.onerror = () => res();
        });
      }
      if (current !== buildId) return;

      const aspect = imgEl.naturalWidth / Math.max(1, imgEl.naturalHeight);
      const SAMPLE_H = Math.round(SAMPLE_W / aspect);
      off.width = SAMPLE_W;
      off.height = SAMPLE_H;
      const oc = off.getContext("2d", { willReadFrequently: true });
      if (!oc) return;
      oc.drawImage(imgEl, 0, 0, SAMPLE_W, SAMPLE_H);
      const pixelData = oc.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;

      /* --- build particles --- */
      globeYaw = Math.random() * Math.PI * 2;
      const radius = Math.min(width, height) * globeRadiusFactor;
      const cx = width / 2;
      const cy = height / 2;

      // spread image evenly across canvas (letterboxed)
      const imgDrawW = Math.min(width, height * aspect);
      const imgDrawH = imgDrawW / aspect;
      const imgLeft = cx - imgDrawW / 2;
      const imgTop = cy - imgDrawH / 2;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const seed = ((i * 9301 + 49297) % 233280) / 233280;
        const seed2 = ((i * 1234 + 5678) % 9999) / 9999;

        /* image position — row-major mapping */
        const col = i % SAMPLE_W;
        const row = Math.floor(i / SAMPLE_W) % SAMPLE_H;
        const pixelIndex = (row * SAMPLE_W + col) * 4;
        const r = pixelData[pixelIndex] ?? 128;
        const g = pixelData[pixelIndex + 1] ?? 128;
        const b = pixelData[pixelIndex + 2] ?? 128;

        const imageX = imgLeft + (col + 0.5) / SAMPLE_W * imgDrawW;
        const imageY = imgTop + (row + 0.5) / SAMPLE_H * imgDrawH;

        /* globe position — fibonacci sphere */
        const [gx, gy] = globePosition(i, count, radius, globeYaw, TILT);
        const scatterX = cx + gx;
        const scatterY = cy - gy; // y-flip for screen space

        /* start from globe when reduced motion is off */
        const startX = reducedMotion ? imageX : scatterX;
        const startY = reducedMotion ? imageY : scatterY;

        newParticles.push({
          x: startX, y: startY,
          scatterX, scatterY,
          imageX, imageY,
          startX, startY,
          r, g, b,
          seed,
          delay: seed2 * (reducedMotion ? 0 : 0.35),
          size: particleSize * (0.6 + seed * 0.8),
        });
      }

      particles = newParticles;
      morphCurrent = reducedMotion ? 0 : 0;
      morphTarget = 0; // start as globe
    };

    /* ── Render loop ── */
    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      /* spring-step morphCurrent toward morphTarget */
      const diff = morphTarget - morphCurrent;
      morphCurrent += diff * stiffness * (reducedMotion ? 1 : 1);

      /* once fully revealed, show the real img and pause canvas */
      const fullyRevealed = morphCurrent > 0.97;
      const fullyGlobe = morphCurrent < 0.03;

      if (fullyRevealed) {
        morphCurrent = 1;
        setImgVisible(true);
      } else {
        setImgVisible(false);
      }

      /* draw each particle */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        /* per-particle delayed morph */
        const t = clamp((morphCurrent - p.delay * (hovered ? -1 : 1)) / 1, 0, 1);
        const eased = hovered ? easeOutQuint(t) : easeInOutCubic(t);

        const tx = p.scatterX + (p.imageX - p.scatterX) * eased;
        const ty = p.scatterY + (p.imageY - p.scatterY) * eased;

        /* gentle idle drift when in globe state */
        let fx = tx, fy = ty;
        if (!hovered && !reducedMotion && fullyGlobe) {
          const drift = 0.9;
          fx += Math.sin(now * 0.0007 + p.seed * 12) * drift;
          fy += Math.cos(now * 0.00055 + p.seed * 8) * drift;
        }

        /* spring follow */
        p.x += (fx - p.x) * (reducedMotion ? 1 : 0.18);
        p.y += (fy - p.y) * (reducedMotion ? 1 : 0.18);

        /* alpha: full brightness in image position, slightly dim in globe */
        const alpha = 0.55 + eased * 0.45;
        ctx.globalAlpha = clamp(alpha, 0, 1);
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;

        if (p.size <= 1.5) {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(render);
    };

    /* ── Events ── */
    const onEnter = () => {
      hovered = true;
      morphTarget = 1;
    };
    const onLeave = () => {
      hovered = false;
      morphTarget = 0;
      setImgVisible(false);
    };

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("focusin", onEnter);
    container.addEventListener("focusout", onLeave);

    /* ── Resize ── */
    let resizeRaf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const cur = ++buildId;
        loadAndSample(cur).then(() => {
          if (cur === buildId && raf === null) {
            raf = requestAnimationFrame(render);
          }
        });
      });
    });
    ro.observe(container);

    /* ── Reduced motion MQ ── */
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const onMq = (e: MediaQueryListEvent) => { reducedMotion = e.matches; };
    mq?.addEventListener("change", onMq);

    /* ── Init ── */
    const init = async () => {
      const cur = ++buildId;
      await loadAndSample(cur);
      if (cur === buildId) {
        raf = requestAnimationFrame(render);
      }
    };
    init();

    return () => {
      buildId++;
      ro.disconnect();
      mq?.removeEventListener("change", onMq);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("focusin", onEnter);
      container.removeEventListener("focusout", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
    };
  }, [src, count, particleSize, globeRadiusFactor, stiffness]);

  return (
    <div
      ref={containerRef}
      className={`relative block overflow-hidden ${className}`}
      style={{ cursor: "crosshair" }}
    >
      {/* Hidden source image — sampled for particle colours */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        aria-hidden="true"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                 objectFit: "cover", opacity: 0, pointerEvents: "none" }}
      />

      {/* Canvas — particles live here */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          transition: `opacity ${crossfadeDuration}ms ease`,
          opacity: imgVisible ? 0 : 1,
        }}
      />

      {/* Real image — crossfades in when particles fully settle */}
      <img
        src={src}
        alt={alt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: `opacity ${crossfadeDuration}ms ease`,
          opacity: imgVisible ? 1 : 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
