import { Lobby, Rumbler } from "./hooks/use_lobby";

export type PendingDrinkPool = {
  eliminationId: number;
  offender: Rumbler;
  victim: Rumbler;
  schluecke: number;
  shots: number;
};

export function getPendingDrinkPools(
  lobby: Lobby,
  claimedParticipantId: number | null,
  eliminationId?: number,
): PendingDrinkPool[] {
  if (claimedParticipantId === null) return [];

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
    .map((pool) => `${pool.eliminationId}:${pool.offender.id}:${pool.victim.id}`)
    .join("|");
}
