import * as React from "react";
import type { ChatMessage } from "@/types";
import { ResultCard } from "@/components/ResultCard";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onExpand: (id: string) => void;
  onRegenerate: (id: string) => void;
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:-200ms]" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:-100ms]" />
      <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
    </span>
  );
}

export function ChatMessages({
  messages,
  onExpand,
  onRegenerate,
}: ChatMessagesProps) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex w-full flex-col gap-6">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex flex-col gap-2 animate-fade-in",
            m.role === "user" ? "items-end" : "items-stretch"
          )}
        >
          {m.role === "user" ? (
            <div className="surface max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-snug text-foreground">
              {m.content}
            </div>
          ) : m.errorText ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3">
              <p className="text-[13px] text-red-300">{m.errorText}</p>
              <button
                onClick={() => onRegenerate(m.id)}
                className="mt-2 text-[12px] text-red-200/80 underline-offset-2 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : m.isStreaming && !m.content ? (
            <div className="surface flex items-center gap-2 self-start rounded-xl px-4 py-3 text-muted-foreground">
              <span className="text-[13px]">Composing components</span>
              <StreamingDots />
            </div>
          ) : (
            <ResultCard
              source={m.generatedUI ?? m.content}
              isStreaming={m.isStreaming}
              onExpand={() => onExpand(m.id)}
              onRegenerate={() => onRegenerate(m.id)}
            />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
