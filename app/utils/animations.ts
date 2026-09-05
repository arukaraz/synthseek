import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    y: 10,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const playerPanel: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: 14,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

export const scale: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" },
  },
};

export const staggerItem: Variants = {
  hidden: {
    y: 10,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    y: 5,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContent: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const stageFlip: Variants = {
  enterFromRight: { rotateY: 70, opacity: 0 },
  enterFromLeft: { rotateY: -70, opacity: 0 },
  settled: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  leaveToRight: {
    rotateY: -70,
    opacity: 0,
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  },
  leaveToLeft: {
    rotateY: 70,
    opacity: 0,
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  },
};

export const stageFade: Variants = {
  enterFromRight: { opacity: 0 },
  enterFromLeft: { opacity: 0 },
  settled: { opacity: 1, transition: { duration: 0.18 } },
  leaveToRight: { opacity: 0, transition: { duration: 0.12 } },
  leaveToLeft: { opacity: 0, transition: { duration: 0.12 } },
};
