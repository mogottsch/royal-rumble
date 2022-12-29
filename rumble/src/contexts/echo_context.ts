import Echo from "laravel-echo";
import { createContext, useContext } from "react";

export type StateContextType = {
  echo?: Echo;
};

export const EchoContext = createContext<StateContextType>({
  echo: undefined,
});

export const EchoContextProvider = EchoContext.Provider;

export const useEchoContext = () => {
  return useContext(EchoContext);
};
