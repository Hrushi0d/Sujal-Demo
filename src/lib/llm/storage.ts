import type { LLMConfig, ProviderId } from "./types";

const KEY = "openui-demo:llm-config";

export interface StoredConfig {
  provider?: ProviderId;
  model?: string;
  /**
   * Map of providerId -> apiKey, so users can paste keys for multiple
   * providers and switch between them without re-pasting.
   */
  keys?: Partial<Record<ProviderId, string>>;
}

export function readStored(): StoredConfig {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function writeStored(next: StoredConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy mode
  }
}

export function setProvider(provider: ProviderId) {
  const cur = readStored();
  writeStored({ ...cur, provider });
}

export function setModel(model: string) {
  const cur = readStored();
  writeStored({ ...cur, model });
}

export function setKey(provider: ProviderId, apiKey: string) {
  const cur = readStored();
  writeStored({
    ...cur,
    keys: { ...(cur.keys ?? {}), [provider]: apiKey },
  });
}

export function clearStored() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** Resolve runtime config from env + localStorage, with localStorage winning. */
export function resolveLLMConfig(): LLMConfig | null {
  const env = {
    provider: (import.meta.env.VITE_LLM_PROVIDER as ProviderId | undefined),
    model: import.meta.env.VITE_LLM_MODEL,
    keys: {
      groq: import.meta.env.VITE_GROQ_API_KEY,
      openrouter: import.meta.env.VITE_OPENROUTER_API_KEY,
      gemini: import.meta.env.VITE_GEMINI_API_KEY,
    } as Partial<Record<ProviderId, string>>,
  };

  const stored = readStored();

  // Pick provider: stored > env > infer from whichever key is present > "groq".
  const provider: ProviderId =
    stored.provider ??
    env.provider ??
    (env.keys.groq
      ? "groq"
      : env.keys.openrouter
      ? "openrouter"
      : env.keys.gemini
      ? "gemini"
      : "groq");

  const apiKey = stored.keys?.[provider] ?? env.keys[provider] ?? "";

  // Model: stored.model is global; if user changes provider, fall back to env
  // model (only valid for the matching provider) or the provider default.
  const envModelMatchesProvider = env.provider === provider;
  const model =
    stored.model ??
    (envModelMatchesProvider ? env.model : undefined) ??
    defaultModelFor(provider);

  if (!apiKey) return null;
  return { provider, model, apiKey };
}

export function defaultModelFor(provider: ProviderId): string {
  // Local copy to avoid pulling PROVIDERS in here and creating a cycle.
  switch (provider) {
    case "groq":
      return "openai/gpt-oss-120b";
    case "openrouter":
      return "openai/gpt-4o-mini";
    case "gemini":
      return "gemini-2.5-flash";
  }
}

/** Has the user supplied a key for the given (or current) provider? */
export function hasKeyFor(provider?: ProviderId): boolean {
  const stored = readStored();
  const env = {
    groq: import.meta.env.VITE_GROQ_API_KEY,
    openrouter: import.meta.env.VITE_OPENROUTER_API_KEY,
    gemini: import.meta.env.VITE_GEMINI_API_KEY,
  } as Partial<Record<ProviderId, string>>;
  if (provider) {
    return Boolean(stored.keys?.[provider] || env[provider]);
  }
  const cur = resolveLLMConfig();
  return Boolean(cur);
}
