import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../api/fetcher";
import { Wrestler } from "./use_lobby";

interface Props {
  searchTerm: string;
}

export function useWrestlers({ searchTerm }: Props) {
  const query = useWrestlersQuery(searchTerm);

  return {
    wrestlers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    query,
  };
}

function useWrestlersQuery(searchTerm: string) {
  const queryKey = ["wrestlers", searchTerm];
  return useQuery<Wrestler[], any>({
    queryKey,
    queryFn: fetchWrestlers,
    enabled: searchTerm.trim().length >= 2,
    placeholderData: (previousData) => previousData,
  });
}

async function fetchWrestlers({ queryKey }: any): Promise<Wrestler[]> {
  const searchTerm = queryKey[1];
  if (!searchTerm) {
    return [];
  }

  const response = await fetchApi("/wrestlers/search?search=" + searchTerm);
  const data = await response.json();
  return data.data ?? [];
}
