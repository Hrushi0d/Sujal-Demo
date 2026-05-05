import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderImpl, LLMConfig, StreamGenerateArgs } from "../types";

async function streamGenerate(
  config: LLMConfig,
  args: StreamGenerateArgs
): Promise<string> {
  const client = new GoogleGenerativeAI(config.apiKey);
  const model = client.getGenerativeModel({
    model: config.model,
    systemInstruction: args.systemPrompt,
  });

  // Gemini uses { role: "user" | "model", parts: [{ text }] }.
  const history = args.history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: 0.4,
    },
  });

  const result = await chat.sendMessageStream(args.userPrompt);

  let full = "";
  for await (const chunk of result.stream) {
    if (args.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const text = chunk.text();
    if (text) {
      full += text;
      args.onDelta(text);
    }
  }
  return full;
}

export const geminiProvider: ProviderImpl = {
  meta: {
    id: "gemini",
    label: "Gemini",
    defaultModel: "gemini-2.5-flash",
    consoleUrl: "https://aistudio.google.com/apikey",
    exampleModels: [],
  },
  streamGenerate,
};
