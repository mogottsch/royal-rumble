import { useQuery } from "@tanstack/react-query";

export interface Lobby {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  participants: Participant[];
  rumblers: Rumbler[];
  actions: any[];
}

export interface Participant {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  entrance_number: number;
  lobby_id: number;
  rumbler_id: number;
}

export interface Rumbler {
  id: number;
  created_at: string;
  updated_at: string;
  entrance_number: number;
  lobby_id: number;
  wrestler_id: number;
}

export function useLobby({ lobbyCode }: { lobbyCode?: string }) {
  const query = useLobbyQuery(lobbyCode);

  return {
    lobby: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

function useLobbyQuery(lobbyCode?: string) {
  const queryKey = ["lobby", lobbyCode];
  return useQuery<Lobby, any>(queryKey, fetchLobby);
}

async function fetchLobby({ queryKey }: any): Promise<Lobby> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const lobbyCode = queryKey[1];
  if (!lobbyCode) {
    throw new Error("No lobby code provided");
  }
  const response = await fetch(BACKEND_URL + "/api/lobbies/" + lobbyCode);
  const data = await response.json();
  return data.data.lobby;
}
