import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { ChatComposer } from "@/components/ChatComposer";
import { SuggestionCards } from "@/components/SuggestionCards";
import { ChatMessages } from "@/components/ChatMessages";
import { GeneratedUIPreview } from "@/components/GeneratedUIPreview";
import { ApiKeyPill } from "@/components/ApiKeyPill";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChat } from "@/hooks/useChat";
import { useLLMConfig, providerLabel } from "@/lib/llm";

export default function App() {
  const [draft, setDraft] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const { messages, isStreaming, send, regenerate, reset } = useChat();
  const { config } = useLLMConfig();

  const empty = messages.length === 0;
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
    setDraft("");
    void send(text);
  };

  const handlePick = (prompt: string) => {
    if (!hasConfig) {
      setDraft(prompt);
      return;
    }
    setDraft("");
    void send(prompt);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Top toolbar — theme + new on right */}
      <div className="flex items-center justify-end px-5 py-4">
        <div className="flex items-center gap-2">
          {!empty && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Active provider/model chip on chat view (sub-header) */}
      {!empty && (
        <div className="border-b border-border/60 bg-background/80 px-5 py-2 text-center text-[11.5px] tracking-tight text-muted-foreground backdrop-blur-md">
          <span className="font-medium text-foreground/85">OpenUI</span>
          {config && (
            <>
              <span className="opacity-40"> · </span>
              <span>{providerLabel(config.provider)}</span>
              <span className="opacity-40"> · </span>
              <span className="font-mono text-[11px] opacity-80">
                {config.model}
              </span>
            </>
          )}
        </div>
      )}

      {empty ? (
        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-32">
          <div className="flex w-full max-w-[760px] flex-col items-center">
            <WelcomeHeader />
            <div className="mt-6 flex w-full max-w-[680px] flex-col gap-2">
              <ChatComposer
                value={draft}
                onChange={setDraft}
                onSubmit={handleSubmit}
                isStreaming={isStreaming}
                autoFocus
                className="w-full"
              />
              <SuggestionCards onPick={handlePick} />
            </div>
          </div>
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[820px] flex-1 flex-col px-4 pb-44 pt-8">
          <ChatMessages
            messages={messages}
            onExpand={setPreviewId}
            onRegenerate={regenerate}
          />
        </main>
      )}

      {/* Bottom-pinned API key pill (always visible) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 bg-gradient-to-t from-background via-background/85 to-transparent px-4 pb-5 pt-10">
        {!empty && (
          <div className="pointer-events-auto w-full max-w-[680px]">
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              isStreaming={isStreaming}
            />
          </div>
        )}
        <ApiKeyPill className="pointer-events-auto w-full max-w-[680px]" />
      </div>

      <GeneratedUIPreview
        open={previewId !== null}
        onOpenChange={(o) => !o && setPreviewId(null)}
        source={previewMsg?.generatedUI ?? null}
        isStreaming={previewMsg?.isStreaming}
        prompt={userPromptForPreview}
      />
    </div>
  );
}
