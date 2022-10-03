import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateJoinLobby from "./routes/create_join_lobby";
import ErrorPage from "./error-page";
import CssBaseline from "@mui/material/CssBaseline";
import { Landing } from "./routes/layout/landing";
import { App as AppLayout } from "./routes/layout/app";
import { useUserFetcher } from "./hooks/use_user_fetcher";
import { UserContextProvider } from "./contexts/user";
import { JoinLobby } from "./routes/join_lobby";
import { Lobby } from "./routes/lobby";
import { StateContextProvider, useStateContext } from "./contexts/state";
import { useEffect, useState } from "react";
import { CreateLobby } from "./routes/create_lobby";
import { useStates } from "./hooks/use_states";
import { useWebsocket } from "./hooks/use_websocket";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <CreateJoinLobby />,
      },
      {
        path: "lobbies/:lobbyCode/join",
        element: <JoinLobby />,
      },
      {
        path: "lobbies/create",
        element: <CreateLobby />,
      },
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "lobbies/:lobbyCode",
        element: <Lobby />,
      },
    ],
  },
]);

export function App() {
  const {
    user,
    isLoading: isLoadingUser,
    error: errorUser,
    refetch,
  } = useUserFetcher();

  const {
    isLoadingRecord,
    errorRecord,
    setKeyLoading,
    setKeyError,
    isAnyLoading,
  } = useStates({ isLoadingUser, errorUser });

  useWebsocket();

  return (
    <UserContextProvider
      value={{ user, isLoading: isLoadingUser, error: errorUser, refetch }}
    >
      <StateContextProvider
        value={{
          isLoadingRecord,
          setIsLoading: setKeyLoading,
          errorRecord,
          setError: setKeyError,
          isAnyLoading,
        }}
      >
        <CssBaseline />
        <RouterProvider router={router} />
      </StateContextProvider>
    </UserContextProvider>
  );
}
