import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { InputField } from "../components/form";
import { PrimaryButton } from "../components/buttons";
import { Fireworks, type FireworksHandlers } from "@fireworks-js/react";

export default function CreateJoinLobby() {
  const [lobbyCode, setLobbyCode] = useState("");

  const updateLobbyCode = (value: string) => {
    setLobbyCode(value.toUpperCase());
  };

  const ref = useRef<FireworksHandlers>(null);

  const toggle = () => {
    if (!ref.current) return;
    if (ref.current.isRunning) {
      ref.current.stop();
    } else {
      ref.current.start();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <h1 className="year">{new Date().getFullYear()}</h1>
      <Fireworks
        ref={ref}
        options={{ mouse: { click: true, max: 5 }, intensity: 25 }}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          position: "fixed",
          // background: "#000",
        }}
      />
      <InputField
        label="Lobby code"
        htmlFor="lobby-code"
        id="lobby-code"
        value={lobbyCode}
        onChange={updateLobbyCode}
      />
      <PrimaryButton
        sx={{ mt: 2 }}
        href={`/lobbies/${lobbyCode}`}
        css={css`
          width: 100%;
        `}
      >
        JOIN
      </PrimaryButton>
      <PrimaryButton
        css={css`
          width: 100%;
        `}
        sx={{ mt: 5 }}
        href="/lobbies/create"
      >
        CREATE
      </PrimaryButton>
    </Box>
  );
}
