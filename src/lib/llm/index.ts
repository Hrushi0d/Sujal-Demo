import {
  PROVIDERS,
  type ProviderId,
  type LLMConfig,
  type StreamGenerateArgs,
} from "./types";
import { makeOpenAICompatProvider } from "./providers/openai-compat";
import { geminiProvider } from "./providers/gemini";

export {
  PROVIDERS,
  type ProviderId,
  type LLMConfig,
  type ChatTurn,
} from "./types";
export { LLMConfigProvider, useLLMConfig } from "./context";

const IMPLS = {
  groq: makeOpenAICompatProvider("groq"),
  openrouter: makeOpenAICompatProvider("openrouter"),
  gemini: geminiProvider,
};

export async function streamGenerate(
  config: LLMConfig,
  args: StreamGenerateArgs
): Promise<string> {
  return IMPLS[config.provider].streamGenerate(config, args);
}

export function providerLabel(id: ProviderId): string {
  return PROVIDERS[id].label;
}

export function defaultModelFor(provider: ProviderId): string {
  return PROVIDERS[provider].defaultModel;
}

/**
 * Convert provider errors into chat-friendly messages.
 */
export function humanizeError(err: unknown, providerId?: ProviderId): string {
  const label = providerId ? providerLabel(providerId) : "LLM";
  const raw = err instanceof Error ? err.message : String(err);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const status: number | undefined = (err as any)?.status ?? (err as any)?.statusCode;

  if (status === 429) {
    if (providerId === "openrouter") {
      return `${label} rate-limited the request (429). Free models cap at ~20 req/min and ~50/day. Try a different model, switch provider, or add credits to OpenRouter.`;
    }
    return `${label} rate-limited the request (429). Wait a minute, switch model, or try a different provider.`;
  }
  if (status === 401 || status === 403) {
    return `${label} rejected the API key (${status}). Check the key in the bar above the composer.`;
  }
  if (status === 402) {
    return `${label} reports insufficient credits (402). Add credits or switch provider.`;
  }
  if (status === 404) {
    return `${label} couldn't find that model. Pick a different one in the model field.`;
  }
  if (status && status >= 500) {
    return `${label} returned ${status}. Their service may be degraded — try again or switch provider.`;
  }
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
  return raw.replace(/^Error:\s*/, "");
}
