import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "../contexts/user";
import { Lobby } from "../models";

interface Props {
  lobbyCode: string;
}

export const USER_NAME_LOCAL_STORAGE_KEY = "rumble_user_name";

export function useLobby({ lobbyCode }: Props) {
  const userName =
    localStorage.getItem(USER_NAME_LOCAL_STORAGE_KEY) || undefined;

  const { user } = useUserContext();

  const query = useQuery(
    ["lobby", lobbyCode],
    () => fetchLobby(lobbyCode, userName),
    {
      enabled: !!user || !!userName,
    }
  );

  return { lobby: query.data, ...query };
}

async function fetchLobby(lobbyId: string, userName?: string): Promise<Lobby> {
  const url = new URL(`/api/lobbies/${lobbyId}`, window.location.origin);
  if (userName) {
    url.searchParams.set("user_name", userName);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch lobby: ${response.statusText}`);
  }
  const { lobby } = await response.json();
  return lobby;
}
