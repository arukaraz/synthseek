import { useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface SwipeHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

const DEFAULT_THRESHOLD = 50;

export function useSwipe(options: UseSwipeOptions = {}): SwipeHandlers {
  const { onSwipeLeft, onSwipeRight, threshold = DEFAULT_THRESHOLD } = options;
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  function onTouchStart(event: React.TouchEvent) {
    startX.current = event.touches[0]?.clientX ?? null;
    deltaX.current = 0;
  }

  function onTouchMove(event: React.TouchEvent) {
    if (startX.current === null) return;
    const currentX = event.touches[0]?.clientX ?? startX.current;
    deltaX.current = currentX - startX.current;
  }

  function onTouchEnd() {
    if (startX.current === null) return;
    if (deltaX.current <= -threshold) {
      onSwipeLeft?.();
    } else if (deltaX.current >= threshold) {
      onSwipeRight?.();
    }
    startX.current = null;
    deltaX.current = 0;
  }

  return { onTouchStart, onTouchMove, onTouchEnd };
}
