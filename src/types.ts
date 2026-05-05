export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  generatedUI?: string;
  isStreaming?: boolean;
  errorText?: string;
}
