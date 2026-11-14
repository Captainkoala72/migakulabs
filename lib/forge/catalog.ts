/**
 * Client-safe model catalogue for Prompt Forge.
 *
 * This file holds only what the UI needs: labels, effort levels and
 * capabilities. API keys, base URLs and request bodies live server-side in
 * lib/server/providers.ts. To add a model, append it here and make sure its
 * provider has an adapter there.
 */

export type ProviderId = "openai" | "anthropic" | "deepseek" | "zai" | "xiaomi";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "zai", label: "Z.ai" },
  { id: "xiaomi", label: "Xiaomi" },
];

export interface EffortOption {
  id: string;
  label: string;
}

/**
 * How web search works for a model:
 *  - "native": the provider's own hosted search tool.
 *  - "zai":    a web_search function the model calls, answered by Z.ai's
 *              search API (needs ZAI_API_KEY as well as the model's own key).
 */
export type SearchMode = "native" | "zai";

export interface ForgeModel {
  /** Unique key, also the default wire id sent to the provider. */
  key: string;
  label: string;
  provider: ProviderId;
  efforts: EffortOption[];
  defaultEffort: string;
  /** Accepts reference images. */
  vision: boolean;
  search: SearchMode;
  /** Short note shown under the model picker. */
  note: string;
}

const LOW_HIGH_MAX: EffortOption[] = [
  { id: "low", label: "Low" },
  { id: "high", label: "High" },
  { id: "max", label: "Max" },
];

export const MODELS: ForgeModel[] = [
  {
    key: "gpt-6.1-sol",
    label: "GPT-6.1 Sol",
    provider: "openai",
    efforts: [
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
    ],
    defaultEffort: "medium",
    vision: true,
    search: "native",
    note: "Responses API with reasoning and OpenAI's hosted web search.",
  },
  {
    key: "gpt-6.1-terra",
    label: "GPT-6.1 Terra",
    provider: "openai",
    efforts: [
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
    ],
    defaultEffort: "medium",
    vision: true,
    search: "native",
    note: "Responses API with reasoning and OpenAI's hosted web search.",
  },
  {
    key: "claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    provider: "anthropic",
    efforts: [
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "xhigh", label: "X-High" },
      { id: "max", label: "Max" },
    ],
    defaultEffort: "medium",
    vision: true,
    search: "native",
    note: "Adaptive thinking at every effort level, with Claude's built-in web search.",
  },
  {
    key: "deepseek-flash",
    label: "DeepSeek Flash",
    provider: "deepseek",
    efforts: LOW_HIGH_MAX,
    defaultEffort: "high",
    vision: false,
    search: "zai",
    note: "Thinking enabled. Text only. Web search runs through Z.ai.",
  },
  {
    key: "glm-5.3-flash",
    label: "GLM 5.3 Flash",
    provider: "zai",
    efforts: LOW_HIGH_MAX,
    defaultEffort: "high",
    vision: true,
    search: "zai",
    note: "Thinking enabled, reads images, searches through Z.ai.",
  },
  {
    key: "mimo-v2.6-pro",
    label: "MiMo V2.6 Pro",
    provider: "xiaomi",
    efforts: [
      { id: "standard", label: "Standard" },
      { id: "deep", label: "Deep" },
    ],
    defaultEffort: "deep",
    vision: false,
    search: "zai",
    note: "Deep turns on thinking mode. Text only. Web search runs through Z.ai.",
  },
  {
    key: "mimo-v2.6-flash",
    label: "MiMo V2.6 Flash",
    provider: "xiaomi",
    efforts: [
      { id: "standard", label: "Standard" },
      { id: "deep", label: "Deep" },
    ],
    defaultEffort: "standard",
    vision: false,
    search: "zai",
    note: "Fastest MiMo. Deep turns on thinking mode. Web search runs through Z.ai.",
  },
];

export const DEFAULT_MODEL = "claude-haiku-5-5";

export function getModel(key: string): ForgeModel | undefined {
  return MODELS.find((m) => m.key === key);
}

export function providerLabel(id: ProviderId): string {
  return PROVIDERS.find((p) => p.id === id)?.label ?? id;
}
