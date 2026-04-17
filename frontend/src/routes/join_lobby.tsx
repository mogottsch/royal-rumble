import { Navigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";

export function JoinLobby() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const { t } = useI18n();
  if (!lobbyCode) {
    throw new Error(t("lobby.errorMissingCode"));
  }

  return <Navigate to={`/lobbies/${lobbyCode}/view-game`} />;
}
