/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import { Box, InputLabel } from "@mui/material";
import { css } from "@emotion/react";
import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export function EnterName({ onSubmit }: Props) {
  const [name, setName] = useState("");
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
        <InputLabel htmlFor="name">NAME</InputLabel>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <Button
        variant="outlined"
        css={css`
          width: 100%;
        `}
        size="large"
        onClick={() => onSubmit(name)}
        sx={{ mt: 2 }}
      >
        OK
      </Button>
    </Box>
  );
}
