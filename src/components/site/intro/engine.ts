/**
 * StackWeb Cinematic Eye Intro — Engine v2
 *
 * A framework-agnostic, deterministic intro animation.
 * Four scenes on one Canvas 2D, driven by a linear master clock:
 *   1. Eye forms and opens from glyph rows
 *   2. Camera pushes through iris into pupil
 *   3. STACKWEB wordmark assembles from line fragments
 *   4. Camera passes through letters → reveal homepage
 *
 * API: createIntro({ mount, onComplete })
 *   .skip()    — jump to completion
 *   .destroy() — full teardown
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const OBSIDIAN = "#080B12";
const ICE_WHITE = "#F5F7FA";
const RACING_BLUE = "#245BDB";
const OBSIDIAN_RGB = [8, 11, 18] as const;
const ICE_RGB = [245, 247, 250] as const;
const BLUE_RGB = [36, 91, 219] as const;

const TOTAL_DURATION = 6.5;

const T = {
  start: 0.0,
  eyeOpen: 0.3,
  eyeHold: 1.9,
  push: 2.1,
  pupil: 3.2,
  form: 3.6,
  hold: 5.0,
  reveal: 5.4,
  end: 6.5,
} as const;

const CODE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]();:=<>+-*/&|!?@#$%^~_.,";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IntroOptions {
  mount: HTMLElement;
  onComplete: () => void;
  freezeAt?: number | undefined;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  phase: number;
  speed: number;
  layer: number;
  isBlue: boolean;
}

interface WordSpan {
  x: number;
  y: number;
  w: number;
  row: number;
  letterIdx: number;
}

interface WordFragment {
  sx: number; sy: number;
  tx: number; ty: number;
  tw: number;
  letterIdx: number;
  row: number;
  delay: number;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return v < lo ? lo : v > hi ? hi : v; }
function easeOutPow2(t: number) { return 1 - (1 - t) * (1 - t); }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutExpo(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Eye field ───────────────────────────────────────────────────────────────

function evalEye(
  nx: number, ny: number,
  openness: number, time: number,
  rng: () => number
): [brightness: number, region: number] {
  // region: 0=skin/lid, 1=iris, 2=sclera, 3=catchlight, 4=pupil
  //
  // Coordinate system:  nx ∈ [-1,1] horizontal, ny ∈ [-1,1] vertical
  //   ny < 0 = above centre,  ny > 0 = below centre

  const lidW = 0.82; // half-width of almond in normalised coords
  const af = Math.max(0, 1 - (nx / lidW) ** 2); // almond factor: 1 at centre, 0 at tips

  // ── Lid curves ──
  // Closed: both lids meet at y ≈ 0 (tiny slit)
  // Open:   upper lid moves UP (more negative), lower lid moves DOWN (more positive)
  const slitGap   = 0.012;  // half-gap when closed
  const upperSpan = 0.24;   // how far upper lid rises when fully open
  const lowerSpan = 0.15;   // how far lower lid drops when fully open

  const upperLid = -(slitGap + openness * upperSpan) * af;  // negative = above
  const lowerLid =  (slitGap + openness * lowerSpan) * af;  // positive = below

  // ── Brow line ──
  const browY = -0.38 + 0.06 * af;
  const browDist = Math.abs(ny - browY);
  if (browDist < 0.02 && Math.abs(nx) < lidW * 0.85) {
    return [0.15 + (1 - browDist / 0.02) * 0.2, 0];
  }

  // ── Outside the almond → dim background code ──
  if (Math.abs(nx) > lidW + 0.05 || ny < upperLid - 0.06 || ny > lowerLid + 0.06) {
    const row = Math.sin(ny * 60 + time * 0.3) * 0.5 + 0.5;
    return [0.04 + row * 0.06, 0];
  }

  // ── Upper lid edge / lash fringe ──
  const ue = Math.abs(ny - upperLid);
  if (ue < 0.05 && ny <= upperLid + 0.01) {
    const t2 = 1 - ue / 0.05;
    return [0.3 + t2 * 0.55, 0]; // up to 0.85 at the edge
  }

  // ── Lower lid edge ──
  const le = Math.abs(ny - lowerLid);
  if (le < 0.035 && ny >= lowerLid - 0.01) {
    const t2 = 1 - le / 0.035;
    return [0.2 + t2 * 0.4, 0]; // up to 0.60
  }

  // ── Inside the eye opening ──
  if (ny >= upperLid && ny <= lowerLid && openness > 0.03) {
    const eyeR = 0.36; // total eyeball radius in normalised coords

    // Micro-saccade (subtle eye movement)
    const sx = Math.sin(time * 1.6) * 0.006;
    const sy = Math.cos(time * 2.1) * 0.003;
    const ex = nx - sx;
    const ey = ny - sy;
    const ed = Math.sqrt(ex * ex + ey * ey);

    // Outside eyeball but inside lid opening → skin/shadow
    if (ed > eyeR) return [0.08 + rng() * 0.04, 0];

    // ── Sclera (white of eye) ──
    const irisR = 0.20;
    if (ed > irisR + 0.015) {
      const scl = 1 - (ed - irisR) / (eyeR - irisR);
      return [0.25 + scl * 0.35, 2]; // 0.25 to 0.60
    }

    // ── Limbal ring (dark border of iris) ──
    if (ed > irisR - 0.008) {
      return [0.50 + rng() * 0.15, 1];
    }

    // ── Iris (coloured ring with fibre detail) ──
    const pupilR = 0.075 + Math.sin(time * 1.8) * 0.004;
    if (ed > pupilR + 0.003) {
      const angle = Math.atan2(ey, ex);
      const nd = (ed - pupilR) / (irisR - pupilR); // 0 at pupil edge, 1 at iris edge
      const fibre = Math.sin(angle * 16 + nd * 8) * 0.18
        + Math.sin(angle * 10 - nd * 5 + time * 0.5) * 0.12;
      const crypt = Math.sin(angle * 28 + ed * 40) * 0.08;
      return [clamp(0.35 + nd * 0.4 + fibre + crypt, 0.2, 0.9), 1];
    }

    // ── Catchlights (bright highlights in pupil) ──
    const c1d = Math.sqrt((ex + 0.028) ** 2 + (ey + 0.028) ** 2);
    if (c1d < 0.022) return [clamp((1 - c1d / 0.022), 0, 1), 3];
    const c2d = Math.sqrt((ex - 0.014) ** 2 + (ey - 0.011) ** 2);
    if (c2d < 0.011) return [clamp((1 - c2d / 0.011) * 0.6, 0, 1), 3];

    // ── Pupil (deep black) ──
    return [0.005, 4];
  }

  // Between lids but not open enough → dim
  return [0.03 + rng() * 0.03, 0];
}

// ─── Word mask builder ───────────────────────────────────────────────────────

async function buildWordMask(
  text: string, fontFam: string, vw: number, vh: number, portrait: boolean
): Promise<{ spans: WordSpan[]; ofsX: number; ofsY: number; cW: number; cH: number }> {
  try { await document.fonts.load(`400 72px "${fontFam}"`); } catch {}

  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const lines = portrait && vw <= 600 ? ["STACK", "WEB"] : [text];
  const targetW = vw * (portrait ? 0.86 : 0.9);

  // Measure longest line to set font size
  let fs = 120;
  ctx.font = `400 ${fs}px ${fontFam}`;
  const longest = lines.reduce((a, b) => ctx.measureText(a).width > ctx.measureText(b).width ? a : b, "");
  fs = Math.floor((targetW / ctx.measureText(longest).width) * fs);

  const lh = fs * 1.05;
  c.width = Math.ceil(targetW + 40);
  c.height = Math.ceil(lh * lines.length + 40);
  ctx.font = `400 ${fs}px ${fontFam}`;
  ctx.fillStyle = "#FFF";
  ctx.textBaseline = "top";

  // Build letter x-ranges per line
  const letterRanges: { sx: number; ex: number; li: number }[] = [];
  lines.forEach((line, li) => {
    const lw = ctx.measureText(line).width;
    const startX = (c.width - lw) / 2;
    let acc = 0;
    for (let i = 0; i < line.length; i++) {
      const cw = ctx.measureText(line[i]!).width;
      letterRanges.push({ sx: startX + acc, ex: startX + acc + cw, li });
      acc += cw;
    }
  });

  lines.forEach((line, li) => {
    const lw = ctx.measureText(line).width;
    ctx.fillText(line, (c.width - lw) / 2, li * lh + 10);
  });

  const img = ctx.getImageData(0, 0, c.width, c.height);
  const step = 3;
  const spans: WordSpan[] = [];

  for (let y = 0; y < c.height; y += step) {
    let inSpan = false, spanStart = 0;
    for (let x = 0; x <= c.width; x++) {
      const alpha = x < c.width ? img.data[(y * c.width + x) * 4 + 3]! : 0;
      if (alpha > 30 && !inSpan) { spanStart = x; inSpan = true; }
      else if (alpha <= 30 && inSpan) {
        const midX = (spanStart + x) / 2;
        let li = 0;
        for (let j = 0; j < letterRanges.length; j++) {
          if (midX >= letterRanges[j]!.sx && midX <= letterRanges[j]!.ex) { li = j; break; }
        }
        spans.push({ x: spanStart, y, w: x - spanStart, row: Math.floor(y / step), letterIdx: li });
        inSpan = false;
      }
    }
  }

  return {
    spans,
    ofsX: (vw - c.width) / 2,
    ofsY: (vh - c.height) / 2,
    cW: c.width,
    cH: c.height,
  };
}

// ─── Stars ───────────────────────────────────────────────────────────────────

function makeStars(n: number, rng: () => number): Star[] {
  return Array.from({ length: n }, () => ({
    x: rng() * 2 - 1,
    y: rng() * 2 - 1,
    size: 1 + rng() * 2.5,
    brightness: 0.3 + rng() * 0.7,
    phase: rng() * Math.PI * 2,
    speed: 0.5 + rng() * 1.5,
    layer: Math.floor(rng() * 3),
    isBlue: rng() < 0.12,
  }));
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, sz: number, br: number, blue: boolean
) {
  const [r, g, b] = blue ? BLUE_RGB : ICE_RGB;
  const a = clamp(br, 0, 1);
  const arm = sz * 2.5;
  ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy + arm); ctx.stroke();
  ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * 1.3, 1)})`;
  ctx.beginPath(); ctx.arc(cx, cy, sz * 0.5, 0, Math.PI * 2); ctx.fill();
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function createIntro(opts: IntroOptions) {
  const { mount, onComplete, freezeAt } = opts;
  let destroyed = false, completed = false, rafId = 0;
  let startTime = -1, currentTime = 0, paused = false;

  // ── DOM ──
  const overlay = document.createElement("div");
  overlay.id = "sw-intro-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    width:100vw;height:100dvh;
    background:${OBSIDIAN};pointer-events:auto;overflow:hidden;
  `;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;outline:none;display:block";
  overlay.appendChild(canvas);

  // Skip button
  const skip = document.createElement("button");
  skip.id = "sw-intro-skip";
  skip.textContent = "SKIP INTRO";
  skip.setAttribute("aria-label", "Skip intro animation");
  const isMobile = window.innerWidth <= 600;
  skip.style.cssText = `
    position:absolute;z-index:100000;
    bottom:max(24px,env(safe-area-inset-bottom,24px));
    ${isMobile ? "left:50%;transform:translateX(-50%)" : "right:24px"};
    background:none;border:none;color:${ICE_WHITE};opacity:0;
    font:500 12px/1 "DM Sans",system-ui,sans-serif;
    letter-spacing:0.18em;text-transform:uppercase;
    cursor:pointer;padding:12px 16px;
    min-width:44px;min-height:44px;
    transition:opacity 0.3s ease;outline:none;
  `;
  skip.addEventListener("focus", () => { skip.style.outline = `2px solid ${RACING_BLUE}`; skip.style.outlineOffset = "3px"; });
  skip.addEventListener("blur", () => { skip.style.outline = "none"; });
  overlay.appendChild(skip);

  mount.appendChild(overlay);

  // Inert app root
  const mainEl = document.getElementById("main");
  const headerEl = document.querySelector("header");
  const footerEl = document.querySelector("footer");
  [mainEl, headerEl, footerEl].forEach(el => el?.setAttribute("inert", ""));

  // Lock scroll
  const origHtmlOv = document.documentElement.style.overflow;
  const origBodyOv = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // ── Canvas ──
  const ctx = canvas.getContext("2d", { alpha: false })!;
  let W = 0, H = 0, dpr = 1;
  let cols = 0, rows = 0, cellW = 0, cellH = 0;
  const maxDpr = isMobile ? 1.5 : 2;

  function resize() {
    W = overlay.offsetWidth || window.innerWidth;
    H = overlay.offsetHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isP = H > W;
    const tc = isP ? 100 : 170;
    cellW = Math.max(4, Math.floor(W / tc));
    cellH = Math.floor(cellW * 1.7);
    cols = Math.ceil(W / cellW) + 2;
    rows = Math.ceil(H / cellH) + 2;
  }
  resize();

  // ── Pre-compute per-row data ──
  const rng = mulberry32(42);
  const rowChars: string[][] = [];
  const rowDrifts: number[] = [];
  for (let r = 0; r < 300; r++) {
    const rc: string[] = [];
    for (let c = 0; c < 300; c++) rc.push(CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)]!);
    rowChars.push(rc);
    rowDrifts.push(rng() * Math.PI * 2);
  }

  // Stars
  const stars = makeStars(120, rng);

  // Wordmark
  let wordReady = false;
  let wordFragments: WordFragment[] = [];
  let wOfsX = 0, wOfsY = 0;

  buildWordMask("STACKWEB", "Anton", W, H, H > W).then(m => {
    if (destroyed) return;
    wordReady = true;
    wOfsX = m.ofsX;
    wOfsY = m.ofsY;
    m.spans.forEach(sp => {
      const fromL = rng() > 0.5;
      wordFragments.push({
        sx: fromL ? -W * 0.4 - rng() * W * 0.4 : W * 1.4 + rng() * W * 0.4,
        sy: sp.y + m.ofsY + (rng() - 0.5) * H * 0.4,
        tx: sp.x + m.ofsX,
        ty: sp.y + m.ofsY,
        tw: sp.w,
        letterIdx: sp.letterIdx,
        row: sp.row,
        delay: sp.letterIdx * 0.08 + (sp.row / 80) * 0.25 + rng() * 0.08,
      });
    });
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(t: number) {
    ctx.fillStyle = OBSIDIAN;
    ctx.fillRect(0, 0, W, H);

    const fontSize = Math.max(7, Math.floor(cellH * 0.72));

    // ══════════════════════════════════════════════════════════════════════════
    // SCENE 1 + 2: Eye glyph field (renders from t=0 to ~pupil+0.3)
    // ══════════════════════════════════════════════════════════════════════════

    if (t < T.pupil + 0.3) {
      // Scanline fade-in (0 → eyeOpen)
      const scanAlpha = t < T.eyeOpen ? clamp(t / T.eyeOpen, 0, 0.5) : 1;

      // Row fade from vertical centre outward
      const rowFadeProg = clamp((t - T.start) / 0.4, 0, 1);

      // Openness ramps 0→1 between t=0.5 and eyeHold
      let openness = 0;
      if (t >= 0.5 && t < T.eyeHold) {
        openness = easeOutPow2(clamp((t - 0.5) / (T.eyeHold - 0.5), 0, 1));
      } else if (t >= T.eyeHold) {
        openness = 1;
      }

      // Camera zoom for push
      let zoom = 1;
      let pushProg = 0;
      if (t >= T.push) {
        pushProg = clamp((t - T.push) / (T.pupil - T.push + 0.1), 0, 1);
        zoom = 1 + easeInOutExpo(pushProg) * 38;
      }

      // Apply rotation during push
      if (t >= T.push) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(Math.sin(pushProg * Math.PI) * 0.025);
        ctx.translate(-W / 2, -H / 2);
      }

      // Eye metrics
      const eyeFrac = H > W ? 0.92 : 0.65;
      const eyeR = Math.min(W, H) * eyeFrac * 0.5;
      const cx = W / 2, cy = H / 2;
      const centerRow = Math.floor(rows / 2);

      // ── Draw eye geometry layer (canvas primitives) ──────────────────────
      // This makes the eye shape clearly visible; characters overlay for texture
      if (openness > 0.02 && zoom < 10) {
        const slitGap = 0.012, upperSpan = 0.24, lowerSpan = 0.15;
        const almondW = 0.82;

        // Pixel conversion
        const toX = (n: number) => cx + n * eyeR / zoom;
        const toY = (n: number) => cy + n * eyeR / zoom;
        const toS = (n: number) => n * eyeR / zoom;

        // Almond clipping path (the opening between lids)
        ctx.save();
        ctx.beginPath();
        const almondPts = 60;
        for (let i = 0; i <= almondPts; i++) {
          const frac = i / almondPts;
          const nxp = -almondW + 2 * almondW * frac;
          const af2 = Math.max(0, 1 - (nxp / almondW) ** 2);
          const uy = -(slitGap + openness * upperSpan) * af2;
          const px = toX(nxp), py = toY(uy);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        for (let i = almondPts; i >= 0; i--) {
          const frac = i / almondPts;
          const nxp = -almondW + 2 * almondW * frac;
          const af2 = Math.max(0, 1 - (nxp / almondW) ** 2);
          const ly = (slitGap + openness * lowerSpan) * af2;
          const px = toX(nxp), py = toY(ly);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.clip();

        // Sclera fill (soft white glow inside almond)
        const scleraGrad = ctx.createRadialGradient(
          toX(0), toY(0), toS(0.02),
          toX(0), toY(0), toS(0.38)
        );
        scleraGrad.addColorStop(0, `rgba(210,215,220,${0.12 * openness})`);
        scleraGrad.addColorStop(0.5, `rgba(200,205,212,${0.09 * openness})`);
        scleraGrad.addColorStop(1, `rgba(180,185,190,${0.03 * openness})`);
        ctx.fillStyle = scleraGrad;
        ctx.fillRect(0, 0, W, H);

        // Iris ring (blue gradient circle)
        const irisOuterR = toS(0.21);
        const irisInnerR = toS(0.075);
        const irisGrad = ctx.createRadialGradient(
          toX(0), toY(0), irisInnerR,
          toX(0), toY(0), irisOuterR
        );
        irisGrad.addColorStop(0, `rgba(36,91,219,${0.25 * openness})`);
        irisGrad.addColorStop(0.4, `rgba(36,91,219,${0.2 * openness})`);
        irisGrad.addColorStop(0.85, `rgba(50,110,230,${0.15 * openness})`);
        irisGrad.addColorStop(1, `rgba(30,60,140,${0.3 * openness})`);
        ctx.beginPath();
        ctx.arc(toX(0), toY(0), irisOuterR, 0, Math.PI * 2);
        ctx.fillStyle = irisGrad;
        ctx.fill();

        // Pupil (dark void)
        const pupilPixR = toS(0.075);
        ctx.beginPath();
        ctx.arc(toX(0), toY(0), pupilPixR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(4,6,10,${0.4 * openness})`;
        ctx.fill();

        // Catchlight 1
        ctx.beginPath();
        ctx.arc(toX(-0.028), toY(-0.028), toS(0.02), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 * openness})`;
        ctx.fill();

        // Catchlight 2
        ctx.beginPath();
        ctx.arc(toX(0.014), toY(0.011), toS(0.01), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.15 * openness})`;
        ctx.fill();

        ctx.restore();

        // Lid edges (drawn OUTSIDE clip, over everything)
        ctx.save();
        ctx.lineWidth = Math.max(1.5, toS(0.012));
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(200,210,220,${0.35 * openness})`;

        // Upper lid
        ctx.beginPath();
        for (let i = 0; i <= almondPts; i++) {
          const frac = i / almondPts;
          const nxp = -almondW + 2 * almondW * frac;
          const af2 = Math.max(0, 1 - (nxp / almondW) ** 2);
          const uy = -(slitGap + openness * upperSpan) * af2;
          const px = toX(nxp), py = toY(uy);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Lower lid
        ctx.strokeStyle = `rgba(200,210,220,${0.22 * openness})`;
        ctx.lineWidth = Math.max(1, toS(0.008));
        ctx.beginPath();
        for (let i = 0; i <= almondPts; i++) {
          const frac = i / almondPts;
          const nxp = -almondW + 2 * almondW * frac;
          const af2 = Math.max(0, 1 - (nxp / almondW) ** 2);
          const ly = (slitGap + openness * lowerSpan) * af2;
          const px = toX(nxp), py = toY(ly);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Limbal ring (iris outer border)
        ctx.beginPath();
        ctx.arc(toX(0), toY(0), irisOuterR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(60,120,200,${0.2 * openness})`;
        ctx.lineWidth = Math.max(1, toS(0.008));
        ctx.stroke();

        ctx.restore();
      }

      // ── Character grid overlay ──────────────────────────────────────────
      ctx.font = `${fontSize}px "Courier New",monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (let r = 0; r < rows; r++) {
        const distC = Math.abs(r - centerRow) / Math.max(centerRow, 1);
        const rAlpha = rowFadeProg >= 1 ? 1 : clamp((rowFadeProg - distC * 0.6) / 0.4, 0, 1);
        if (rAlpha <= 0) continue;

        const drift = Math.sin(t * 0.12 + rowDrifts[r % 300]!) * cellW * 0.4;

        for (let c = 0; c < cols; c++) {
          const px = c * cellW + drift;
          const py = r * cellH;

          // To normalised eye space
          const nex = ((px - cx) / eyeR) / zoom;
          const ney = ((py - cy) / eyeR) / zoom;

          const [bright, region] = evalEye(nex, ney, openness, t, rng);

          // Streaking during push
          let streakAdd = 0;
          if (pushProg > 0) streakAdd = pushProg * 0.2 * rng();

          const tb = clamp((bright + streakAdd) * scanAlpha * rAlpha, 0, 1);
          if (tb < 0.008) continue;

          // Colour — sclera is warm white, iris is blue, rest is ice
          let cr: number, cg: number, cb: number;
          if (region === 1) {
            // Iris — blue with white blend at high brightness
            const w = clamp((tb - 0.35) / 0.3, 0, 1);
            cr = lerp(BLUE_RGB[0], ICE_RGB[0], w);
            cg = lerp(BLUE_RGB[1], ICE_RGB[1], w);
            cb = lerp(BLUE_RGB[2], ICE_RGB[2], w);
          } else if (region === 2) {
            // Sclera — warm off-white for contrast
            cr = 230; cg = 232; cb = 235;
          } else if (region === 3) {
            // Catchlight — pure bright white
            cr = 255; cg = 255; cb = 255;
          } else {
            // Skin/lids/background — cool ice
            cr = ICE_RGB[0]; cg = ICE_RGB[1]; cb = ICE_RGB[2];
          }

          const alpha = region === 4 ? tb * 0.15 : tb;
          const ch = rowChars[r % 300]![c % 300]!;
          ctx.fillStyle = `rgba(${cr|0},${cg|0},${cb|0},${alpha.toFixed(3)})`;
          ctx.fillText(ch, px + cellW / 2, py + cellH / 2);
        }
      }

      // Vignette during push
      if (pushProg > 0) {
        const vs = pushProg * 0.65;
        const g = ctx.createRadialGradient(cx, cy, W * 0.12, cx, cy, W * 0.65);
        g.addColorStop(0, `rgba(8,11,18,0)`);
        g.addColorStop(1, `rgba(8,11,18,${vs})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Brightness shimmer
      if (t >= T.eyeOpen && t < T.push) {
        const sh = Math.sin(t * 3.5) * 0.015;
        if (sh > 0) {
          ctx.fillStyle = `rgba(245,247,250,${sh})`;
          ctx.fillRect(0, 0, W, H);
        }
      }

      // Fade to black as we transition to void
      if (t >= T.pupil - 0.15 && t < T.pupil + 0.3) {
        const fadeout = clamp((t - (T.pupil - 0.15)) / 0.45, 0, 1);
        ctx.fillStyle = `rgba(8,11,18,${fadeout})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STARS (visible from pupil onward)
    // ══════════════════════════════════════════════════════════════════════════

    if (t >= T.pupil) {
      const fadeIn = clamp((t - T.pupil) / 0.4, 0, 1);

      stars.forEach(s => {
        const twinkle = (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5) * s.brightness;
        const b = twinkle * fadeIn;
        if (b < 0.05) return;

        let sx = (s.x * 0.5 + 0.5) * W;
        let sy = (s.y * 0.5 + 0.5) * H;

        // Gentle outward drift
        const elapsed = t - T.pupil;
        sx += Math.sin(elapsed * 0.15 + s.phase) * 6;
        sy += Math.cos(elapsed * 0.2 + s.phase) * 4;
        const dd = elapsed * (1 + s.layer) * 1.8;
        sx += (sx - W / 2) * dd * 0.0025;
        sy += (sy - H / 2) * dd * 0.0025;

        drawStar(ctx, sx, sy, s.size, b, s.isBlue);
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SCENE 3: STACKWEB forms (form → hold)
    // ══════════════════════════════════════════════════════════════════════════

    if (t >= T.form && wordReady) {
      const formDur = T.hold - T.form;
      const formProg = clamp((t - T.form) / formDur, 0, 1);

      ctx.font = `${fontSize}px "Courier New",monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      const maxDelay = wordFragments.reduce((mx, f) => Math.max(mx, f.delay), 0);

      wordFragments.forEach(f => {
        const fp = clamp((formProg - (f.delay / (maxDelay + 0.3))) / (1 - f.delay / (maxDelay + 0.3) + 0.001), 0, 1);
        if (fp <= 0) return;

        const ep = easeOutCubic(fp);
        const x = lerp(f.sx, f.tx, ep);
        const y = lerp(f.sy, f.ty, ep);

        // Colour transition: blue → white
        const bw = clamp((fp - 0.5) / 0.5, 0, 1);
        const cr = lerp(BLUE_RGB[0], ICE_RGB[0], bw);
        const cg = lerp(BLUE_RGB[1], ICE_RGB[1], bw);
        const cb = lerp(BLUE_RGB[2], ICE_RGB[2], bw);

        // Alpha: flicker early → solid late
        let alpha = clamp(fp * 1.8, 0, 1);
        if (fp < 0.35) {
          alpha *= (Math.sin(t * 25 + f.tx * 0.08) * 0.4 + 0.6);
        }
        if (alpha < 0.01) return;

        ctx.fillStyle = `rgba(${cr|0},${cg|0},${cb|0},${clamp(alpha, 0, 1).toFixed(3)})`;

        const nc = Math.max(1, Math.ceil(f.tw / cellW));
        for (let i = 0; i < nc; i++) {
          const ch = rowChars[f.row % 300]![(Math.floor(f.tx / cellW) + i) % 300]!;
          ctx.fillText(ch, x + i * cellW, y + cellH / 2);
        }
      });

      // ── Hold: brighten + scanline sweep ──
      if (t >= T.hold && t < T.reveal) {
        const hp = clamp((t - T.hold) / (T.reveal - T.hold), 0, 1);
        // Scanline sweep
        const sy = hp * H;
        ctx.fillStyle = `rgba(245,247,250,0.07)`;
        ctx.fillRect(0, sy - H * 0.01, W, H * 0.02);

        // Subtle blue edge glow on text
        if (hp > 0.3) {
          const ga = (hp - 0.3) * 0.12;
          ctx.shadowColor = `rgba(36,91,219,${ga})`;
          ctx.shadowBlur = 8;
          // Re-draw settled fragments with glow
          wordFragments.forEach(f => {
            const nc = Math.max(1, Math.ceil(f.tw / cellW));
            ctx.fillStyle = `rgba(245,247,250,0.9)`;
            for (let i = 0; i < nc; i++) {
              const ch = rowChars[f.row % 300]![(Math.floor(f.tx / cellW) + i) % 300]!;
              ctx.fillText(ch, f.tx + i * cellW, f.ty + cellH / 2);
            }
          });
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SCENE 4: Reveal (camera through letters → homepage)
    // ══════════════════════════════════════════════════════════════════════════

    if (t >= T.reveal) {
      const rp = clamp((t - T.reveal) / (T.end - T.reveal), 0, 1);
      const scale = 1 + rp * 10;

      // Redraw obsidian on top
      ctx.fillStyle = OBSIDIAN;
      ctx.fillRect(0, 0, W, H);

      // Knock out letter shapes (destination-out)
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);

      if (wordReady) {
        wordFragments.forEach(f => {
          const knockAlpha = clamp(rp * 3, 0, 1);
          ctx.fillStyle = `rgba(255,255,255,${knockAlpha})`;
          ctx.fillRect(f.tx - 1, f.ty - 1, f.tw + 2, cellH + 2);
        });
      }

      ctx.restore();
      ctx.globalCompositeOperation = "source-over";

      // Overall overlay fade
      const overlayOp = 1 - easeOutCubic(clamp(rp * 1.5, 0, 1));
      overlay.style.opacity = overlayOp.toFixed(3);

      if (rp > 0.05) {
        overlay.style.pointerEvents = "none";
        skip.style.pointerEvents = "auto";
      }
    }

    // ── Skip button ──
    if (t >= 0.4 && !completed) skip.style.opacity = "0.6";
  }

  // ── Loop ──

  function tick(ts: number) {
    if (destroyed || completed) return;
    if (startTime < 0) startTime = ts;

    if (!paused) {
      currentTime = freezeAt !== undefined ? freezeAt : (ts - startTime) / 1000;
    }

    render(currentTime);

    if (currentTime >= TOTAL_DURATION && freezeAt === undefined) {
      finish();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  // ── Finish / cleanup ──

  function finish() {
    if (completed) return;
    completed = true;

    [mainEl, headerEl, footerEl].forEach(el => el?.removeAttribute("inert"));
    document.documentElement.style.overflow = origHtmlOv;
    document.body.style.overflow = origBodyOv;

    overlay.style.transition = "opacity 0.2s ease";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    setTimeout(() => {
      overlay.remove();
      document.getElementById("main")?.focus({ preventScroll: true });
    }, 250);

    window.scrollTo(0, 0);
    onComplete();
  }

  function doSkip() {
    if (completed) return;
    cancelAnimationFrame(rafId);
    const t0 = performance.now();
    function skipTick(ts: number) {
      const p = clamp((ts - t0) / 300, 0, 1);
      ctx.fillStyle = OBSIDIAN;
      ctx.fillRect(0, 0, W, H);
      overlay.style.opacity = (1 - easeOutCubic(p)).toFixed(3);
      if (p >= 1) { finish(); return; }
      rafId = requestAnimationFrame(skipTick);
    }
    rafId = requestAnimationFrame(skipTick);
  }

  // ── Events ──
  skip.addEventListener("click", doSkip);
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); doSkip(); } };
  document.addEventListener("keydown", onKey);

  const onVis = () => {
    if (document.hidden) paused = true;
    else { paused = false; if (startTime > 0) startTime = performance.now() - currentTime * 1000; }
  };
  document.addEventListener("visibilitychange", onVis);

  window.addEventListener("resize", resize);

  // Fail-safe
  const failSafe = setTimeout(() => { if (!completed) { console.warn("[sw-intro] failsafe"); finish(); } }, 15000);

  // Start
  skip.focus({ preventScroll: true });
  rafId = requestAnimationFrame(tick);

  return {
    skip: doSkip,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(failSafe);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      [mainEl, headerEl, footerEl].forEach(el => el?.removeAttribute("inert"));
      document.documentElement.style.overflow = origHtmlOv;
      document.body.style.overflow = origBodyOv;
      overlay.remove();
    },
    seekTo(t: number) {
      currentTime = clamp(t, 0, TOTAL_DURATION);
      startTime = performance.now() - currentTime * 1000;
    },
  };
}
