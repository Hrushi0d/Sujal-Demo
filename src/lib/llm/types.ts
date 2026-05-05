export type ProviderId = "groq" | "openrouter" | "gemini";

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  /** Fallback model when no model is configured. */
  defaultModel: string;
  /** Where the user gets a key. */
  consoleUrl: string;
  /** A short list of suggested models for the picker (informational only). */
  exampleModels: string[];
}

export interface LLMConfig {
  provider: ProviderId;
  model: string;
  apiKey: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamGenerateArgs {
  systemPrompt: string;
  history: ChatTurn[];
  userPrompt: string;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
}

export interface ProviderImpl {
  meta: ProviderMeta;
  streamGenerate(
    config: LLMConfig,
    args: StreamGenerateArgs
  ): Promise<string>;
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  groq: {
    id: "groq",
    label: "Groq",
    defaultModel: "openai/gpt-oss-120b",
    consoleUrl: "https://console.groq.com/keys",
    exampleModels: [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "llama-3.3-70b-versatile",
      "qwen/qwen3-32b",
    ],
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    defaultModel: "openai/gpt-4o-mini",
    consoleUrl: "https://openrouter.ai/keys",
    exampleModels: [
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-2.0-flash-001",
      "deepseek/deepseek-chat",
      "meta-llama/llama-3.3-70b-instruct",
    ],
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    defaultModel: "gemini-2.5-flash",
    consoleUrl: "https://aistudio.google.com/apikey",
    exampleModels: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
    ],
  },
};
