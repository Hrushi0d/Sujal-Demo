import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types";
import { streamGenerate, humanizeError } from "@/lib/llm";
import { getSystemPrompt, extractOpenUI } from "@/lib/openui";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runGeneration = useCallback(
    async (
      userPrompt: string,
      historyForLLM: Array<{ role: "user" | "assistant"; content: string }>
    ) => {
      const assistantId = uid();
      const placeholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, placeholder]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const full = await streamGenerate({
          systemPrompt: getSystemPrompt(),
          history: historyForLLM,
          userPrompt,
          signal: ctrl.signal,
          onDelta: (delta) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + delta }
                  : m
              )
            );
          },
        });

        const ui = extractOpenUI(full);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: full, generatedUI: ui, isStreaming: false }
              : m
          )
        );
        return assistantId;
      } catch (err) {
        const msg = humanizeError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, errorText: msg }
              : m
          )
        );
        return null;
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    []
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
      };

      const history = messages.map((m) => ({
        role: m.role,
        content: m.role === "assistant" ? m.generatedUI ?? m.content : m.content,
      }));

      setMessages((prev) => [...prev, userMsg]);
      await runGeneration(trimmed, history);
    },
    [messages, isStreaming, runGeneration]
  );

  const regenerate = useCallback(
    async (assistantId: string) => {
      if (isStreaming) return;
      const idx = messages.findIndex((m) => m.id === assistantId);
      if (idx < 1) return;
      let userIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userIdx = i;
          break;
        }
      }
      if (userIdx < 0) return;
      const userPrompt = messages[userIdx].content;
      const truncated = messages.slice(0, idx);
      const history = messages.slice(0, userIdx).map((m) => ({
        role: m.role,
        content: m.role === "assistant" ? m.generatedUI ?? m.content : m.content,
      }));
      setMessages(truncated);
      await runGeneration(userPrompt, history);
    },
    [messages, isStreaming, runGeneration]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, regenerate, cancel, reset };
}
