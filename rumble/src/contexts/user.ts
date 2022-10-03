import { createContext, useContext } from "react";
import { User } from "../models";

export type UserContextType = {
  user?: User;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

export const UserContext = createContext<UserContextType>({
  isLoading: false,
  error: null,
  refetch: () => {
    console.warn("refetch not implemented");
  },
});

export const UserContextProvider = UserContext.Provider;

export const useUserContext = () => {
  return useContext(UserContext);
};
