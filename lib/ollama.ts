const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434/api";
const DEFAULT_OLLAMA_MODEL = "codellama:latest";

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
