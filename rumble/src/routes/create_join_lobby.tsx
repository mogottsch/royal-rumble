/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import { Box, InputLabel } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";
import { InputField } from "../components/form";
import { PrimaryButton } from "../components/buttons";

export default function CreateJoinLobby() {
  const [lobbyCode, setLobbyCode] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <InputField
        label="Lobby code"
        htmlFor="lobby-code"
        id="lobby-code"
        value={lobbyCode}
        onChange={setLobbyCode}
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
