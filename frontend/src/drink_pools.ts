import { ChestChoiceOption, Lobby, Rumbler } from "./hooks/use_lobby";

export type PendingDrinkPool = {
  chestRewardId?: number;
  eliminationId: number;
  offender?: Rumbler;
  victim?: Rumbler;
  schluecke: number;
  shots: number;
  minimumSelfSchluecke?: number;
  minimumSelfShots?: number;
};

export type PendingChestChoice = {
  chestRewardId: number;
  eliminationId: number;
  offender?: Rumbler;
  victim?: Rumbler;
};

export type PendingChestFollowUp = {
  chestRewardId: number;
  status: "pending_effect_choice" | "pending_target_pick";
};

export type RevealedChestReward = {
  chestRewardId: number;
  eliminationId: number;
  offender?: Rumbler;
  victim?: Rumbler;
  chestType: "safe" | "group" | "chaos";
  cardKey: string;
  cardMode: "auto" | "give_out" | "target_pick" | "effect_choice";
  schluecke: number;
  shots: number;
  choiceOptions?: ChestChoiceOption[] | null;
  selectedChoiceKey?: string | null;
  affectedParticipantIds?: number[] | null;
};

export function getPendingChestChoices(
  lobby: Lobby,
  claimedParticipantId: number | null,
): PendingChestChoice[] {
  if (claimedParticipantId === null || !lobby.drink_config.mystery_chests_enabled) {
    return [];
  }

  return lobby.chest_rewards
    .filter(
      (reward) =>
        reward.chooser_participant_id === claimedParticipantId &&
        reward.status === "pending_choice",
    )
    .map((reward) => ({
      chestRewardId: reward.id,
      eliminationId: reward.elimination_id,
      offender: reward.offender_rumbler ?? undefined,
      victim: reward.victim_rumbler ?? undefined,
    }));
}

export function getRevealedChestRewards(
  lobby: Lobby,
  claimedParticipantId: number | null,
): RevealedChestReward[] {
  if (claimedParticipantId === null || !lobby.drink_config.mystery_chests_enabled) {
    return [];
  }

  return lobby.chest_rewards
    .filter(
      (reward) =>
        reward.chooser_participant_id === claimedParticipantId &&
        (
          reward.status === "revealed_effect_choice" ||
          reward.status === "revealed_auto" ||
          reward.status === "revealed_distribution" ||
          reward.status === "revealed_target_pick"
        ) &&
        reward.chest_type &&
        reward.card_key &&
        reward.card_mode,
    )
    .map((reward) => ({
      chestRewardId: reward.id,
      eliminationId: reward.elimination_id,
      offender: reward.offender_rumbler ?? undefined,
      victim: reward.victim_rumbler ?? undefined,
      chestType: reward.chest_type as "safe" | "group" | "chaos",
      cardKey: reward.card_key as string,
      cardMode: reward.card_mode as "auto" | "give_out" | "target_pick" | "effect_choice",
      schluecke: reward.pending_schluecke,
      shots: reward.pending_shots,
      choiceOptions: reward.choice_options ?? null,
      selectedChoiceKey: reward.selected_choice_key ?? null,
      affectedParticipantIds: reward.affected_participant_ids ?? null,
    }));
}

export function getPendingChestFollowUps(
  lobby: Lobby,
  claimedParticipantId: number | null,
): PendingChestFollowUp[] {
  if (claimedParticipantId === null || !lobby.drink_config.mystery_chests_enabled) {
    return [];
  }

  return lobby.chest_rewards
    .filter(
      (reward) =>
        reward.chooser_participant_id === claimedParticipantId &&
        (
          reward.status === "pending_effect_choice" ||
          reward.status === "pending_target_pick"
        ),
    )
    .map((reward) => ({
      chestRewardId: reward.id,
      status: reward.status as "pending_effect_choice" | "pending_target_pick",
    }));
}

export function getPendingDrinkPools(
  lobby: Lobby,
  claimedParticipantId: number | null,
  eliminationId?: number,
): PendingDrinkPool[] {
  if (claimedParticipantId === null) return [];

  if (lobby.drink_config.mystery_chests_enabled) {
    return lobby.chest_rewards
      .filter(
        (reward) =>
          reward.chooser_participant_id === claimedParticipantId &&
          reward.status === "pending_distribution" &&
          (eliminationId === undefined || reward.elimination_id === eliminationId),
      )
      .map((reward) => ({
        chestRewardId: reward.id,
        eliminationId: reward.elimination_id,
        offender: reward.offender_rumbler ?? undefined,
        victim: reward.victim_rumbler ?? undefined,
        schluecke: reward.pending_schluecke,
        shots: reward.pending_shots,
        minimumSelfSchluecke: reward.minimum_self_schluecke ?? 0,
        minimumSelfShots: reward.minimum_self_shots ?? 0,
      }));
  }

  const schluecke = lobby.drink_config.schluecke_per_elimination ?? 0;
  const shots = lobby.drink_config.shots_per_elimination ?? 0;
  if (schluecke === 0 && shots === 0) return [];

  const pools: PendingDrinkPool[] = [];

  for (const action of lobby.actions) {
    const elimination = action.elimination;
    if (!elimination) continue;
    if (eliminationId !== undefined && elimination.id !== eliminationId) continue;

    for (const offender of elimination.rumbler_offenders) {
      if (offender.participant?.id !== claimedParticipantId) continue;

      for (const victim of elimination.rumbler_victims) {
        const done = lobby.drink_distributions.some(
          (distribution) =>
            distribution.elimination_id === elimination.id &&
            distribution.offender_rumbler_id === offender.id &&
            distribution.victim_rumbler_id === victim.id &&
            distribution.giver_participant_id === claimedParticipantId,
        );

        if (done) continue;

        pools.push({
          eliminationId: elimination.id,
          offender,
          victim,
          schluecke,
          shots,
        });
      }
    }
  }

  return pools;
}

export function getPendingDrinkPoolSignature(pools: PendingDrinkPool[]): string {
  return pools
    .map(
      (pool) =>
        `${pool.chestRewardId ?? 0}:${pool.eliminationId}:${pool.offender?.id ?? 0}:${pool.victim?.id ?? 0}`,
    )
    .join("|");
}

export function getPendingChestChoiceSignature(choices: PendingChestChoice[]): string {
  return choices.map((choice) => String(choice.chestRewardId)).join("|");
}

export function getPendingChestFollowUpSignature(followUps: PendingChestFollowUp[]): string {
  return followUps
    .map((followUp) => `${followUp.chestRewardId}:${followUp.status}`)
    .join("|");
}
