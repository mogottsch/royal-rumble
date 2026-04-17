import { useEffect, useMemo, useState } from "react";

type DrinkType = "sips" | "shots" | "chugs";

type RawDrinkTotals = Record<DrinkType, number>;

type PersistedDrinkTotals = Partial<Record<DrinkType, number>>;

export interface PersonalDrinkTrackerState {
  raw: RawDrinkTotals;
  consumed: RawDrinkTotals;
  remaining: RawDrinkTotals;
  decrement: (drinkType: DrinkType) => void;
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
}: {
  lobbyCode?: string;
  claimedParticipantId?: number;
  raw: RawDrinkTotals;
}): PersonalDrinkTrackerState {
  const storageKey =
    lobbyCode && claimedParticipantId !== undefined
      ? `personal-drink-tracker:${lobbyCode}:${claimedParticipantId}`
      : undefined;

  const [consumed, setConsumed] = useState<RawDrinkTotals>({
    sips: 0,
    shots: 0,
    chugs: 0,
  });

  useEffect(() => {
    if (!storageKey) {
      setConsumed({ sips: 0, shots: 0, chugs: 0 });
      return;
    }

    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      setConsumed(clampConsumed(raw, {}));
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as PersistedDrinkTotals;
      setConsumed(clampConsumed(raw, parsed));
    } catch {
      setConsumed(clampConsumed(raw, {}));
    }
  }, [storageKey]);

  useEffect(() => {
    setConsumed((current) => clampConsumed(raw, current));
  }, [raw]);

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
