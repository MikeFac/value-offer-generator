import { prisma } from "./db/prisma";
import { TIERS } from "./tiers";
import type { Tier } from "./tiers";
import OpenAI from "openai";

export function isOpenAIModel(model: string): boolean {
  return model.startsWith("openai/");
}

export function getOpenAIClient(): OpenAI {
  return new OpenAI({ timeout: 120_000 });
}

export function getOpenRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://offerfu.com",
      "X-Title": "OfferFu",
    },
  });
}

export function getClientForModel(model: string): OpenAI {
  return isOpenAIModel(model) ? getOpenAIClient() : getOpenRouterClient();
}

export function getModelIdForProvider(model: string): string {
  if (isOpenAIModel(model)) {
    return model.replace("openai/", "");
  }
  return model;
}

export async function getEffectiveModel(tier: Tier): Promise<string> {
  const settings = await prisma.appSettings.findUnique({ where: { id: "default" } });
  const adminModel = settings?.model;

  if (!adminModel) return TIERS[tier]?.model ?? "openai/gpt-4o-mini";

  if (tier === "anonymous" || tier === "free") return TIERS[tier]?.model ?? "openai/gpt-4o-mini";

  return adminModel;
}