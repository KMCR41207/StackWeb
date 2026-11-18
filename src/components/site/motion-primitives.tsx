import { motion, useInView, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

// Shared easing — snappy spring-like cubic-bezier
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Text that slides up out of a mask, line by line — fires on mount. */
export function MaskedLines({
  lines,
  className,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={reduced ? { y: 0 } : { y: "108%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.07,
              ease: EASE_OUT,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Scroll-triggered masked reveal — each line slides up out of a clip when
 * the element enters the viewport. Fires once; respects reduced-motion.
 */
export function MaskedLinesOnScroll({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -48px 0px" });

  return (
    <span ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={reduced ? { y: 0 } : { y: "104%" }}
            animate={inView || reduced ? { y: 0 } : { y: "104%" }}
            transition={{
              duration: 0.72,
              delay: i * 0.065,
              ease: EASE_OUT,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** A quiet, slow rise used sparingly for supporting copy. */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -32px 0px", amount: 0 }}
      transition={{ duration: 0.65, delay, ease: EASE_OUT }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/** Fade in with no vertical movement — for elements that should just appear. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -32px 0px", amount: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
