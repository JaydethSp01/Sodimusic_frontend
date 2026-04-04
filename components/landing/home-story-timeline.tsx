"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export type StoryMilestone = { year: string; title: string; desc: string };

export function HomeStoryTimeline({ milestones }: { milestones: StoryMilestone[] }) {
  return (
    <>
      <div className="relative mt-12 hidden lg:block">
        <div
          className="absolute left-0 right-0 top-[22px] border-t border-dashed border-primary/50"
          aria-hidden
        />
        <motion.ul
          className="relative grid grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {milestones.map((m) => (
            <motion.li key={m.year} variants={fadeInUp} className="relative pt-10 text-center">
              <span
                className="absolute left-1/2 top-[14px] z-[1] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_rgba(8,8,8,0.9)]"
                aria-hidden
              />
              <p className="font-mono text-xs tracking-widest text-primary">{m.year}</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">{m.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{m.desc}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        className="relative mt-10 lg:hidden"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        <div className="absolute bottom-0 left-[11px] top-2 border-l border-dashed border-primary/50" aria-hidden />
        <ul className="space-y-8 pl-10">
          {milestones.map((m) => (
            <motion.li key={m.year} variants={fadeInUp} className="relative">
              <span
                className="absolute -left-[21px] top-1 z-[1] h-3 w-3 rounded-full border-2 border-primary bg-background"
                aria-hidden
              />
              <p className="font-mono text-xs tracking-widest text-primary">{m.year}</p>
              <h3 className="mt-1 font-display text-xl text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{m.desc}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}
