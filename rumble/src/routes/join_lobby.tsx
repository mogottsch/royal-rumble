import { Navigate, useParams } from "react-router-dom";

export function JoinLobby() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  if (!lobbyCode) {
    throw new Error("lobbyCode is undefined");
  }

  return <Navigate to={`/lobbies/${lobbyCode}/view-game`} />;
}
