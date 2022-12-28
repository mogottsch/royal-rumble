import { createContext, useContext } from "react";

export type StateContextType = {
  isLoadingRecord: Record<string, boolean>;
  setIsLoading: (key: string, value: boolean) => void;
  errorRecord: Record<string, Error>;
  setError: (key: string, value: Error) => void;
  isAnyLoading: boolean;
};

export const LoadingAndErrorStateContext = createContext<StateContextType>({
  isLoadingRecord: {},
  setIsLoading: () => {},
  errorRecord: {},
  setError: () => {},
  isAnyLoading: false,
});

export const LoadingAndErrorStateContextProvider = LoadingAndErrorStateContext.Provider;

export const useLoadingAndErrorStateContext = () => {
  return useContext(LoadingAndErrorStateContext);
};
