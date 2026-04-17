import { useCallback, useEffect, useState } from "react";

const storageKey = (lobbyCode: string) => `claim:${lobbyCode}`;

export function useParticipantClaimState(lobbyCode?: string) {
  const [claimedParticipantId, setClaimedParticipantId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!lobbyCode) {
      setClaimedParticipantId(null);
      return;
    }
    const raw = localStorage.getItem(storageKey(lobbyCode));
    setClaimedParticipantId(raw ? Number(raw) : null);
  }, [lobbyCode]);

  const claim = useCallback(
    (participantId: number) => {
      if (!lobbyCode) return;
      localStorage.setItem(storageKey(lobbyCode), String(participantId));
      setClaimedParticipantId(participantId);
    },
    [lobbyCode]
  );

  const clear = useCallback(() => {
    if (!lobbyCode) return;
    localStorage.removeItem(storageKey(lobbyCode));
    setClaimedParticipantId(null);
  }, [lobbyCode]);

  return { claimedParticipantId, claim, clear };
}
