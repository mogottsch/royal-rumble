import { useEffect, useState } from "react";
import { User } from "../models";

export function useUserFetcher() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      const json = await response.json();
      setUser(json);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error };
}
