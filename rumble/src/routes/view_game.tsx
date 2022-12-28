/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";

export function ViewGame() {
  const { lobby } = useLobbyContext();

  if (!lobby) return null;

  return <>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {lobby.participants.map((participant, i) => {
          return (
            <>
              <Box
                sx={{
                  width: "50%",
                  justifyContent: "center",
                }}
              >
                {participant.name}
              </Box>
              <Box
                sx={{
                  width: "50%",
                  justifyContent: "center",
                }}
              >
                {participant.name} // participant.wrestler.name
              </Box>
            </>
          )})}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          css={css`
            width: 50%;
          `}
          sx={{ mt: 5 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-entrance`}
        >
          ADD ENTRANCE
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 50%;
          `}
          sx={{ mt: 5 }}
          size="large"
          href={`/lobbies/${lobby.code}/add-elimination`}
        >
          ADD ELIMINATATION
        </Button>
      </Box>
    </>
}