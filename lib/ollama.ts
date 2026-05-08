const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434/api";
const DEFAULT_OLLAMA_MODEL = "codellama:latest";
const DEFAULT_OLLAMA_TIMEOUT_MS = 15000;
const DEFAULT_OLLAMA_HEALTH_TIMEOUT_MS = 3000;

export interface OllamaStatus {
  baseUrl: string;
  model: string;
  reachable: boolean;
  modelAvailable: boolean;
  availableModels: string[];
  message: string;
}

export interface GenerateWithOllamaOptions {
  prompt: string;
  stream?: boolean;
  timeoutMs?: number;
  options?: Record<string, unknown>;
}

export interface GenerateWithOllamaResult {
  response: string;
  model: string;
  promptTokens?: number;
  tokens?: number;
  totalDuration?: number;
}

export class OllamaError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "OllamaError";
    this.statusCode = statusCode;
  }
}

export function getOllamaBaseUrl() {
  return (
    process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") ||
    DEFAULT_OLLAMA_BASE_URL
  );
}

export function getOllamaModel() {
  return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
}

export function getOllamaHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OLLAMA_API_KEY}`;
  }

  return headers;
}

function normalizeModelName(name: string) {
  return name.trim().toLowerCase();
}

function getOllamaModelCandidates(model: string) {
  const normalizedModel = normalizeModelName(model);
  const candidates = new Set<string>();

  if (normalizedModel) {
    candidates.add(normalizedModel);
  }

  const [baseModelName] = normalizedModel.split(":");
  if (baseModelName) {
    candidates.add(baseModelName);
  }

  if (normalizedModel.endsWith(":latest")) {
    candidates.add(normalizedModel.replace(/:latest$/, ""));
  }

  return [...candidates];
}

function createConnectionHelp(baseUrl: string, model: string) {
  return `Start the Ollama app or run "ollama serve", then confirm "${model}" is available at ${baseUrl}.`;
}

function parseOllamaErrorPayload(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return null;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toOllamaError(
  error: unknown,
  baseUrl = getOllamaBaseUrl(),
  model = getOllamaModel(),
) {
  if (error instanceof OllamaError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new OllamaError(
      `Timed out waiting for Ollama at ${baseUrl} using model "${model}". ${createConnectionHelp(baseUrl, model)}`,
      504,
    );
  }

  if (error instanceof TypeError) {
    return new OllamaError(
      `Unable to reach Ollama at ${baseUrl}. ${createConnectionHelp(baseUrl, model)}`,
      503,
    );
  }

  return new OllamaError(
    error instanceof Error ? error.message : "Unknown Ollama error",
    500,
  );
}

export async function getOllamaStatus({
  timeoutMs = DEFAULT_OLLAMA_HEALTH_TIMEOUT_MS,
}: {
  timeoutMs?: number;
} = {}): Promise<OllamaStatus> {
  const baseUrl = getOllamaBaseUrl();
  const model = getOllamaModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/tags`, {
      headers: getOllamaHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const errorMessage =
        parseOllamaErrorPayload(payload) ||
        `Ollama responded with ${response.status}.`;

      return {
        baseUrl,
        model,
        reachable: false,
        modelAvailable: false,
        availableModels: [],
        message: `${errorMessage} ${createConnectionHelp(baseUrl, model)}`,
      };
    }

    const availableModels = Array.isArray(
      (payload as { models?: unknown })?.models,
    )
      ? (payload as { models: Array<{ name?: unknown }> }).models
          .map((entry) => (typeof entry.name === "string" ? entry.name : ""))
          .filter(Boolean)
      : [];

    const normalizedAvailableModels = new Set(
      availableModels.map((availableModel) =>
        normalizeModelName(availableModel),
      ),
    );
    const modelAvailable = getOllamaModelCandidates(model).some((candidate) =>
      normalizedAvailableModels.has(candidate),
    );

    return {
      baseUrl,
      model,
      reachable: true,
      modelAvailable,
      availableModels,
      message: modelAvailable
        ? `Connected to Ollama model "${model}".`
        : `Ollama is running, but model "${model}" is not installed. Run "ollama pull ${model}".`,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const ollamaError = toOllamaError(error, baseUrl, model);

    return {
      baseUrl,
      model,
      reachable: false,
      modelAvailable: false,
      availableModels: [],
      message: ollamaError.message,
    };
  }
}

export async function generateWithOllama({
  prompt,
  stream = false,
  timeoutMs = DEFAULT_OLLAMA_TIMEOUT_MS,
  options = {},
}: GenerateWithOllamaOptions): Promise<GenerateWithOllamaResult> {
  const baseUrl = getOllamaBaseUrl();
  const model = getOllamaModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/generate`, {
      method: "POST",
      headers: getOllamaHeaders(),
      body: JSON.stringify({
        model,
        prompt,
        stream,
        options,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await parseJsonSafe(response);

    if (!response.ok) {
      const errorMessage =
        parseOllamaErrorPayload(payload) ||
        response.statusText ||
        `HTTP ${response.status}`;

      if (
        response.status === 404 ||
        /model.*(not found|missing|pull)/i.test(errorMessage)
      ) {
        throw new OllamaError(
          `Ollama is running, but model "${model}" is not installed. Run "ollama pull ${model}".`,
          503,
        );
      }

      throw new OllamaError(
        `Ollama request failed (${response.status}): ${errorMessage}`,
        response.status >= 500 ? 502 : response.status,
      );
    }

    const responseText =
      typeof (payload as { response?: unknown })?.response === "string"
        ? (payload as { response: string }).response.trim()
        : "";

    if (!responseText) {
      throw new OllamaError(
        `Ollama returned an empty response for model "${model}".`,
        502,
      );
    }

    return {
      response: responseText,
      model:
        typeof (payload as { model?: unknown })?.model === "string" &&
        (payload as { model: string }).model
          ? (payload as { model: string }).model
          : model,
      promptTokens:
        typeof (payload as { prompt_eval_count?: unknown })?.prompt_eval_count ===
        "number"
          ? (payload as { prompt_eval_count: number }).prompt_eval_count
          : undefined,
      tokens:
        typeof (payload as { eval_count?: unknown })?.eval_count === "number"
          ? (payload as { eval_count: number }).eval_count
          : undefined,
      totalDuration:
        typeof (payload as { total_duration?: unknown })?.total_duration ===
        "number"
          ? (payload as { total_duration: number }).total_duration
          : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw toOllamaError(error, baseUrl, model);
  }
}
