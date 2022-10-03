import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function AppContainer() {
  const queryClient = new QueryClient();

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <CssBaseline />
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
