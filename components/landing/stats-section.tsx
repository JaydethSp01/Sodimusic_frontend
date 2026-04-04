"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import CountUp from "react-countup";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const items = [
  { value: 50, suffix: "+", label: "producciones" },
  { value: 9, suffix: "", label: "años activos" },
  { value: 5, suffix: "", label: "géneros" },
  { value: 3, suffix: "", label: "países" },
];

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (inView) {
      setStart(true);
    }
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4"
      variants={staggerContainer}
      initial="hidden"
      animate={start ? "visible" : "hidden"}
    >
      {items.map((item) => (
        <motion.div
          key={item.label}
          variants={fadeInUp}
          className="rounded-lg border border-border bg-background-card p-6 text-center transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(255,107,0,0.08)]"
        >
          <p className="font-display text-5xl text-primary md:text-6xl">
            {start ? <CountUp end={item.value} duration={2} suffix={item.suffix} /> : "0"}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {item.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
