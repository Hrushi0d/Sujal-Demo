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
        "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-[13px] text-foreground transition-colors placeholder:text-muted-foreground focus:border-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
