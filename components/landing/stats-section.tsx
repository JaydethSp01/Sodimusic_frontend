"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import CountUp from "react-countup";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { SiteStat } from "@/types/site-content";

export function StatsSection({ stats }: { stats: SiteStat[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (inView) {
      setStart(true);
    }
  }, [inView]);

  if (!stats.length) {
    return null;
  }

  return (
    <motion.div
      ref={ref}
      className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
      variants={staggerContainer}
      initial="hidden"
      animate={start ? "visible" : "hidden"}
    >
      {stats.map((item, i) => (
        <motion.div
          key={`${item.label}-${i}`}
          variants={fadeInUp}
          className="rounded-lg border border-border bg-background-card p-5 text-center transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(255,107,0,0.08)] sm:p-6"
        >
          <p className="font-display text-5xl text-primary md:text-6xl">
            {start ? <CountUp end={item.value} duration={2} suffix={item.suffix} /> : `0${item.suffix}`}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {item.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
