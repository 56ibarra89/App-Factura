export function normalizeApiBaseUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const runtimeUrl = window.runtimeConfig?.getApiBaseUrlSync?.();
    const normalizedRuntime = normalizeApiBaseUrl(runtimeUrl);
    if (normalizedRuntime) {
      return normalizedRuntime;
    }
  }

  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
}
