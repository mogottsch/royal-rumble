import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError, apiJson, participantIdHeaders } from "../api/fetcher";
import { useNotificationContext } from "../contexts/notification_context";

type DrinkType = "sips" | "shots" | "chugs";
export type RawDrinkTotals = Record<DrinkType, number>;
type PersistedDrinkTotals = Partial<RawDrinkTotals>;

export interface PersonalDrinkTrackerState {
  raw: RawDrinkTotals;
  consumed: RawDrinkTotals;
  remaining: RawDrinkTotals;
  decrement: (drinkType: DrinkType) => void;
}

const EMPTY_TOTALS: RawDrinkTotals = { sips: 0, shots: 0, chugs: 0 };

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

function isTransientSyncError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status === 429 || error.status >= 500;
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
  const { notify } = useNotificationContext();
  const storageKey =
    lobbyCode && claimedParticipantId !== undefined
      ? `personal-drink-tracker:${lobbyCode}:${claimedParticipantId}`
      : undefined;
  const mergedServerConsumed = useMemo(
    () => clampConsumed(raw, serverConsumed),
    [raw, serverConsumed],
  );
  const [consumed, setConsumed] = useState<RawDrinkTotals>(EMPTY_TOTALS);
  const [hydratedKey, setHydratedKey] = useState<string>();
  const lastSynced = useRef<string>("");
  const activeRequest = useRef<AbortController | undefined>(undefined);
  const requestGeneration = useRef(0);
  const lastErrorNoticeAt = useRef(0);

  useEffect(() => {
    requestGeneration.current += 1;
    activeRequest.current?.abort();
    activeRequest.current = undefined;

    if (!storageKey) {
      setConsumed(EMPTY_TOTALS);
      setHydratedKey(undefined);
      return;
    }

    let stored: PersistedDrinkTotals = {};
    try {
      const value = localStorage.getItem(storageKey);
      if (value) stored = JSON.parse(value) as PersistedDrinkTotals;
    } catch {
      // Corrupt or unavailable storage should not block server state.
    }
    setConsumed(mergeConsumed(raw, stored, mergedServerConsumed));
    setHydratedKey(storageKey);
    lastSynced.current = JSON.stringify(mergedServerConsumed);
    // Hydration intentionally runs once per participant key; subsequent server/raw changes merge below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (hydratedKey !== storageKey) return;
    setConsumed((current) => {
      const next = mergeConsumed(raw, current, mergedServerConsumed);
      return isSameTotals(current, next) ? current : next;
    });
  }, [hydratedKey, mergedServerConsumed, raw, storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedKey !== storageKey) return;
    const clamped = clampConsumed(raw, consumed);
    if (!isSameTotals(clamped, consumed)) {
      setConsumed(clamped);
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(clamped));
    } catch {
      // Server synchronization remains authoritative when storage is unavailable.
    }
  }, [consumed, hydratedKey, raw, storageKey]);

  useEffect(() => {
    if (!lobbyCode || claimedParticipantId === undefined || hydratedKey !== storageKey) return;
    const clamped = clampConsumed(raw, consumed);
    const serialized = JSON.stringify(clamped);
    if (serialized === lastSynced.current) return;

    const generation = requestGeneration.current;
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;
    let retryTimer: number | undefined;
    let cancelled = false;

    const sync = async (attempt: number) => {
      if (cancelled || generation !== requestGeneration.current) return;
      try {
        await apiJson(
          `/lobbies/${encodeURIComponent(lobbyCode)}/participants/${claimedParticipantId}/drink-progress`,
          {
            method: "PATCH",
            signal: controller.signal,
            headers: {
              "content-type": "application/json",
              ...participantIdHeaders(claimedParticipantId),
            },
            body: JSON.stringify({
              drunk_sips: clamped.sips,
              drunk_shots: clamped.shots,
              drunk_chugs: clamped.chugs,
            }),
          },
        );
        if (generation === requestGeneration.current) lastSynced.current = serialized;
      } catch (error) {
        if (controller.signal.aborted || cancelled) return;
        const now = Date.now();
        if (now - lastErrorNoticeAt.current > 5_000) {
          notify((error as Error).message, "error");
          lastErrorNoticeAt.current = now;
        }
        if (isTransientSyncError(error) && attempt < 3) {
          retryTimer = window.setTimeout(() => void sync(attempt + 1), 500 * 2 ** attempt);
        }
      }
    };

    const debounceTimer = window.setTimeout(() => void sync(0), 250);
    return () => {
      cancelled = true;
      window.clearTimeout(debounceTimer);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      controller.abort();
    };
  }, [claimedParticipantId, consumed, hydratedKey, lobbyCode, notify, raw, storageKey]);

  const remaining = useMemo(
    () => ({
      sips: Math.max(0, raw.sips - consumed.sips),
      shots: Math.max(0, raw.shots - consumed.shots),
      chugs: Math.max(0, raw.chugs - consumed.chugs),
    }),
    [consumed, raw],
  );

  const decrement = (drinkType: DrinkType) => {
    if (hydratedKey !== storageKey) return;
    setConsumed((current) => {
      const nextValue = Math.min(raw[drinkType], current[drinkType] + 1);
      return nextValue === current[drinkType]
        ? current
        : { ...current, [drinkType]: nextValue };
    });
  };

  return { raw, consumed, remaining, decrement };
}
