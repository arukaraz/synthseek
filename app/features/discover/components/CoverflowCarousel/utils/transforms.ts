export interface CardTransform {
  translateX: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export const COVERFLOW_CONFIG = {
  maxVisible: 20,
  maxRotation: 50,
  spacingRatio: 0.09,
} as const;

export function getCircularOffset(index: number, currentIndex: number, total: number): number {
  const raw = (((index - currentIndex) % total) + total) % total;
  return raw > total / 2 ? raw - total : raw;
}

export function calculateAllTransforms(
  totalCards: number,
  currentIndex: number,
  containerWidth: number
): CardTransform[] {
  const { maxVisible, maxRotation, spacingRatio } = COVERFLOW_CONFIG;
  const spacing = containerWidth * spacingRatio;

  return Array.from({ length: totalCards }, (_, i) => {
    const offset = getCircularOffset(i, currentIndex, totalCards);
    const absOffset = Math.abs(offset);

    if (absOffset > maxVisible) {
      return {
        translateX: offset * spacing,
        rotateY: offset > 0 ? -90 : 90,
        scale: 0.5,
        opacity: 0,
        zIndex: 0,
      };
    }

    if (offset === 0) {
      return { translateX: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 100 };
    }

    const direction = offset > 0 ? -1 : 1;
    return {
      translateX: offset * spacing,
      rotateY: direction * maxRotation * (absOffset / maxVisible),
      scale: 1 - absOffset * 0.08,
      opacity: 1 - absOffset * 0.15,
      zIndex: 100 - absOffset * 10,
    };
  });
}
