export const GENERATION_PROMPT = `We are in the Generation phase. Generate the full three-call script package based on the confirmed value offer and channel strategy.

You MUST output the script in TWO parts:

1. First, write a brief natural-language summary of the script package (2-3 sentences). Something like: "Here's your complete three-call script package for [vertical]. Based on their [database size / core problem], I've recommended [channel strategy]. The value offer on Call 1 is [offer type]."

2. Then, on a new line, output the structured JSON inside a \`\`\`json code block. This JSON will be parsed and displayed in the script preview panel — the user will NOT see the raw JSON in the chat.

The JSON must match this exact schema:

{
  "vertical": "<vertical name>",
  "channel_strategy": {
    "primary_channel": "<outbound_telemarketing | ai_automation | combined>",
    "recommendation": "<1-2 sentence explanation of why this channel>",
    "database_size": "<none | small | medium | large>",
    "core_problem": "<new_customers | missing_calls | both>"
  },
  "value_offer": {
    "type": "<offer category>",
    "description": "<what the offer is>",
    "delivery_method": "<how to deliver it>",
    "why_it_works": "<pain point it addresses>"
  },
  "call_1": {
    "label": "The Value Call",
    "opener": "<pattern-interrupt opener>",
    "body": "<value delivery>",
    "close": "<warm close with no ask>",
    "tonality_notes": "<how to deliver this>",
    "duration_target": "60-90 seconds",
    "objection_handles": [
      {"objection": "<likely objection>", "response": "<response>"}
    ]
  },
  "call_2": {
    "label": "The Follow-Up",
    "opener": "<reference value delivered>",
    "body": "<check impact + second value + explore>",
    "close": "<plant the seed>",
    "tonality_notes": "<how to deliver this>",
    "duration_target": "2-3 minutes",
    "objection_handles": []
  },
  "call_3": {
    "label": "The Ask",
    "opener": "<recap relationship>",
    "body": "<tailored proposal matching the channel strategy>",
    "close": "<specific direct ask aligned with recommended channel>",
    "tonality_notes": "<how to deliver this>",
    "duration_target": "3-5 minutes",
    "objection_handles": [
      {"objection": "<likely objection>", "response": "<response>"}
    ]
  },
  "timing": {
    "call_1_to_2": "3-5 business days",
    "call_2_to_3": "5-7 business days"
  },
  "between_call_touchpoints": [
    "<touchpoint 1>",
    "<touchpoint 2>"
  ]
}

IMPORTANT:
- Keep the natural-language summary short. Do NOT repeat the full script content in prose.
- The channel_strategy field must reflect what was determined in discovery.
- The Call 3 ask must align with the recommended channel strategy. If outbound: ask for an appointment or campaign. If AI automation: offer a demo of the AI answering service. If combined: offer both.
- The user will see the formatted script in the preview panel, not the raw JSON.

After generating, ask the user if they want any tweaks. Iterate until satisfied, then indicate the Export phase.`;