import { createContext, useContext } from "react";
import { NotificationData } from "../hooks/use_notifications";

export type StateContextType = {
  notify: NotificationData["notify"];
};

export const NotificationContext = createContext<StateContextType>({
  notify: () => {},
});

export const NotificationContextProvider = NotificationContext.Provider;

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};
