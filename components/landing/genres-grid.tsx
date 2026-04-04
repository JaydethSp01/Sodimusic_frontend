"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

const genres = [
  {
    name: "TRAP",
    desc: "Desde los callejones de María La Baja hacia el mundo",
    border: "border-[#FF6B00]/20 hover:border-[#FF6B00]/60",
    bg: "bg-[rgba(255,107,0,0.05)]",
    color: "#FF6B00",
  },
  {
    name: "REGGAETON",
    desc: "Caribe urbano con cadencia y calle",
    border: "border-[#9B59B6]/20 hover:border-[#9B59B6]/60",
    bg: "bg-[rgba(155,89,182,0.05)]",
    color: "#9B59B6",
  },
  {
    name: "AFROBEAT",
    desc: "La raíz palenquera en ritmo moderno",
    border: "border-[#D4A017]/20 hover:border-[#D4A017]/60",
    bg: "bg-[rgba(212,160,23,0.05)]",
    color: "#D4A017",
  },
  {
    name: "DANCEHALL",
    desc: "El reggae del Caribe colombiano",
    border: "border-[#27AE60]/20 hover:border-[#27AE60]/60",
    bg: "bg-[rgba(39,174,96,0.05)]",
    color: "#27AE60",
  },
];

export function GenresGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {genres.map((g) => (
        <motion.article
          key={g.name}
          variants={fadeInUp}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "rounded-lg border p-6 shadow-sm transition-colors duration-300",
            g.border,
            g.bg,
          )}
        >
          <h3 className="font-display text-5xl tracking-wide" style={{ color: g.color }}>
            {g.name}
          </h3>
          <p className="mt-3 font-body text-sm text-[var(--text-muted)]">{g.desc}</p>
        </motion.article>
      ))}
    </motion.div>
  );
}
