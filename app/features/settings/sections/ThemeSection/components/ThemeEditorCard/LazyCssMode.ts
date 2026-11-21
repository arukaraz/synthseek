import dynamic from "next/dynamic";

export const LazyCssMode = dynamic(() => import("../CssMode/CssMode").then((module) => module.CssMode), {
  ssr: false,
});
