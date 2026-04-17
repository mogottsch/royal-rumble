import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import logo from "../../assets/logo_neon.png";

const BEAM_X = [18, 50, 82] as const;
const FLOOR_Y = 87;
const SWEEP_MIN = 43;
const SWEEP_MAX = 57;
const SWEEP_DURATION_MS = 9000;

export function Landing() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [targetX, setTargetX] = useState(50);

  useEffect(() => {
    const updateViewport = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = (now - start) / SWEEP_DURATION_MS;
      const wave = (Math.sin(progress * Math.PI * 2) + 1) / 2;
      setTargetX(SWEEP_MIN + (SWEEP_MAX - SWEEP_MIN) * wave);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const stageWidth = viewport.width || 100;
  const stageHeight = viewport.height || 100;
  const targetXPx = (targetX / 100) * stageWidth;
  const targetYPx = (FLOOR_Y / 100) * stageHeight;
  const topY = -0.12 * stageHeight;
  const topHalfWidth = stageWidth * 0.065;
  const bottomHalfWidth = Math.max(stageWidth * 0.028, 28);

  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      <svg
        className="spotlight-stage"
        viewBox={`0 0 ${stageWidth} ${stageHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spotlight-beam-gradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="rgba(255,245,215,0.44)" />
             <stop offset="48%" stopColor="rgba(255,230,185,0.2)" />
             <stop offset="100%" stopColor="rgba(255,215,160,0.04)" />
           </linearGradient>
           <radialGradient id="spotlight-pool-gradient" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="rgba(255,248,225,1)" />
             <stop offset="22%" stopColor="rgba(255,236,198,0.92)" />
             <stop offset="48%" stopColor="rgba(255,220,170,0.38)" />
             <stop offset="100%" stopColor="rgba(255,215,160,0)" />
           </radialGradient>
           <radialGradient id="spotlight-core-gradient" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="rgba(255,255,245,1)" />
             <stop offset="100%" stopColor="rgba(255,245,215,0)" />
           </radialGradient>
           <filter id="spotlight-blur" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="8" />
           </filter>
           <filter id="spotlight-pool-blur" x="-30%" y="-30%" width="160%" height="160%">
             <feGaussianBlur stdDeviation="12" />
           </filter>
         </defs>
        {BEAM_X.map((beamX, index) => {
          const anchorX = (beamX / 100) * stageWidth;
          const points = [
            `${anchorX - topHalfWidth},${topY}`,
            `${anchorX + topHalfWidth},${topY}`,
            `${targetXPx + bottomHalfWidth},${targetYPx}`,
            `${targetXPx - bottomHalfWidth},${targetYPx}`,
          ].join(" ");

          return (
            <polygon
              key={index}
              className="spotlight-beam"
              points={points}
              fill="url(#spotlight-beam-gradient)"
              filter="url(#spotlight-blur)"
            />
          );
        })}
        <ellipse
          className="spotlight-pool"
          cx={targetXPx}
          cy={targetYPx}
          rx={stageWidth * 0.12}
          ry={stageHeight * 0.04}
          fill="url(#spotlight-pool-gradient)"
          filter="url(#spotlight-pool-blur)"
        />
        <ellipse
          className="spotlight-core"
          cx={targetXPx}
          cy={targetYPx}
          rx={stageWidth * 0.052}
          ry={stageHeight * 0.018}
          fill="url(#spotlight-core-gradient)"
          filter="url(#spotlight-pool-blur)"
        />
      </svg>
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
