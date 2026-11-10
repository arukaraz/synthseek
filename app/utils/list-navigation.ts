export function stepIndex(current: number, step: number, length: number): number {
  return length === 0 ? 0 : (current + step + length) % length;
}
