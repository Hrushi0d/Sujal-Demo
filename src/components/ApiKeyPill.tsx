import * as React from "react";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { useLLMConfig, PROVIDERS } from "@/lib/llm";
import { cn } from "@/lib/utils";

interface ApiKeyPillProps {
  className?: string;
}

export function ApiKeyPill({ className }: ApiKeyPillProps) {
  const cfg = useLLMConfig();
  const [show, setShow] = React.useState(false);
  const meta = PROVIDERS[cfg.provider];
  const value = cfg.keys[cfg.provider] ?? "";
  const has = value.trim().length > 0;

  return (
    <div
      className={cn(
        "pill-surface flex items-center gap-2 rounded-full px-4 py-2",
        className
      )}
    >
      <span className="select-none text-[12.5px] text-muted-foreground">
        Enter API key
      </span>
      <span className="text-muted-foreground/70">—</span>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => cfg.setKey(cfg.provider, e.target.value)}
        placeholder={`paste your ${meta.label} key`}
        spellCheck={false}
        autoComplete="off"
        className="h-6 min-w-0 flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        title={show ? "Hide" : "Show"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <a
        href={meta.consoleUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        title={`Get a ${meta.label} key`}
        tabIndex={-1}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {has && (
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
    </div>
  );
}
