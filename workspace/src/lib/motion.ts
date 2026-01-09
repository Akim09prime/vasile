export const easeOut = [0.16, 1, 0.3, 1];

export const fadeUp = {
  initial: { 
    opacity: 0, 
    y: 12 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: "easeInOut" },
};
