import { useQuery } from "@tanstack/react-query";
import { apiJson } from "../api/fetcher";
import { Wrestler } from "./use_lobby";

interface Props {
  searchTerm: string;
}

export function useWrestlers({ searchTerm }: Props) {
  const query = useQuery<Wrestler[], Error>({
    queryKey: ["wrestlers", searchTerm],
    queryFn: ({ signal }) => fetchWrestlers(searchTerm, signal),
    enabled: searchTerm.trim().length >= 2,
    placeholderData: (previousData) => previousData,
  });

  return {
    wrestlers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    query,
  };
}

export async function fetchWrestlers(searchTerm: string, signal: AbortSignal): Promise<Wrestler[]> {
  const params = new URLSearchParams({ search: searchTerm });
  const data = await apiJson<{ data?: Wrestler[] }>(`/wrestlers/search?${params}`, { signal });
  return data.data ?? [];
}
