import { createContext, useContext } from "react";
import { Lobby } from "../hooks/use_lobby";

export type StateContextType = {
  lobby?: Lobby;
};

export const LobbyContext = createContext<StateContextType>({
  lobby: undefined,
});

export const LobbyContextProvider = LobbyContext.Provider;

export const useLobbyContext = () => {
  return useContext(LobbyContext);
};
