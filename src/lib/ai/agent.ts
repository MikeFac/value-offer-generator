import { SYSTEM_PROMPT } from "./prompts";
import {
  DISCOVERY_PROMPT,
  DESIGN_PROMPT,
  GENERATION_PROMPT,
} from "./prompts";

const PHASE_PROMPTS: Record<string, string> = {
  discovery: DISCOVERY_PROMPT,
  design: DESIGN_PROMPT,
  generation: GENERATION_PROMPT,
};

export function buildSystemPrompt(phase: string): string {
  const phasePrompt = PHASE_PROMPTS[phase] ?? DISCOVERY_PROMPT;
  return `${SYSTEM_PROMPT}\n\n${phasePrompt}`;
}

export function detectPhaseFromContent(content: string): string | null {
  const lower = content.toLowerCase();
  if (lower.includes("phase 3") || lower.includes("generation phase") || lower.includes("```json") || lower.includes('"call_1"')) {
    return "generation";
  }
  if (lower.includes("phase 2") || lower.includes("design phase") || lower.includes("value offer") || lower.includes("here are") && lower.includes("options")) {
    return "design";
  }
  if (lower.includes("phase 4") || lower.includes("export") || lower.includes("final package") || lower.includes("here is your complete script package")) {
    return "export";
  }
  return null;
}

export function advancePhase(currentPhase: string, aiContent: string): string {
  const detected = detectPhaseFromContent(aiContent);
  if (detected && detected !== currentPhase) return detected;

  const transitions: Record<string, string> = {
    discovering: "designing",
    designing: "generated",
    generated: "complete",
  };
  return transitions[currentPhase] ?? currentPhase;
}