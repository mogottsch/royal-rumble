import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";
import { InputField } from "../components/form";
import { PrimaryButton } from "../components/buttons";

export default function CreateJoinLobby() {
  const [lobbyCode, setLobbyCode] = useState("");

  const updateLobbyCode = (value: string) => {
    setLobbyCode(value.toUpperCase());
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
      <div className="est-year" aria-label="Established 2027">
        <span className="est-year__label">Est.</span>
        <span className="est-year__number">2027</span>
      </div>

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
