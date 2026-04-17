import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Bar } from "../../components/bar";
import { PendingDistributionPrompt } from "../../components/pending_distribution_prompt";
import { Outlet } from "react-router-dom";

export function App() {
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
      <PendingDistributionPrompt />
      <Container
        maxWidth="sm"
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
