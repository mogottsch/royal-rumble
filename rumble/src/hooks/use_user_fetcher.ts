import { useQuery } from "@tanstack/react-query";
import { User } from "../models";

export function useUserFetcher() {
  const query = useQuery(["user"], fetchUser, {
    refetchOnWindowFocus: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

async function fetchUser(): Promise<User> {
  const response = await fetch("/api/user");
  const json = await response.json();
  const result = json?.user ?? null;
  return result;
}
