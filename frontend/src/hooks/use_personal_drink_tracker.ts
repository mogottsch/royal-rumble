import { useEffect, useMemo, useState } from "react";
import { fetchApi, participantIdHeaders } from "../api/fetcher";

type DrinkType = "sips" | "shots" | "chugs";

type RawDrinkTotals = Record<DrinkType, number>;

type PersistedDrinkTotals = Partial<Record<DrinkType, number>>;

export interface PersonalDrinkTrackerState {
  raw: RawDrinkTotals;
  consumed: RawDrinkTotals;
  remaining: RawDrinkTotals;
  decrement: (drinkType: DrinkType) => void;
}

function isSameTotals(left: RawDrinkTotals, right: RawDrinkTotals) {
  return left.sips === right.sips && left.shots === right.shots && left.chugs === right.chugs;
}

function mergeConsumed(raw: RawDrinkTotals, current: PersistedDrinkTotals, server: RawDrinkTotals): RawDrinkTotals {
  const clampedCurrent = clampConsumed(raw, current);

  return {
    sips: Math.max(server.sips, clampedCurrent.sips),
    shots: Math.max(server.shots, clampedCurrent.shots),
    chugs: Math.max(server.chugs, clampedCurrent.chugs),
  };
}

function clampConsumed(raw: RawDrinkTotals, consumed: PersistedDrinkTotals): RawDrinkTotals {
  return {
    sips: Math.max(0, Math.min(raw.sips, consumed.sips ?? 0)),
    shots: Math.max(0, Math.min(raw.shots, consumed.shots ?? 0)),
    chugs: Math.max(0, Math.min(raw.chugs, consumed.chugs ?? 0)),
  };
}

export function usePersonalDrinkTracker({
  lobbyCode,
  claimedParticipantId,
  raw,
  serverConsumed,
}: {
  lobbyCode?: string;
  claimedParticipantId?: number;
  raw: RawDrinkTotals;
  serverConsumed: RawDrinkTotals;
}): PersonalDrinkTrackerState {
  const storageKey =
    lobbyCode && claimedParticipantId !== undefined
      ? `personal-drink-tracker:${lobbyCode}:${claimedParticipantId}`
      : undefined;

  const mergedServerConsumed = useMemo(
    () => clampConsumed(raw, serverConsumed),
    [raw, serverConsumed],
  );

  const [consumed, setConsumed] = useState<RawDrinkTotals>({
    sips: 0,
    shots: 0,
    chugs: 0,
  });

  useEffect(() => {
    if (!storageKey) {
      setConsumed((current) => {
        const next = { sips: 0, shots: 0, chugs: 0 };
        return isSameTotals(current, next) ? current : next;
      });
      return;
    }

    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      setConsumed((current) => (isSameTotals(current, mergedServerConsumed) ? current : mergedServerConsumed));
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as PersistedDrinkTotals;
      setConsumed((current) => {
        const next = mergeConsumed(raw, parsed, mergedServerConsumed);
        return isSameTotals(current, next) ? current : next;
      });
    } catch {
      setConsumed((current) => (isSameTotals(current, mergedServerConsumed) ? current : mergedServerConsumed));
    }
  }, [storageKey]);

  useEffect(() => {
    setConsumed((current) => {
      const next = mergeConsumed(raw, current, mergedServerConsumed);
      return isSameTotals(current, next) ? current : next;
    });
  }, [mergedServerConsumed, raw]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    const clamped = clampConsumed(raw, consumed);
    if (
      clamped.sips !== consumed.sips ||
      clamped.shots !== consumed.shots ||
      clamped.chugs !== consumed.chugs
    ) {
      setConsumed(clamped);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(clamped));
  }, [consumed, raw, storageKey]);

  useEffect(() => {
    if (!lobbyCode || claimedParticipantId === undefined) {
      return;
    }

    const clamped = clampConsumed(raw, consumed);

    void fetchApi(`/lobbies/${lobbyCode}/participants/${claimedParticipantId}/drink-progress`, {
      method: "PATCH",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...participantIdHeaders(claimedParticipantId),
      },
      body: JSON.stringify({
        drunk_sips: clamped.sips,
        drunk_shots: clamped.shots,
        drunk_chugs: clamped.chugs,
      }),
    });
  }, [claimedParticipantId, consumed, lobbyCode]);

  const remaining = useMemo(
    () => ({
      sips: Math.max(0, raw.sips - consumed.sips),
      shots: Math.max(0, raw.shots - consumed.shots),
      chugs: Math.max(0, raw.chugs - consumed.chugs),
    }),
    [consumed, raw],
  );

  const decrement = (drinkType: DrinkType) => {
    setConsumed((current) => {
      const nextValue = Math.min(raw[drinkType], current[drinkType] + 1);
      if (nextValue === current[drinkType]) {
        return current;
      }

      return {
        ...current,
        [drinkType]: nextValue,
      };
    });
  };

  return {
    raw,
    consumed,
    remaining,
    decrement,
  };
}
