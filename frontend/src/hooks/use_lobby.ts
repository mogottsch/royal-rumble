import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiJson } from "../api/fetcher";
import { useEchoContext } from "../contexts/echo_context";
import { useNotificationContext } from "../contexts/notification_context";

export interface Lobby {
  id: number;
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

export interface LobbySettings extends DrinkConfig {
  rumble_size: number;
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
  offender_rumbler_id: number | null;
  victim_rumbler_id: number | null;
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
  affected_participant_ids?: number[] | null;
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
  resolved_option?: ChestChoiceOption | null;
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
  created_at?: string;
  updated_at?: string;
  name: string;
  entrance_number: number | null;
  lobby_id: number;
  rumbler_id: number | null;
  drunk_sips: number;
  drunk_shots: number;
  drunk_chugs: number;
}

export interface Rumbler {
  id: number;
  created_at?: string;
  updated_at?: string;
  entrance_number: number;
  lobby_id: number;
  wrestler_id: number;
  wrestler: Wrestler;
  is_eliminated: boolean;
  participant: Participant | null;
  pivot?: { participant_id?: number | null };
}

export interface Wrestler {
  id: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  royal_rumble_stats?: {
    appearances: number;
    number_one_appearances: number;
    number_thirty_appearances: number;
  };
  image_url?: string;
  thumbnail_url?: string;
}

export function useLobby({
  lobbyCode,
  pollIntervalMs = 3000,
}: {
  lobbyCode?: string;
  pollIntervalMs?: number | false;
}) {
  const queryClient = useQueryClient();
  const query = useQuery<Lobby, Error>({
    queryKey: ["lobby", lobbyCode],
    queryFn: ({ signal }) => fetchLobby(lobbyCode, signal),
    enabled: Boolean(lobbyCode),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: pollIntervalMs,
  });
  const { echo } = useEchoContext();
  const { notify } = useNotificationContext();
  const navigate = useNavigate();
  const lastBackgroundError = useRef<string | undefined>(undefined);

  useEffect(() => {
    const lobbyId = query.data?.id;
    if (!lobbyId || !echo || !lobbyCode) return;

    const channel = echo.channel(`lobbies.${lobbyId}`);
    const eventName = ".lobby-updated";
    const callback = () => {
      void queryClient.invalidateQueries({ queryKey: ["lobby", lobbyCode], exact: true });
    };
    channel.listen(eventName, callback);
    return () => {
      channel.stopListening(eventName, callback);
      echo.leave(`lobbies.${lobbyId}`);
    };
  }, [echo, lobbyCode, query.data?.id, queryClient]);

  useEffect(() => {
    if (!query.isError) {
      lastBackgroundError.current = undefined;
      return;
    }

    const isNotFound =
      query.error.cause instanceof ApiError && query.error.cause.status === 404;
    if (!query.data || isNotFound) {
      notify(query.error.message, "error");
      navigate("/", { replace: true });
      return;
    }

    if (lastBackgroundError.current !== query.error.message) {
      lastBackgroundError.current = query.error.message;
      notify(query.error.message, "error");
    }
  }, [navigate, notify, query.data, query.error, query.isError]);

  return {
    lobby: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    query,
  };
}

async function fetchLobby(lobbyCode: string | undefined, signal: AbortSignal): Promise<Lobby> {
  if (!lobbyCode) throw new Error("No lobby code provided");
  try {
    const data = await apiJson<{ data: { lobby: Lobby } }>(
      `/lobbies/${encodeURIComponent(lobbyCode)}`,
      { signal },
    );
    return data.data.lobby;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error("Lobby not found", { cause: error });
    }
    throw error;
  }
}
