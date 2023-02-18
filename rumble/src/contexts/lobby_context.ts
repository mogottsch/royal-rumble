import { UseQueryResult } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { Lobby } from "../hooks/use_lobby";

export type StateContextType = {
  lobby?: Lobby;
  lobbyQuery?: UseQueryResult<Lobby, any>;
};

export const LobbyContext = createContext<StateContextType>({
  lobby: undefined,
  lobbyQuery: undefined,
});

export const LobbyContextProvider = LobbyContext.Provider;

export const useLobbyContext = () => {
  return useContext(LobbyContext);
};
