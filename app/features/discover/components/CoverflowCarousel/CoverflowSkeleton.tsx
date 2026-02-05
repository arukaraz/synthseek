"use client";

import { staggerItem } from "@utils/animations";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";

const SKELETON_CARDS = [
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

const getPulseAnimation = (baseOpacity: number) => ({
  opacity: [baseOpacity * 0.6, baseOpacity, baseOpacity * 0.6],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});

export function CoverflowSkeleton() {
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      className="group/carousel relative w-full overflow-hidden"
    >
      <div
        className="relative mx-auto aspect-square w-full sm:aspect-4/3 lg:aspect-16/5"
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      >
        {SKELETON_CARDS.map((card, index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute top-1/2 left-1/2 aspect-square h-[70%] rounded-xl shadow-2xl sm:h-[85%] sm:rounded-2xl",
              card.isCenter ? "bg-fg/15 ring-2 ring-white/10" : "bg-fg/10",
              card.hideOnMobile && "hidden sm:block"
            )}
            initial={{
              x: "-50%",
              y: "-50%",
              translateX: card.x,
              rotateY: card.rotate,
              scale: card.scale,
              opacity: 0,
            }}
            animate={{
              x: "-50%",
              y: "-50%",
              translateX: card.x,
              rotateY: card.rotate,
              scale: card.scale,
              ...getPulseAnimation(card.opacity),
            }}
            transition={{
              type: "tween",
              duration: 0.5,
              ease: "easeOut",
            }}
            style={{ zIndex: card.z }}
          />
        ))}
      </div>
    </motion.div>
  );
}
