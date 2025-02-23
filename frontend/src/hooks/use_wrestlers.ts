import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchApi } from "../api/fetcher";
import { Wrestler } from "./use_lobby";

interface Props {
  searchTerm: string;
}

export function useWrestlers({ searchTerm }: Props) {
  const [wrestlers, setWrestlers] = useState<Wrestler[] | undefined>(undefined);
  const query = useWrestlersQuery(searchTerm);

  useEffect(() => {
    if (query.data) {
      setWrestlers(query.data);
    }
  }, [query.data]);

  return {
    wrestlers: wrestlers ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    query,
  };
}

function useWrestlersQuery(searchTerm: string) {
  const queryKey = ["wrestlers", searchTerm];
  return useQuery<Wrestler[], any>(queryKey, fetchWrestlers);
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
