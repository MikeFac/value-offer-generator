export const MODEL_LABELS: Record<string, string> = {
  "openai/gpt-4o-mini": "GPT-4o Mini",
  "openai/gpt-4o": "GPT-4o",
  "anthropic/claude-sonnet-4": "Claude Sonnet 4",
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "deepseek/deepseek-chat-v3-0324": "DeepSeek V3",
};

export const ALLOWED_MODELS = [
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "anthropic/claude-sonnet-4",
  "google/gemini-2.5-flash",
  "deepseek/deepseek-chat-v3-0324",
] as const;