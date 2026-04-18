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
  nextEntranceNumber: number | null;
  settings: LobbySettings;
  drink_config: DrinkConfig;
  drink_distributions: DrinkDistribution[];
  chugs: Chug[];
  chest_rewards: ChestReward[];
}

export interface DrinkConfig {
  schluecke_per_elimination: number;
  shots_per_elimination: number;
  schluecke_on_npc_elimination: number;
  shots_on_npc_elimination: number;
  mystery_chests_enabled: boolean;
  chest_aggression_multiplier: number;
}

export interface LobbySettings {
  rumble_size: number;
  schluecke_per_elimination: number;
  shots_per_elimination: number;
  schluecke_on_npc_elimination: number;
  shots_on_npc_elimination: number;
  mystery_chests_enabled: boolean;
  chest_aggression_multiplier: number;
}

export interface DrinkDistribution {
  id: number;
  lobby_id: number;
  elimination_id: number | null;
  offender_rumbler_id: number | null;
  victim_rumbler_id: number | null;
  giver_participant_id: number | null;
  receiver_participant_id: number;
  schluecke: number;
  shots: number;
  kind: "elimination_reward" | "chest_reward" | "npc_elimination_penalty";
  created_at?: string;
  giver?: Participant | null;
  receiver?: Participant | null;
  offender_rumbler?: Rumbler | null;
  victim_rumbler?: Rumbler | null;
}

export interface ChestReward {
  id: number;
  lobby_id: number;
  elimination_id: number;
  offender_rumbler_id: number;
  victim_rumbler_id: number;
  chooser_participant_id: number;
  status:
    | "pending_choice"
    | "revealed_effect_choice"
    | "pending_effect_choice"
    | "revealed_target_pick"
    | "pending_target_pick"
    | "revealed_auto"
    | "revealed_distribution"
    | "pending_distribution"
    | "resolved";
  chest_type: "safe" | "group" | "chaos" | null;
  card_key: string | null;
  card_mode: "auto" | "give_out" | "target_pick" | "effect_choice" | null;
  pending_schluecke: number;
  pending_shots: number;
  choice_options?: ChestChoiceOption[] | null;
  selected_choice_key?: string | null;
  minimum_self_schluecke?: number;
  minimum_self_shots?: number;
  target_participant_id?: number | null;
  result_participant_id?: number | null;
  chooser?: Participant | null;
  offender_rumbler?: Rumbler | null;
  victim_rumbler?: Rumbler | null;
}

export interface ChestChoiceOption {
  key: string;
  mode: "auto" | "give_out" | "target_pick";
  effect?: string;
  schluecke: number;
  shots: number;
  self_schluecke?: number;
  self_shots?: number;
  minimum_self_schluecke?: number;
  minimum_self_shots?: number;
}

export interface Chug {
  id: number;
  lobby_id: number;
  participant_id: number;
  elimination_id: number;
  created_at?: string;
  participant?: Participant | null;
}

export interface Action {
  id: number;
  lobby_id: number;
  created_at?: string;
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
  participant: Participant | null;
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
    if (!lobbyCode) {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetchApi("/lobbies/" + lobbyCode);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setLobby(data.data.lobby);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [lobbyCode]);

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
