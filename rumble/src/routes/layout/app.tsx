/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Bar } from "../../components/bar";
import { Outlet } from "react-router-dom";

export function App() {
  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      <Bar />
      <Container
        maxWidth="sm"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
