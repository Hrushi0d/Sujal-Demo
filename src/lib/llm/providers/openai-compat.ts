import OpenAI from "openai";
import type { Stream } from "openai/streaming";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";
import type { ProviderImpl, LLMConfig, StreamGenerateArgs } from "../types";

const BASE_URLS = {
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
} as const;

function baseUrlFor(provider: LLMConfig["provider"]): string {
  if (provider === "groq") return BASE_URLS.groq;
  if (provider === "openrouter") return BASE_URLS.openrouter;
  throw new Error(`openai-compat does not handle provider ${provider}`);
}

function defaultHeaders(
  provider: LLMConfig["provider"]
): Record<string, string> {
  if (provider === "openrouter") {
    return {
      // Helps OpenRouter route + appear correctly in dashboards.
      "HTTP-Referer":
        typeof window !== "undefined" ? window.location.origin : "",
      "X-Title": "OpenUI Demo",
    };
  }
  return {};
}

async function streamGenerate(
  config: LLMConfig,
  args: StreamGenerateArgs
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: baseUrlFor(config.provider),
    dangerouslyAllowBrowser: true,
    defaultHeaders: defaultHeaders(config.provider),
    // Don't retry from the browser. Retries on streaming errors just amplify
    // rate-limit pressure and lead to 429 cascades.
    maxRetries: 0,
  });

  // gpt-oss is a reasoning model on Groq — request hidden reasoning so the
  // OpenUI Lang stream isn't polluted. These options are silently ignored by
  // models that don't support them.
  const isGptOss = /gpt-oss/i.test(config.model);

  const stream = (await client.chat.completions.create(
    {
      model: config.model,
      stream: true,
      temperature: 0.4,
      messages: [
        { role: "system", content: args.systemPrompt },
        ...args.history,
        { role: "user", content: args.userPrompt },
      ],
      ...(isGptOss
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ({ reasoning_effort: "low", reasoning_format: "hidden" } as any)
        : {}),
    },
    { signal: args.signal }
  )) as unknown as Stream<ChatCompletionChunk>;

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content ?? "";
    if (delta) {
      full += delta;
      args.onDelta(delta);
    }
  }
  return full;
}

export function makeOpenAICompatProvider(
  id: "groq" | "openrouter"
): ProviderImpl {
  return {
    meta: {
      id,
      label: id === "groq" ? "Groq" : "OpenRouter",
      defaultModel:
        id === "groq" ? "openai/gpt-oss-120b" : "openai/gpt-4o-mini",
      consoleUrl:
        id === "groq"
          ? "https://console.groq.com/keys"
          : "https://openrouter.ai/keys",
      exampleModels: [],
    },
    streamGenerate,
  };
}
