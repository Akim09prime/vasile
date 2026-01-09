
export const easeOutCinematic = [0.16, 1, 0.3, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOutCinematic,
    },
  },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: "easeInOut" },
};
