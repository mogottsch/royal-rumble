import { useParams } from "react-router-dom";
import { App } from "./app";
import { useLobby } from "../../hooks/use_lobby";
import { LobbyContextProvider } from "../../contexts/lobby_context";
import { ParticipantClaimProvider } from "../../contexts/participant_claim_context";
import { useParticipantClaimState } from "../../hooks/use_participant_claim";
import { ClaimGate } from "../../components/claim_gate";

export function LobbyLayout() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { lobby, query: lobbyQuery } = useLobby({ lobbyCode, pollIntervalMs: 3000 });
  const { claimedParticipantId, claim, clear } =
    useParticipantClaimState(lobbyCode);

  const isKnownParticipant =
    claimedParticipantId !== null &&
    lobby?.participants.some((p) => p.id === claimedParticipantId);

  return (
    <ParticipantClaimProvider
      value={{ claimedParticipantId, claim, clear }}
    >
      <LobbyContextProvider value={{ lobby, lobbyQuery }}>
        {lobby && !isKnownParticipant ? <ClaimGate lobby={lobby} /> : <App />}
      </LobbyContextProvider>
    </ParticipantClaimProvider>
  );
}
