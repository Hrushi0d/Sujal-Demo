import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground focus:border-white/15 focus:outline-none focus:ring-1 focus:ring-white/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
