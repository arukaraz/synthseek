import { cn } from "@utils/cn";
import { forwardRef } from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const innerSizeClasses = {
  sm: "h-[calc(100%-2px)] w-[calc(100%-2px)]",
  md: "h-[calc(100%-2px)] w-[calc(100%-2px)]",
  lg: "h-[calc(100%-3px)] w-[calc(100%-3px)]",
};

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
