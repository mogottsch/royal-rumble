import { createContext, useContext } from "react";

export type ParticipantClaimContextType = {
  claimedParticipantId: number | null;
  claim: (participantId: number) => void;
  clear: () => void;
};

export const ParticipantClaimContext =
  createContext<ParticipantClaimContextType>({
    claimedParticipantId: null,
    claim: () => {},
    clear: () => {},
  });

export const ParticipantClaimProvider = ParticipantClaimContext.Provider;

export const useParticipantClaim = () => useContext(ParticipantClaimContext);
