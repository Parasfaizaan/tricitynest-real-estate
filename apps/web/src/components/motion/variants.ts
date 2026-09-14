import type { Variants } from "motion/react";

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const motionDurations = {
  micro: 0.18,
  button: 0.24,
  modal: 0.3,
  card: 0.42,
  section: 0.58,
  heroText: 0.62,
  heroSlide: 0.85,
  kenBurns: 5.8,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: motionDurations.section, ease: motionEase } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: motionDurations.section, ease: motionEase } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: motionDurations.card, ease: motionEase } },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: motionDurations.card, ease: motionEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: motionDurations.modal, ease: motionEase } },
};

export const sectionReveal = fadeUp;

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: motionEase } },
};
