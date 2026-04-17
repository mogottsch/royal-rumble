import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";
import { InputField } from "../components/form";
import { PrimaryButton } from "../components/buttons";

export default function CreateJoinLobby() {
  const establishedYear = 2022;
  const currentYear = new Date().getFullYear();
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
      <div
        className="edition-year"
        aria-label={`${currentYear} edition, established ${establishedYear}`}
      >
        <div className="edition-year__headline">
          <span className="edition-year__number">{currentYear}</span>
          <span className="edition-year__word">Edition</span>
        </div>
        <div className="edition-year__est">Est. {establishedYear}</div>
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
