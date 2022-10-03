import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/state";
import { useUserContext } from "../contexts/user";
import { USER_NAME_LOCAL_STORAGE_KEY } from "../hooks/use_lobby";
import { Lobby } from "../models";
import { EnterName } from "./enter_name";

export function CreateLobby() {
  const { user, isLoading: userLoading } = useUserContext();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [name, setName] = useState<string | null>(
    localStorage.getItem(USER_NAME_LOCAL_STORAGE_KEY)
  );
  const { setIsLoading } = useStateContext();

  const setUserName = (name: string) => {
    localStorage.setItem(USER_NAME_LOCAL_STORAGE_KEY, name);
    setName(name);
  };

  const createLobby = async (name: string) => {
    setIsLoading("create_lobby", true);
    const lobby = await postCreateLobby(user?.name || name);
    setIsLoading("create_lobby", false);
    setLobby(lobby);
  };

  useEffect(() => {
    if (!!user || !!name) {
      createLobby((user?.name || name) as string);
    }
  }, [user, name]);

  if (userLoading) {
    return <div>Loading...</div>;
  }
  if (!user && name === null) {
    return <EnterName onSubmit={setUserName} />;
  }

  if (!lobby) {
    return <div>Loading...</div>;
  }

  return <Navigate to={`/lobbies/${lobby.code}`} />;
}

async function postCreateLobby(userName?: string): Promise<Lobby> {
  const url = new URL(`/api/lobbies`, window.location.origin);
  if (userName) {
    url.searchParams.set("user_name", userName);
  }
  const response = await fetch(url.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to create lobby: ${response.statusText}`);
  }
  const { lobby } = await response.json();
  return lobby;
}
