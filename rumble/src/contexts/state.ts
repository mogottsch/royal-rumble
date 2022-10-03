import { createContext, useContext } from "react";

export type StateContextType = {
  isLoadingRecord: Record<string, boolean>;
  setIsLoading: (key: string, value: boolean) => void;
  errorRecord: Record<string, Error>;
  setError: (key: string, value: Error) => void;
  isAnyLoading: boolean;
};

export const StateContext = createContext<StateContextType>({
  isLoadingRecord: {},
  setIsLoading: () => {},
  errorRecord: {},
  setError: () => {},
  isAnyLoading: false,
});

export const StateContextProvider = StateContext.Provider;

export const useStateContext = () => {
  return useContext(StateContext);
};
