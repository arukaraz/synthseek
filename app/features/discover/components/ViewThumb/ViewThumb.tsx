"use client";

import { viewThumbMarks } from "./helpers";
import { thumbFill, thumbStroke, viewThumb } from "./styles";
import type { ViewThumbProps } from "./types";

export function ViewThumb({ block }: ViewThumbProps) {
  return (
    <svg viewBox="0 0 100 40" className={viewThumb()} data-thumb={block} aria-hidden>
      {viewThumbMarks(block).map((mark, index) => {
        switch (mark.kind) {
          case "box":
            return (
              <rect
                key={index}
                x={mark.x}
                y={mark.y}
                width={mark.width}
                height={mark.height}
                rx={mark.radius}
                className={thumbFill({ tone: mark.tone })}
              />
            );
          case "dot":
            return (
              <circle key={index} cx={mark.cx} cy={mark.cy} r={mark.r} className={thumbFill({ tone: mark.tone })} />
            );
          case "shape":
            return <path key={index} d={mark.d} className={thumbFill({ tone: mark.tone })} />;
          case "line":
            return <path key={index} d={mark.d} className={thumbStroke({ tone: mark.tone })} />;
        }
      })}
    </svg>
  );
}
