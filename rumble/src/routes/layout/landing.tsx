/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import logo from "../../assets/logo_royal.png";
import { Bar } from "../../components/bar";
import { css } from "@emotion/react";

export function Landing() {
  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      <Bar />
      <Container
        maxWidth="sm"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <img
          src={logo}
          className="logo react"
          alt="React logo"
          css={css`
            width: 100%;
          `}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
