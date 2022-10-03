/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import { Box, InputLabel } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      <FormControl
        css={css`
          width: 100%;
        `}
      >
        <InputLabel htmlFor="lobby-code">LOBBY CODE</InputLabel>
        <Input
          id="lobby-code"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value)}
        />
      </FormControl>
      <Button
        variant="outlined"
        css={css`
          width: 100%;
        `}
        sx={{ mt: 2 }}
        size="large"
        href={`/lobby/${lobbyCode}`}
      >
        JOIN
      </Button>
      <Button
        variant="outlined"
        css={css`
          width: 100%;
        `}
        sx={{ mt: 5 }}
        size="large"
      >
        CREATE
      </Button>
    </Box>
  );
}
