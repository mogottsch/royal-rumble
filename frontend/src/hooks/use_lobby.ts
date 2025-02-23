import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/fetcher";
import { useEchoContext } from "../contexts/echo_context";
import { useNotificationContext } from "../contexts/notification_context";

export interface Lobby {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  participants: Participant[];
  rumblers: Rumbler[];
  actions: Action[];
  nextEntranceNumber: number;
}

export interface Action {
  id: number;
  lobby_id: number;
  type: "entrance" | "elimination";
  rumbler?: Rumbler;
  elimination?: Elimination;
}

export interface Elimination {
  id: number;
  rumbler_offenders: Rumbler[];
  rumbler_victims: Rumbler[];
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
  wrestler: Wrestler;
  is_eliminated: boolean;
}

export interface Wrestler {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  image_url?: string;
}

export function useLobby({ lobbyCode }: { lobbyCode?: string }) {
  const [lobby, setLobby] = useState<Lobby | undefined>(undefined);
  const query = useLobbyQuery(lobbyCode);
  const { notify } = useNotificationContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (query.data) {
      setLobby(query.data);
    }
  }, [query.data]);

  const { echo } = useEchoContext();

  useEffect(() => {
    if (!lobby || !echo) {
      return;
    }
    const channel = echo.channel(`lobbies.${lobby.id}`);
    const callback = (e: any) => {
      if ("lobby" in e) {
        setLobby(e.lobby);
        return;
      }
      console.info("Unknown event", e);
    };

    const eventName = ".lobby-updated";
    channel.listen(eventName, callback);

    return () => {
      channel.stopListening(eventName, callback);
    };
  }, [lobby, echo]);

  useEffect(() => {
    if (query.isError) {
      setLobby(undefined);
      const error = query.error as Error;
      notify(error.message, "error");
      navigate("/");
    }
  }, [query.isError]);

  return {
    lobby,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    query,
  };
}

function useLobbyQuery(lobbyCode?: string) {
  const queryKey = ["lobby", lobbyCode];
  return useQuery<Lobby, any>({ queryKey, queryFn: fetchLobby, retry: false });
}

async function fetchLobby({ queryKey }: any): Promise<Lobby> {
  const lobbyCode = queryKey[1];
  if (!lobbyCode) {
    throw new Error("No lobby code provided");
  }
  const response = await fetchApi("/lobbies/" + lobbyCode);
  if (response.status === 404) {
    throw new Error("Lobby not found");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch lobby");
  }
  const data = await response.json();
  return data.data.lobby;
}
