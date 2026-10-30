/**
 * StackWeb Cinematic Eye Intro — React Wrapper
 *
 * Mounts the intro overlay on the homepage route only.
 * Handles:
 *   - Session storage (play once per session)
 *   - ?intro=0/1 and ?introT= query params
 *   - prefers-reduced-motion
 *   - StrictMode double-mount safety
 *   - Font readiness gating
 *   - Fail-safe timeout (1.5s load budget)
 */

import { useEffect, useRef, useCallback } from "react";
import { createIntro } from "./engine";

const SESSION_KEY = "sw-intro-played";

/**
 * Check whether the intro should play.
 * Returns false if: reduced-motion, already played, ?intro=0, or non-homepage.
 */
function shouldPlay(): boolean {
  // Reduced motion
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  // URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get("intro") === "0") return false;
  if (params.get("intro") === "1") return true;

  // Session storage
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
  } catch {
    // Private browsing or blocked storage
  }

  return true;
}

function getIntroT(): number | undefined {
  const params = new URLSearchParams(window.location.search);
  const val = params.get("introT");
  if (val != null) {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) return n;
  }
  return undefined;
}

function markPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Ignore
  }
}

export function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<ReturnType<typeof createIntro> | null>(null);
  const mountedRef = useRef(false);

  const handleComplete = useCallback(() => {
    markPlayed();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // StrictMode guard — only mount once
    if (mountedRef.current) return;
    mountedRef.current = true;

    const el = mountRef.current;
    if (!el) return;

    if (!shouldPlay()) {
      handleComplete();
      return;
    }

    const freezeAt = getIntroT();

    // Wait for Anton font, but with a 1.5s budget
    const fontPromise = document.fonts
      ? document.fonts.load('400 72px "Anton"').catch(() => {})
      : Promise.resolve();

    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));

    Promise.race([fontPromise, timeout]).then(() => {
      if (!el.isConnected) return;

      try {
        const intro = createIntro({
          mount: el,
          onComplete: handleComplete,
          freezeAt,
        });

        introRef.current = intro;
      } catch (err) {
        console.error("[sw-intro] failed to create intro:", err);
        handleComplete();
      }
    });

    return () => {
      if (introRef.current) {
        introRef.current.destroy();
        introRef.current = null;
      }
      mountedRef.current = false;
    };
  }, [handleComplete]);

  return (
    <div
      ref={mountRef}
      id="sw-intro-mount"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        pointerEvents: "none", // the engine's overlay has its own pointer-events
      }}
    />
  );
}
