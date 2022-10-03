import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useUserContext } from "../contexts/user";
import { USER_NAME_LOCAL_STORAGE_KEY } from "../hooks/use_lobby";
import { EnterName } from "./enter_name";

export function JoinLobby() {
  const { user, isLoading: userLoading } = useUserContext();
  const [name, setName] = useState<string | null>(
    localStorage.getItem(USER_NAME_LOCAL_STORAGE_KEY)
  );

  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  if (!lobbyCode) {
    throw new Error("lobbyCode is undefined");
  }

  const setUserName = (name: string) => {
    localStorage.setItem(USER_NAME_LOCAL_STORAGE_KEY, name);
    setName(name);
  };

  if (userLoading) {
    return <div>Loading...</div>;
  }
  if (!user && name === null) {
    return <EnterName onSubmit={setUserName} />;
  }

  return <Navigate to={`/lobbies/${lobbyCode}`} />;
}
