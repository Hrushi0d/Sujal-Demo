import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PROVIDERS, type LLMConfig, type ProviderId } from "./types";

interface LLMConfigState {
  provider: ProviderId;
  model: string;
  /** Map of providerId -> in-session API key. Never persisted. */
  keys: Partial<Record<ProviderId, string>>;
}

interface LLMConfigContextValue extends LLMConfigState {
  setProvider: (p: ProviderId) => void;
  setModel: (m: string) => void;
  setKey: (p: ProviderId, k: string) => void;
  /** Resolved config for the active provider, or null if no key. */
  config: LLMConfig | null;
}

const Ctx = createContext<LLMConfigContextValue | null>(null);

function defaultModelFor(provider: ProviderId): string {
  return PROVIDERS[provider].defaultModel;
}

export function LLMConfigProvider({ children }: { children: ReactNode }) {
  // Start blank. No env, no localStorage. User picks provider + pastes key.
  const [state, setState] = useState<LLMConfigState>(() => ({
    provider: "groq",
    model: defaultModelFor("groq"),
    keys: {},
  }));

  const setProvider = useCallback((p: ProviderId) => {
    setState((prev) => ({
      ...prev,
      provider: p,
      // Reset model to provider default whenever provider changes — avoids
      // sending an OpenAI model id to Gemini, etc.
      model: defaultModelFor(p),
    }));
  }, []);

  const setModel = useCallback((m: string) => {
    setState((prev) => ({ ...prev, model: m }));
  }, []);

  const setKey = useCallback((p: ProviderId, k: string) => {
    setState((prev) => ({ ...prev, keys: { ...prev.keys, [p]: k } }));
  }, []);

  const value = useMemo<LLMConfigContextValue>(() => {
    const apiKey = state.keys[state.provider]?.trim() ?? "";
    const config: LLMConfig | null = apiKey
      ? {
          provider: state.provider,
          model: state.model.trim() || defaultModelFor(state.provider),
          apiKey,
        }
      : null;
    return {
      ...state,
      setProvider,
      setModel,
      setKey,
      config,
    };
  }, [state, setProvider, setModel, setKey]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLLMConfig(): LLMConfigContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLLMConfig must be used within <LLMConfigProvider>");
  return v;
}
