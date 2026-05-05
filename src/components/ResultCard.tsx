import { useState } from "react";
import { Renderer } from "@openuidev/react-lang";
import { ThemeProvider, defaultDarkTheme } from "@openuidev/react-ui";
import { Maximize2, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { library } from "@/lib/openui";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  source: string | null;
  isStreaming?: boolean;
  onExpand?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

export function ResultCard({
  source,
  isStreaming,
  onExpand,
  onRegenerate,
  className,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  const showSkeleton = !source && isStreaming;

  return (
    <div
      className={cn(
        "surface relative overflow-hidden rounded-2xl",
        "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            {isStreaming && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            )}
            <span
              className={cn(
                "relative inline-flex h-1.5 w-1.5 rounded-full",
                isStreaming ? "bg-emerald-400" : "bg-emerald-400/60"
              )}
            />
          </span>
          <span>{isStreaming ? "Generating" : "Generated UI"}</span>
        </div>
        <div className="flex items-center gap-1">
          {onRegenerate && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onRegenerate}
              disabled={isStreaming}
              className="text-muted-foreground"
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={handleCopy}
            disabled={!source}
            className="text-muted-foreground"
            title="Copy OpenUI Lang"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          {onExpand && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onExpand}
              className="text-muted-foreground"
              title="Open full screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="openui-render relative max-h-[640px] overflow-y-auto">
        <ThemeProvider mode="dark" darkTheme={defaultDarkTheme}>
          {showSkeleton ? (
            <div className="flex items-center justify-center px-6 py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Composing components…</span>
            </div>
          ) : source ? (
            <div className="px-5 py-5">
              <Renderer
                response={source}
                library={library}
                isStreaming={Boolean(isStreaming)}
              />
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No content yet.
            </div>
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}
