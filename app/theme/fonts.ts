import { Courgette } from "next/font/google";

export const courgette = Courgette({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-courgette",
  display: "swap",
});

export const fonts = {
  courgette,
};

export const fontVariables = [courgette.variable].join(" ");
