import { useEffect, useMemo, useState } from "react";
import { ExternalLink, KeyRound, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PROVIDERS,
  defaultModelFor,
  readStored,
  writeStored,
  type ProviderId,
} from "@/lib/llm";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onSaved,
}: SettingsDialogProps) {
  const stored = useMemo(() => readStored(), [open]);
  const initialProvider: ProviderId =
    stored.provider ?? (import.meta.env.VITE_LLM_PROVIDER as ProviderId) ?? "groq";

  const [provider, setProviderState] = useState<ProviderId>(initialProvider);
  const [model, setModel] = useState<string>(
    stored.model ?? envModelFor(initialProvider) ?? defaultModelFor(initialProvider)
  );
  const [apiKey, setApiKey] = useState<string>(
    stored.keys?.[initialProvider] ?? envKeyFor(initialProvider) ?? ""
  );

  // When provider changes, switch the model + key fields to the saved/env
  // values for that provider.
  useEffect(() => {
    if (!open) return;
    const fresh = readStored();
    setModel(
      fresh.model && fresh.provider === provider
        ? fresh.model
        : envModelFor(provider) ?? defaultModelFor(provider)
    );
    setApiKey(fresh.keys?.[provider] ?? envKeyFor(provider) ?? "");
  }, [provider, open]);

  const meta = PROVIDERS[provider];

  const handleSave = () => {
    const next = readStored();
    writeStored({
      provider,
      model: model.trim() || defaultModelFor(provider),
      keys: {
        ...(next.keys ?? {}),
        [provider]: apiKey.trim(),
      },
    });
    onSaved?.();
    onOpenChange(false);
  };

  const handleClear = () => {
    writeStored({});
    setProviderState(initialProvider);
    setModel(defaultModelFor(initialProvider));
    setApiKey("");
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            LLM Settings
          </DialogTitle>
          <DialogDescription>
            Pick a provider, paste a key. Saved in this browser only — runtime
            settings override <code className="font-mono">.env.local</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Provider</Label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {(Object.values(PROVIDERS)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProviderState(p.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-colors",
                    provider === p.id
                      ? "border-white/15 bg-white/[0.05] text-foreground"
                      : "border-white/[0.06] bg-white/[0.015] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>API Key</Label>
              <a
                href={meta.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Get a key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 focus-within:border-white/15">
              <KeyRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${meta.label} API key`}
                className="h-9 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div>
            <Label>Model</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={defaultModelFor(provider)}
              className="mt-1.5"
              spellCheck={false}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.exampleModels.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={cn(
                    "rounded-md border border-white/[0.06] bg-white/[0.015] px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground",
                    model === m && "border-white/20 bg-white/[0.05] text-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-[12px] text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear stored settings
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!apiKey.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </label>
  );
}

function envModelFor(provider: ProviderId): string | undefined {
  const envProvider = import.meta.env.VITE_LLM_PROVIDER;
  return envProvider === provider ? import.meta.env.VITE_LLM_MODEL : undefined;
}

function envKeyFor(provider: ProviderId): string | undefined {
  switch (provider) {
    case "groq":
      return import.meta.env.VITE_GROQ_API_KEY;
    case "openrouter":
      return import.meta.env.VITE_OPENROUTER_API_KEY;
    case "gemini":
      return import.meta.env.VITE_GEMINI_API_KEY;
  }
}
