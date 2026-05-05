import { PROVIDERS, type ProviderId, type StreamGenerateArgs } from "./types";
import { makeOpenAICompatProvider } from "./providers/openai-compat";
import { geminiProvider } from "./providers/gemini";
import { resolveLLMConfig } from "./storage";

export {
  PROVIDERS,
  type ProviderId,
  type LLMConfig,
  type ChatTurn,
} from "./types";
export {
  readStored,
  writeStored,
  setProvider,
  setModel,
  setKey,
  clearStored,
  resolveLLMConfig,
  defaultModelFor,
  hasKeyFor,
} from "./storage";

const IMPLS = {
  groq: makeOpenAICompatProvider("groq"),
  openrouter: makeOpenAICompatProvider("openrouter"),
  gemini: geminiProvider,
};

export async function streamGenerate(args: StreamGenerateArgs): Promise<string> {
  const cfg = resolveLLMConfig();
  if (!cfg) {
    const list = Object.values(PROVIDERS)
      .map((p) => `${p.label} (${p.consoleUrl})`)
      .join(", ");
    throw new Error(
      `No LLM configured. Open Settings, choose a provider and paste an API key. Supported: ${list}.`
    );
  }
  return IMPLS[cfg.provider].streamGenerate(cfg, args);
}

export function currentConfig() {
  return resolveLLMConfig();
}

export function providerLabel(id: ProviderId): string {
  return PROVIDERS[id].label;
}

/**
 * Convert provider errors into chat-friendly messages. Adds context about
 * which provider failed and suggests the most useful next action.
 */
export function humanizeError(err: unknown): string {
  const cfg = resolveLLMConfig();
  const label = cfg ? providerLabel(cfg.provider) : "LLM";
  const raw = err instanceof Error ? err.message : String(err);

  // OpenAI SDK exposes status on APIError instances.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const status: number | undefined = (err as any)?.status ?? (err as any)?.statusCode;

  if (status === 429) {
    if (cfg?.provider === "openrouter") {
      return `${label} rate-limited the request (429). Free models cap at ~20 req/min and ~50/day. Try a different model in Settings, switch to Groq/Gemini, or add credits to OpenRouter.`;
    }
    return `${label} rate-limited the request (429). Wait a minute, switch model in Settings, or try a different provider.`;
  }
  if (status === 401 || status === 403) {
    return `${label} rejected the API key (${status}). Open Settings and re-paste a valid key.`;
  }
  if (status === 402) {
    return `${label} reports insufficient credits (402). Add credits or switch provider in Settings.`;
  }
  if (status === 404) {
    return `${label} couldn't find that model. Open Settings and pick a different one.`;
  }
  if (status && status >= 500) {
    return `${label} returned ${status}. Their service may be degraded — try again or switch provider.`;
  }

  // Common Firefox/Chrome stream-died strings that arise from idle proxies.
  if (
    /NS_BASE_STREAM_CLOSED|network error|Failed to fetch|fetch failed|stream closed/i.test(
      raw
    )
  ) {
    return `Connection to ${label} dropped mid-stream. Try again, pick a different model, or switch provider.`;
  }

  if (/abort/i.test(raw)) {
    return "Cancelled.";
  }

  // Strip a noisy SDK preface like "Error: 429 ..." to keep the bubble tidy.
  return raw.replace(/^Error:\s*/, "");
}
