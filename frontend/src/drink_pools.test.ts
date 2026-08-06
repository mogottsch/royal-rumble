import { expect, it } from "vitest";
import { getPendingDrinkPools } from "./drink_pools";
import type { Lobby } from "./hooks/use_lobby";

it("keeps a classic reward visible using the offender owner snapshot", () => {
  const offender = {
    id: 10,
    lobby_id: 1,
    entrance_number: 1,
    wrestler_id: 1,
    wrestler: { id: 1, name: "Winner" },
    is_eliminated: false,
    participant: null,
    pivot: { participant_id: 7 },
  };
  const victim = { ...offender, id: 11, wrestler: { id: 2, name: "Victim" }, pivot: undefined };
  const lobby = {
    id: 1,
    code: "ABC",
    participants: [],
    rumblers: [offender, victim],
    actions: [{ id: 1, lobby_id: 1, type: "elimination", elimination: { id: 3, rumbler_offenders: [offender], rumbler_victims: [victim] } }],
    nextEntranceNumber: null,
    settings: {},
    drink_config: { schluecke_per_elimination: 4, shots_per_elimination: 0, mystery_chests_enabled: false },
    drink_distributions: [], chugs: [], chest_rewards: [],
  } as unknown as Lobby;
  expect(getPendingDrinkPools(lobby, 7)).toHaveLength(1);
});
