"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Clips its child and slides it slower than the page, so photos drift as you scroll past. */
export function Parallax({ children, className, range = 9 }: { children: React.ReactNode; className?: string; range?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute -inset-[12%]" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
