import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/**
 * Minimal abstract mark inspired by the landing reference: two leaf-like
 * curves forming an "S" silhouette. Pure SVG, currentColor-aware.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 4c-4.5 0-8 3.5-8 8 0 3.6 2.5 6.6 6 7.7-3 1.3-5 4.3-5 7.7 0 .3.2.6.6.6 4.5 0 8-3.5 8-8 0-3.6-2.5-6.6-6-7.7 3-1.3 5-4.3 5-7.7 0-.3-.2-.6-.6-.6Z" />
      <path
        d="M10 4c-.3 0-.6.3-.6.6 0 3.4 2 6.4 5 7.7C10.9 13.4 8.4 16.4 8.4 20c0 4.5 3.5 8 8 8 .3 0 .6-.3.6-.6 0-3.4-2-6.4-5-7.7 3.5-1.1 6-4.1 6-7.7 0-4.5-3.5-8-8-8Z"
        opacity="0.45"
      />
    </svg>
  );
}
