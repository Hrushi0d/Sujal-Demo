import { useMemo, useState } from "react";
import { Plus, Settings as SettingsIcon } from "lucide-react";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { ChatComposer } from "@/components/ChatComposer";
import { SuggestionCards } from "@/components/SuggestionCards";
import { ChatMessages } from "@/components/ChatMessages";
import { GeneratedUIPreview } from "@/components/GeneratedUIPreview";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useChat } from "@/hooks/useChat";
import { currentConfig, providerLabel } from "@/lib/llm";

export default function App() {
  const [draft, setDraft] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);
  const { messages, isStreaming, send, regenerate, reset } = useChat();

  const empty = messages.length === 0;
  // Recompute when settings save bumps the version.
  const config = useMemo(() => currentConfig(), [configVersion]);
  const hasConfig = Boolean(config);

  const previewMsg = useMemo(
    () => messages.find((m) => m.id === previewId) ?? null,
    [messages, previewId]
  );
  const userPromptForPreview = useMemo(() => {
    if (!previewMsg) return undefined;
    const idx = messages.findIndex((m) => m.id === previewMsg.id);
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return undefined;
  }, [messages, previewMsg]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;
    if (!hasConfig) {
      setSettingsOpen(true);
      return;
    }
    setDraft("");
    void send(text);
  };

  const handlePick = (prompt: string) => {
    if (!hasConfig) {
      setDraft(prompt);
      setSettingsOpen(true);
      return;
    }
    setDraft("");
    void send(prompt);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {!hasConfig && (
        <div className="flex items-center justify-center gap-2 border-b border-white/[0.06] bg-amber-500/[0.05] px-4 py-2 text-center text-[12px] text-amber-200/80">
          <span>No LLM configured.</span>
          <button
            onClick={() => setSettingsOpen(true)}
            className="font-medium text-amber-100 underline-offset-2 hover:underline"
          >
            Open Settings
          </button>
          <span className="opacity-60">— or set keys in .env.local</span>
        </div>
      )}

      {!empty && (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.05] bg-[#0a0a0a]/80 px-5 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[12px] tracking-tight text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-foreground/90">OpenUI</span>
            {config && (
              <>
                <span className="opacity-60">·</span>
                <span className="text-foreground/70">
                  {providerLabel(config.provider)}
                </span>
                <span className="opacity-60">·</span>
                <span className="font-mono text-[11px] opacity-70">
                  {config.model}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.015] px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
              title="LLM settings"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.015] px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </header>
      )}

      {empty ? (
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="flex w-full max-w-[760px] flex-col items-center gap-7">
            <WelcomeHeader />
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
              autoFocus
              className="max-w-[640px]"
            />
            <SuggestionCards onPick={handlePick} />
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/70">
              {config ? (
                <>
                  <span>
                    Powered by{" "}
                    <span className="text-muted-foreground">
                      {providerLabel(config.provider)}
                    </span>{" "}
                    ·{" "}
                    <span className="font-mono">{config.model}</span>
                  </span>
                  <span className="opacity-50">·</span>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <SettingsIcon className="h-3 w-3" />
                    Change
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.015] px-2 py-1 text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
                >
                  <SettingsIcon className="h-3 w-3" />
                  Configure LLM
                </button>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[820px] flex-1 flex-col px-4 pb-36 pt-8">
          <ChatMessages
            messages={messages}
            onExpand={setPreviewId}
            onRegenerate={regenerate}
          />
        </main>
      )}

      {!empty && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent px-4 pb-6 pt-14">
          <div className="pointer-events-auto w-full max-w-[680px]">
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      )}

      <GeneratedUIPreview
        open={previewId !== null}
        onOpenChange={(o) => !o && setPreviewId(null)}
        source={previewMsg?.generatedUI ?? null}
        isStreaming={previewMsg?.isStreaming}
        prompt={userPromptForPreview}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={() => setConfigVersion((v) => v + 1)}
      />
    </div>
  );
}
