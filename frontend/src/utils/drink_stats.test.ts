import { expect, it } from "vitest";
import type { Lobby } from "../hooks/use_lobby";
import { buildParticipantDrinkStats } from "./drink_stats";

it("clamps consumed drinks and computes weighted score and remaining totals", () => {
  const participant = { id: 1, lobby_id: 1, name: "Alice", entrance_number: 1, rumbler_id: null, drunk_sips: 99, drunk_shots: 1, drunk_chugs: 1 };
  const lobby = {
    participants: [participant],
    drink_distributions: [{ receiver_participant_id: 1, giver_participant_id: null, schluecke: 2, shots: 1 }],
    chugs: [{ participant_id: 1 }],
  } as unknown as Lobby;
  const [stats] = buildParticipantDrinkStats(lobby);
  expect(stats).toMatchObject({ drunkSips: 2, drunkShots: 1, drunkChugs: 1, remainingSips: 0, drinkScore: 15 });
});
