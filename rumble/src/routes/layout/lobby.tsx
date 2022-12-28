/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { useParams } from "react-router-dom";
import { App } from "./app";
import { useLobby } from "../../hooks/use_lobby";
import { LobbyContextProvider } from "../../contexts/lobby_context";

export function LobbyLayout() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { lobby } = useLobby({ lobbyCode });
  return (
    <LobbyContextProvider value={{ lobby }}>
      <App />
    </LobbyContextProvider>
  );
}
