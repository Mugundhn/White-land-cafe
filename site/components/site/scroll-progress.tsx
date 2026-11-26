"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/** A hairline at the top of the page that fills as you scroll. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left mix-blend-difference"
      style={{ scaleX, backgroundColor: "#fff" }}
    />
  );
}
