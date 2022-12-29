/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { InputField } from "../components/form";
import { useNavigate } from "react-router-dom";

export function AddEntrance() {
  const navigate = useNavigate();
  const { lobby } = useLobbyContext();

  if (!lobby) return null;

  const addEntrance = async () => {
    // if (participantEntranceNumber === undefined || !allAssigned) {
    //   console.error("Not all participants have been assigned entrance numbers");
    //   alert("Not all participants have been assigned entrance numbers");
    //   return;
    // }
    // const updatedLobby = await putEntranceNumbers(
    //   lobby.code,
    //   participantEntranceNumber
    // );
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <InputField label="Lobby code" htmlFor="lobby-code" id="wrestlerName" />
        <Button
          variant="outlined"
          css={css`
            width: 50%;
          `}
          sx={{ mt: 5 }}
          size="large"
          onClick={addEntrance}
        >
          FIND
        </Button>
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
          onClick={addEntrance}
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
          href={`/lobbies/${lobby.code}/view-game`}
        >
          BACK
        </Button>
      </Box>
    </>
  );
}
