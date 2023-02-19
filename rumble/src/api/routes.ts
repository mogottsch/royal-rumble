const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function getApiUrl(path: string): URL {
  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`/api/${trimmedPath}`, BACKEND_URL);
}
