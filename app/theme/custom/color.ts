import type { Oklch } from "./types";

const FUNCTION_NAME = "oklch";
const ACHROMATIC_CHROMA = 0.0001;
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_INVERSE_THRESHOLD = 0.0031308;
const HEX_DIGITS = "0123456789abcdef";

interface NumberRead {
  value: number;
  rest: string;
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function isSpace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f";
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function readNumber(text: string): NumberRead | null {
  let index = 0;
  if (text[index] === "+" || text[index] === "-") index += 1;
  let digits = 0;
  while (index < text.length && isDigit(text[index])) {
    index += 1;
    digits += 1;
  }
  if (text[index] === ".") {
    index += 1;
    while (index < text.length && isDigit(text[index])) {
      index += 1;
      digits += 1;
    }
  }
  if (digits === 0) return null;
  return { value: Number(text.slice(0, index)), rest: text.slice(index) };
}

function readComponent(token: string, allowPercent: boolean, unit: string): number | null {
  if (token === "none") return 0;
  const read = readNumber(token);
  if (!read) return null;
  if (read.rest === "") return read.value;
  if (allowPercent && read.rest === "%") return read.value / 100;
  if (unit !== "" && read.rest === unit) return read.value;
  return null;
}

function tokensOf(inner: string): string[] | null {
  const tokens: string[] = [];
  let current = "";
  for (const char of inner) {
    if (isSpace(char)) {
      if (current !== "") tokens.push(current);
      current = "";
    } else if (char === "/") {
      if (current !== "") tokens.push(current);
      current = "";
      tokens.push("/");
    } else if (char === "(" || char === ")" || char === ",") {
      return null;
    } else {
      current += char;
    }
  }
  if (current !== "") tokens.push(current);
  return tokens;
}

function parseFunction(text: string): Oklch | null {
  const prefix = `${FUNCTION_NAME}(`;
  if (!text.startsWith(prefix) || !text.endsWith(")")) return null;
  const tokens = tokensOf(text.slice(prefix.length, -1));
  if (!tokens) return null;
  if (tokens.length !== 3 && !(tokens.length === 5 && tokens[3] === "/")) return null;
  const l = readComponent(tokens[0], true, "");
  const c = readComponent(tokens[1], false, "");
  const h = readComponent(tokens[2], false, "deg");
  const alpha = tokens.length === 5 ? readComponent(tokens[4], true, "") : 1;
  if (l === null || c === null || h === null || alpha === null) return null;
  return { l: clamp(l, 0, 1), c: Math.max(0, c), h, alpha: clamp(alpha, 0, 1) };
}

function srgbToLinear(channel: number): number {
  return channel <= SRGB_LINEAR_THRESHOLD ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  return channel <= SRGB_LINEAR_INVERSE_THRESHOLD ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function fromLinearRgb(r: number, g: number, b: number, alpha: number): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bAxis);
  const hue = chroma < ACHROMATIC_CHROMA ? 0 : ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;
  return { l: lightness, c: chroma, h: hue, alpha };
}

function toLinearRgb(color: Oklch): [number, number, number] {
  const radians = (color.h * Math.PI) / 180;
  const a = color.c * Math.cos(radians);
  const b = color.c * Math.sin(radians);
  const l = (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function hexDigit(char: string): number {
  return HEX_DIGITS.indexOf(char.toLowerCase());
}

export function fromHex(hex: string): Oklch | null {
  if (!hex.startsWith("#")) return null;
  const digits = hex.slice(1);
  if (![3, 4, 6, 8].includes(digits.length)) return null;
  const values: number[] = [];
  for (const char of digits) {
    const value = hexDigit(char);
    if (value < 0) return null;
    values.push(value);
  }
  const short = digits.length <= 4;
  const bytes: number[] = [];
  for (let index = 0; index < values.length; index += short ? 1 : 2) {
    bytes.push(short ? values[index] * 17 : values[index] * 16 + values[index + 1]);
  }
  const alpha = bytes.length === 4 ? bytes[3] / 255 : 1;
  return fromLinearRgb(srgbToLinear(bytes[0] / 255), srgbToLinear(bytes[1] / 255), srgbToLinear(bytes[2] / 255), alpha);
}

export function parseColor(value: string): Oklch | null {
  const text = value.trim().toLowerCase();
  if (text.startsWith("#")) return fromHex(text);
  return parseFunction(text);
}

function rounded(value: number, decimals: number): string {
  const factor = 10 ** decimals;
  return String(Math.round(value * factor) / factor);
}

export function formatOklch(color: Oklch): string {
  const alpha = Math.round(color.alpha * 100) / 100;
  const body = `${rounded(color.l, 3)} ${rounded(color.c, 3)} ${rounded(color.h, 1)}`;
  return alpha < 1 ? `${FUNCTION_NAME}(${body} / ${rounded(alpha, 2)})` : `${FUNCTION_NAME}(${body})`;
}

export function toHex(color: Oklch): string {
  const [r, g, b] = toLinearRgb(color);
  let hex = "#";
  for (const channel of [r, g, b]) {
    const byte = Math.round(clamp(linearToSrgb(clamp(channel, 0, 1)), 0, 1) * 255);
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

export function relativeLuminance(color: Oklch): number {
  const [r, g, b] = toLinearRgb(color).map((channel) => clamp(linearToSrgb(clamp(channel, 0, 1)), 0, 1));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: Oklch, b: Oklch): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function followedColor(baseBefore: Oklch, baseAfter: Oklch, follower: Oklch): Oklch {
  const chroma =
    baseBefore.c > ACHROMATIC_CHROMA
      ? follower.c * (baseAfter.c / baseBefore.c)
      : Math.max(0, follower.c + (baseAfter.c - baseBefore.c));
  return {
    l: clamp(follower.l + (baseAfter.l - baseBefore.l), 0, 1),
    c: chroma,
    h: (((follower.h + (baseAfter.h - baseBefore.h)) % 360) + 360) % 360,
    alpha: follower.alpha,
  };
}
