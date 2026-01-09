export const easeOut = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0.06) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { y: 0 },
};
