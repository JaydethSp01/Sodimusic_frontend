"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { cn } from "@/lib/utils";

export type CrewMember = { name: string; genre: string; bio: string };

export function ArtistsCrewGrid({ members }: { members: CrewMember[] }) {
  return (
    <motion.ul
      className="grid gap-6 md:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {members.map((m) => (
        <motion.li key={m.name} variants={fadeInUp}>
          <article
            className={cn(
              "group h-full overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300",
              "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(255,107,0,0.12)]",
            )}
          >
            <div className="relative aspect-[4/5] w-full">
              <PlaceholderCover seed={m.name} className="absolute inset-0" />
            </div>
            <div className="p-4">
              <h3 className="font-display text-2xl text-foreground">{m.name}</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-primary">{m.genre}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{m.bio}</p>
            </div>
          </article>
        </motion.li>
      ))}
    </motion.ul>
  );
}
