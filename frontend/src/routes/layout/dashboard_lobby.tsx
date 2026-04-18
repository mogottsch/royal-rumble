import { useParams } from "react-router-dom";
import { LobbyContextProvider } from "../../contexts/lobby_context";
import { ParticipantClaimProvider } from "../../contexts/participant_claim_context";
import { useLobby } from "../../hooks/use_lobby";
import { App } from "./app";

export function DashboardLobbyLayout() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { lobby, query: lobbyQuery } = useLobby({ lobbyCode, pollIntervalMs: false });

  return (
    <ParticipantClaimProvider
      value={{
        claimedParticipantId: null,
        claim: () => {},
        clear: () => {},
      }}
    >
      <LobbyContextProvider value={{ lobby, lobbyQuery }}>
        <App maxWidth={false} showPendingPrompt={false} />
      </LobbyContextProvider>
    </ParticipantClaimProvider>
  );
}
