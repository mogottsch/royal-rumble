import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Bar } from "../../components/bar";
import { Outlet } from "react-router-dom";

export function App() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <Bar />
      <Container maxWidth="sm" sx={{ overflow: "hidden" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
