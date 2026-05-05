import * as React from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLLMConfig, providerLabel, PROVIDERS } from "@/lib/llm";
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
  placeholder = "Search for the web as would normally do.",
  autoFocus,
  className,
}: ChatComposerProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const cfg = useLLMConfig();
  const [pickerOpen, setPickerOpen] = React.useState(false);

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
        "pill-surface composer-glow relative flex h-[132px] w-full flex-col rounded-lg p-3 transition-shadow",
        className
      )}
    >
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-full flex-1 resize-none"
      />
      <div className="mt-2 flex items-center justify-between">
        {/* Provider · Model picker chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="font-medium text-foreground/85">
              {providerLabel(cfg.provider)}
            </span>
            <span className="opacity-40">·</span>
            <span className="font-mono text-[11.5px] opacity-70">
              {cfg.model}
            </span>
            <svg
              viewBox="0 0 12 12"
              className={cn(
                "ml-0.5 h-3 w-3 transition-transform",
                pickerOpen && "rotate-180"
              )}
              aria-hidden
            >
              <path
                d="M3 4.5 L6 7.5 L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          {pickerOpen && (
            <ModelPicker onClose={() => setPickerOpen(false)} />
          )}
        </div>

        <button
          type="button"
          disabled={!canSend}
          onClick={onSubmit}
          aria-label="Send"
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all",
            canSend
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-secondary text-muted-foreground"
          )}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

function ModelPicker({ onClose }: { onClose: () => void }) {
  const cfg = useLLMConfig();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const meta = PROVIDERS[cfg.provider];

  return (
    <div
      ref={ref}
      className="pill-surface absolute bottom-full left-0 z-30 mb-2 w-[320px] space-y-3 rounded-2xl p-3 shadow-lg"
    >
      <div>
        <Label>Provider</Label>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {Object.values(PROVIDERS).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => cfg.setProvider(p.id)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11.5px] font-medium transition-colors",
                cfg.provider === p.id
                  ? "border-foreground/20 bg-secondary text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Model</Label>
        <input
          value={cfg.model}
          onChange={(e) => cfg.setModel(e.target.value)}
          placeholder={meta.defaultModel}
          spellCheck={false}
          autoComplete="off"
          className="mt-1.5 h-8 w-full rounded-md border border-border bg-card px-2 font-mono text-[11.5px] text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:outline-none"
        />
        <div className="mt-1.5 flex flex-wrap gap-1">
          {meta.exampleModels.slice(0, 4).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => cfg.setModel(m)}
              className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  );
}
