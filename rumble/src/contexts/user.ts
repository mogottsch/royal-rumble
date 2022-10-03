import { createContext } from "react";
import { User } from "../models";

export type UserContextType = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
});

export const UserContextProvider = UserContext.Provider;
