import { getApiUrl } from "./routes";

const defaultOptions: RequestInit = {
  headers: {
    accept: "application/json",
  },
};
export async function fetchApi(
  path: string | URL,
  options?: RequestInit
): Promise<Response> {
  const url = path instanceof URL ? path : getApiUrl(path);
  return fetch(url.toString(), { ...defaultOptions, ...options });
}
