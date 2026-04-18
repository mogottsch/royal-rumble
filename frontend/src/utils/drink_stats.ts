import { Lobby, Participant } from "../hooks/use_lobby";

export type ParticipantDrinkStats = {
  participant: Participant;
  sipsReceived: number;
  sipsGiven: number;
  shotsReceived: number;
  shotsGiven: number;
  totalChugs: number;
  drunkSips: number;
  drunkShots: number;
  drunkChugs: number;
  remainingSips: number;
  remainingShots: number;
  remainingChugs: number;
  drinkScore: number;
};

export function buildParticipantDrinkStats(lobby: Lobby): ParticipantDrinkStats[] {
  const dueMap = new Map<number, { sips: number; shots: number; chugs: number }>();
  const givenMap = new Map<number, { sips: number; shots: number }>();

  for (const participant of lobby.participants) {
    dueMap.set(participant.id, { sips: 0, shots: 0, chugs: 0 });
    givenMap.set(participant.id, { sips: 0, shots: 0 });
  }

  for (const distribution of lobby.drink_distributions) {
    const receiver = dueMap.get(distribution.receiver_participant_id);
    if (receiver) {
      receiver.sips += distribution.schluecke;
      receiver.shots += distribution.shots;
    }

    if (distribution.giver_participant_id !== null) {
      const giver = givenMap.get(distribution.giver_participant_id);
      if (giver) {
        giver.sips += distribution.schluecke;
        giver.shots += distribution.shots;
      }
    }
  }

  for (const chug of lobby.chugs) {
    const receiver = dueMap.get(chug.participant_id);
    if (receiver) {
      receiver.chugs += 1;
    }
  }

  return lobby.participants.map((participant) => {
    const due = dueMap.get(participant.id) ?? { sips: 0, shots: 0, chugs: 0 };
    const given = givenMap.get(participant.id) ?? { sips: 0, shots: 0 };
    const drunkSips = Math.min(due.sips, participant.drunk_sips ?? 0);
    const drunkShots = Math.min(due.shots, participant.drunk_shots ?? 0);
    const drunkChugs = Math.min(due.chugs, participant.drunk_chugs ?? 0);

    return {
      participant,
      sipsReceived: due.sips,
      sipsGiven: given.sips,
      shotsReceived: due.shots,
      shotsGiven: given.shots,
      totalChugs: due.chugs,
      drunkSips,
      drunkShots,
      drunkChugs,
      remainingSips: Math.max(0, due.sips - drunkSips),
      remainingShots: Math.max(0, due.shots - drunkShots),
      remainingChugs: Math.max(0, due.chugs - drunkChugs),
      drinkScore: drunkSips + drunkShots * 3 + drunkChugs * 10,
    };
  });
}

export function compareDrinkScore(left: ParticipantDrinkStats, right: ParticipantDrinkStats) {
  if (right.drinkScore !== left.drinkScore) {
    return right.drinkScore - left.drinkScore;
  }
  if (right.drunkChugs !== left.drunkChugs) {
    return right.drunkChugs - left.drunkChugs;
  }
  if (right.drunkShots !== left.drunkShots) {
    return right.drunkShots - left.drunkShots;
  }
  if (right.drunkSips !== left.drunkSips) {
    return right.drunkSips - left.drunkSips;
  }
  return left.participant.name.localeCompare(right.participant.name);
}