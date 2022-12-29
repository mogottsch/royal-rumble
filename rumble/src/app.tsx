import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateJoinLobby from "./routes/create_join_lobby";
import ErrorPage from "./error_page";
import CssBaseline from "@mui/material/CssBaseline";
import { Landing } from "./routes/layout/landing";
import { App as AppLayout } from "./routes/layout/app";
import { useLoadingAndErrorStates } from "./hooks/use_loading_and_error_states";
// contexts
import { LoadingAndErrorStateContextProvider } from "./contexts/loading_and_error_states";

// routes
import { CreateLobby } from "./routes/create_lobby";
import { AssignEntranceNumbers } from "./routes/assign_entrance_numbers";
import { ViewGame } from "./routes/view_game";
import { AddEntrance } from "./routes/add_entrance";
import { AddElimination } from "./routes/add_elimination";
import { LobbyLayout } from "./routes/layout/lobby";
import { useEcho } from "./hooks/use_echo";
import { EchoContextProvider } from "./contexts/echo_context";

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
      // {
      //   path: "lobbies/:lobbyCode/join",
      //   element: <JoinLobby />,
      // },
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "lobbies/create",
        element: <CreateLobby />,
      },
    ],
  },
  {
    path: "/lobbies/:lobbyCode",
    element: <LobbyLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "assign-entrance-numbers",
        element: <AssignEntranceNumbers />,
      },
      {
        path: "view-game",
        element: <ViewGame />,
      },
      {
        path: "add-entrance",
        element: <AddEntrance />,
      },
      {
        path: "add-elimination",
        element: <AddElimination />,
      },
    ],
  },
]);

export function App() {
  const {
    isLoadingRecord,
    errorRecord,
    setKeyLoading,
    setKeyError,
    isAnyLoading,
  } = useLoadingAndErrorStates();

  const echo = useEcho();

  return (
    <LoadingAndErrorStateContextProvider
      value={{
        isLoadingRecord,
        setIsLoading: setKeyLoading,
        errorRecord,
        setError: setKeyError,
        isAnyLoading,
      }}
    >
      <EchoContextProvider value={{ echo }}>
        <CssBaseline />
        <RouterProvider router={router} />
      </EchoContextProvider>
    </LoadingAndErrorStateContextProvider>
  );
}
