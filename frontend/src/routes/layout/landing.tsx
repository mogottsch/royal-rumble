import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import logo from "../../assets/logo_neon.png";

export function Landing() {
  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      <div className="scheinwerfer scheinwerfer--center" aria-hidden="true">
        <div className="scheinwerfer__beam" />
      </div>
      <div className="floor-lights" aria-hidden="true">
        <div className="floor-pool floor-pool--center" />
      </div>
      <div className="neon-floor-glow" aria-hidden="true" />
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="titantron">
          <img
            src={logo}
            className="logo logo--neon"
            alt="Suff Royale"
          />
        </div>
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
