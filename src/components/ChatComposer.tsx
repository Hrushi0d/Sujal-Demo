import * as React from "react";
import { ArrowUp, Paperclip, Sparkles, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isStreaming,
  placeholder = "Describe a UI…",
  autoFocus,
  className,
}: ChatComposerProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const max = 24 * 7 + 16;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSubmit();
    }
  };

  const canSend = !isStreaming && value.trim().length > 0;

  return (
    <div
      className={cn(
        "surface composer-glow w-full rounded-2xl px-4 pb-3 pt-3.5",
        "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_10px_30px_-12px_rgba(0,0,0,0.45)]",
        "transition-shadow",
        className
      )}
    >
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        rows={1}
        autoFocus={autoFocus}
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          tabIndex={-1}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-300/80" />
          <span>Skills</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            tabIndex={-1}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <button
            type="button"
            disabled={!canSend}
            onClick={onSubmit}
            aria-label="Send"
            className={cn(
              "relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              canSend
                ? "gradient-brand text-black shadow-[0_0_18px_-2px_rgba(16,185,129,0.55)] hover:brightness-110"
                : "bg-white/[0.06] text-muted-foreground"
            )}
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
