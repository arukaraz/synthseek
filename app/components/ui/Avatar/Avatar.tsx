import { cn } from "@utils/cn";
import { forwardRef } from "react";
import { innerSizeClasses, sizeClasses } from "./styles";
import type { AvatarProps } from "./types";

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ className, size = "md", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "from-primary-500 to-accent-500 relative rounded-full bg-gradient-to-br p-0.5",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-surface/80 flex h-full w-full items-center justify-center rounded-full",
          innerSizeClasses[size]
        )}
      >
        {children}
      </div>
    </div>
  );
});

Avatar.displayName = "Avatar";
