"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

const genres = [
  {
    name: "CHAMPETA",
    desc: "Donde empezó todo: María La Baja y la costa cerca de Cartagena, cuna del género y los ritmos africanos en el barrio.",
    border: "border-[#E85D04]/20 hover:border-[#E85D04]/60",
    bg: "bg-[rgba(232,93,4,0.06)]",
    color: "#E85D04",
  },
  {
    name: "TRAP",
    desc: "El mismo barrio, otra piel: la champeta en el ADN y el trap como proyección global.",
    border: "border-[#FF6B00]/20 hover:border-[#FF6B00]/60",
    bg: "bg-[rgba(255,107,0,0.05)]",
    color: "#FF6B00",
  },
  {
    name: "REGGAETON",
    desc: "Caribe urbano con cadencia de picó y calle",
    border: "border-[#9B59B6]/20 hover:border-[#9B59B6]/60",
    bg: "bg-[rgba(155,89,182,0.05)]",
    color: "#9B59B6",
  },
  {
    name: "AFROBEAT",
    desc: "La raíz africana que ya sonaba en la costa, en ritmo actual",
    border: "border-[#D4A017]/20 hover:border-[#D4A017]/60",
    bg: "bg-[rgba(212,160,23,0.05)]",
    color: "#D4A017",
  },
  {
    name: "DANCEHALL",
    desc: "Reggae y caribe que conviven con la champeta en la misma esquina sonora",
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
