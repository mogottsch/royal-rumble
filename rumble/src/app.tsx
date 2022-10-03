import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateJoinLobby from "./routes/create_join_lobby";
import CreateUser from "./routes/create_user";
import ShowLobby from "./routes/show_lobby";
import ErrorPage from "./error-page";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { Landing } from "./routes/layout/landing";
import { App as AppLayout } from "./routes/layout/app";
import { useUserFetcher } from "./hooks/use_user_fetcher";
import { UserContextProvider } from "./contexts/user";

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
        path: "lobby/:lobbyId/user",
        element: <CreateUser />,
      },
      {
        path: "lobby/:lobbyId/show",
        element: <ShowLobby />,
      },
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
  },
]);

export function App() {
  const { user, loading, error } = useUserFetcher();

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <UserContextProvider value={{ user, loading, error }} />
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
  );
}
