import { useParams } from "react-router-dom";
import { App } from "./app";
import { useLobby } from "../../hooks/use_lobby";
import { LobbyContextProvider } from "../../contexts/lobby_context";

export function LobbyLayout() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { lobby, query: lobbyQuery } = useLobby({ lobbyCode });
  return (
    <LobbyContextProvider value={{ lobby, lobbyQuery }}>
      <App />
    </LobbyContextProvider>
  );
}
