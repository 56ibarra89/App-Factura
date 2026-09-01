export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || "";
};

export const checkBackendHealthApi = async (
  timeoutMs = 4000,
): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    clearTimeout(timeoutId);
    return response.ok || (response.status >= 200 && response.status < 500);
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};
