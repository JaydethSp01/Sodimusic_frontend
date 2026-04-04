"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function HomeFadeSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className={className}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-56px" }}
    >
      {children}
    </motion.section>
  );
}

export function HomeFigureMotion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.figure
      className={className}
      initial={{ opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.figure>
  );
}

export function HomeStagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

export function HomeStaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}
