/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import { Box, InputLabel } from "@mui/material";
import { css } from "@emotion/react";

export default function CreateJoinLobby() {
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
        <Input id="lobby-code" />
      </FormControl>
      <Button
        variant="outlined"
        css={css`
          width: 100%;
        `}
        sx={{ mt: 2 }}
        size="large"
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
