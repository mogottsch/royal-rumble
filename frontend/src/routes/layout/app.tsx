import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Bar } from "../../components/bar";
import { PendingDistributionPrompt } from "../../components/pending_distribution_prompt";
import { Outlet } from "react-router-dom";

export function App({
  maxWidth = "sm",
  showPendingPrompt = true,
}: {
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
  showPendingPrompt?: boolean;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
      }}
    >
      <Bar />
      {showPendingPrompt ? <PendingDistributionPrompt /> : null}
      <Container
        maxWidth={maxWidth}
        sx={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          pb: 2,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
