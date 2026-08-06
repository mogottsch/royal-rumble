import { getApiUrl } from "./routes";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(
  path: string | URL,
  options: RequestInit = {},
): Promise<Response> {
  const url = path instanceof URL ? path : getApiUrl(path);
  const headers = new Headers(options.headers);
  if (!headers.has("accept")) headers.set("accept", "application/json");

  return fetch(url.toString(), { ...options, headers });
}

export async function apiJson<T>(
  path: string | URL,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchApi(path, options);
  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const body = await response.text();
  if (!body.trim()) return undefined as T;
  return JSON.parse(body) as T;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = response.statusText || `Request failed (${response.status})`;
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as { message?: unknown; errors?: Record<string, string[]> };
      if (typeof body.message === "string" && body.message.trim()) return body.message;
      const firstValidationError = body.errors && Object.values(body.errors).flat()[0];
      if (firstValidationError) return firstValidationError;
    } else {
      const text = (await response.text()).trim();
      if (text) return text;
    }
  } catch {
    // Use the HTTP status when the error response is malformed.
  }
  return fallback;
}

export function participantIdHeaders(
  participantId: number | null,
): Record<string, string> {
  if (participantId === null) return {};
  return { "X-Participant-Id": String(participantId) };
}
