import { describe, it, expect } from "vitest";
import { COVERFLOW_CONFIG, getCircularOffset, calculateAllTransforms } from "../transforms";

describe("COVERFLOW_CONFIG", () => {
  it("has maxVisible property", () => {
    expect(COVERFLOW_CONFIG.maxVisible).toBe(20);
  });

  it("has maxRotation property", () => {
    expect(COVERFLOW_CONFIG.maxRotation).toBe(50);
  });

  it("has spacingRatio property", () => {
    expect(COVERFLOW_CONFIG.spacingRatio).toBe(0.09);
  });
});

describe("getCircularOffset", () => {
  it("returns 0 when index equals current", () => {
    expect(getCircularOffset(5, 5, 10)).toBe(0);
  });

  it("returns positive offset for index after current", () => {
    expect(getCircularOffset(7, 5, 10)).toBe(2);
  });

  it("returns negative offset for index before current", () => {
    expect(getCircularOffset(3, 5, 10)).toBe(-2);
  });

  it("wraps around from end to beginning (positive direction)", () => {
    expect(getCircularOffset(9, 1, 10)).toBe(-2);
  });

  it("wraps around from beginning to end (negative direction)", () => {
    expect(getCircularOffset(0, 8, 10)).toBe(2);
  });

  it("handles first element when current is last", () => {
    expect(getCircularOffset(0, 9, 10)).toBe(1);
  });

  it("handles last element when current is first", () => {
    expect(getCircularOffset(9, 0, 10)).toBe(-1);
  });

  it("returns half of total when at maximum distance", () => {
    expect(getCircularOffset(5, 0, 10)).toBe(5);
  });
});

describe("calculateAllTransforms", () => {
  const containerWidth = 1000;

  it("returns array with length equal to totalCards", () => {
    const transforms = calculateAllTransforms(10, 0, containerWidth);
    expect(transforms.length).toBe(10);
  });

  it("center card has scale 1, opacity 1, zIndex 100, rotateY 0", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    const centerCard = transforms[5];
    expect(centerCard.scale).toBe(1);
    expect(centerCard.opacity).toBe(1);
    expect(centerCard.zIndex).toBe(100);
    expect(centerCard.rotateY).toBe(0);
    expect(centerCard.translateX).toBe(0);
  });

  it("adjacent cards have reduced scale and opacity", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    const leftCard = transforms[4];
    const rightCard = transforms[6];

    expect(leftCard.scale).toBeLessThan(1);
    expect(leftCard.opacity).toBeLessThan(1);
    expect(leftCard.zIndex).toBeLessThan(100);

    expect(rightCard.scale).toBeLessThan(1);
    expect(rightCard.opacity).toBeLessThan(1);
    expect(rightCard.zIndex).toBeLessThan(100);
  });

  it("left cards have positive rotateY (rotate towards viewer on right)", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    const leftCard = transforms[4];
    expect(leftCard.rotateY).toBeGreaterThan(0);
  });

  it("right cards have negative rotateY (rotate towards viewer on left)", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    const rightCard = transforms[6];
    expect(rightCard.rotateY).toBeLessThan(0);
  });

  it("cards beyond maxVisible have opacity 0", () => {
    const transforms = calculateAllTransforms(50, 0, containerWidth);
    const farCard = transforms[25];
    expect(farCard.opacity).toBe(0);
  });

  it("cards beyond maxVisible have extreme rotation", () => {
    const transforms = calculateAllTransforms(50, 0, containerWidth);
    const farCard = transforms[25];
    expect(Math.abs(farCard.rotateY)).toBe(90);
  });

  it("calculates translateX based on spacing", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    const spacing = containerWidth * COVERFLOW_CONFIG.spacingRatio;
    const rightCard = transforms[6];
    expect(rightCard.translateX).toBeCloseTo(spacing);
  });

  it("handles single card", () => {
    const transforms = calculateAllTransforms(1, 0, containerWidth);
    expect(transforms.length).toBe(1);
    expect(transforms[0].scale).toBe(1);
    expect(transforms[0].opacity).toBe(1);
  });

  it("handles current index at 0", () => {
    const transforms = calculateAllTransforms(10, 0, containerWidth);
    const centerCard = transforms[0];
    expect(centerCard.scale).toBe(1);
    expect(centerCard.opacity).toBe(1);
  });

  it("handles current index at last position", () => {
    const transforms = calculateAllTransforms(10, 9, containerWidth);
    const centerCard = transforms[9];
    expect(centerCard.scale).toBe(1);
    expect(centerCard.opacity).toBe(1);
  });

  it("zIndex decreases with distance from center", () => {
    const transforms = calculateAllTransforms(10, 5, containerWidth);
    expect(transforms[5].zIndex).toBeGreaterThan(transforms[4].zIndex);
    expect(transforms[4].zIndex).toBeGreaterThan(transforms[3].zIndex);
  });
});
