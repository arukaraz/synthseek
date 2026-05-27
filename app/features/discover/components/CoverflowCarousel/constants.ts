export const COVERFLOW_CONFIG = {
  maxVisible: 20,
  maxRotation: 50,
  spacingRatio: 0.09,
} as const;

export const SKELETON_CARDS = [
  { x: "-38vw", rotate: 50, scale: 0.65, opacity: 0.3, z: 95, hideOnMobile: true },
  { x: "-28vw", rotate: 45, scale: 0.7, opacity: 0.5, z: 96, hideOnMobile: true },
  { x: "-18vw", rotate: 35, scale: 0.8, opacity: 0.7, z: 97 },
  { x: "-9vw", rotate: 20, scale: 0.9, opacity: 0.85, z: 98 },
  { x: "0", rotate: 0, scale: 1, opacity: 1, z: 100, isCenter: true },
  { x: "9vw", rotate: -20, scale: 0.9, opacity: 0.85, z: 98 },
  { x: "18vw", rotate: -35, scale: 0.8, opacity: 0.7, z: 97 },
  { x: "28vw", rotate: -45, scale: 0.7, opacity: 0.5, z: 96, hideOnMobile: true },
  { x: "38vw", rotate: -50, scale: 0.65, opacity: 0.3, z: 95, hideOnMobile: true },
];
