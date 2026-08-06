import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { App } from "./app";
import { I18nProvider } from "./i18n";
import theme from "./theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1_000 } },
});

export function AppContainer() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <App />
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
