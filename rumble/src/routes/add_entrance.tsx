/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useEffect, useState } from "react";
import { InputField } from "../components/form";
import { useNavigate } from "react-router-dom";
import { Lobby, Wrestler } from "../hooks/use_lobby";

export function AddEntrance() {
  const navigate = useNavigate();
  const { lobby } = useLobbyContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [wrestler, setWrestler] = useState<Wrestler | undefined>();

  if (!lobby) return null;

  const searchWrestler = async () => {
    const wrestlers = await getSearchWrestlers(searchTerm);
    if (wrestlers.length === 0) {
      return;
    }
    const firstWrestler = wrestlers[0];
    setWrestler(firstWrestler);
    setSearchTerm(firstWrestler.name);
  };

  const addEntrance = async () => {
    if (wrestler === undefined) return;
    await postEntrance(lobby.code, wrestler.id);
    console.log("added entrance");
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <>
      <Box
        sx={{
          height: "100%",
        }}
      >
        <InputField
          label="Wrestler name"
          htmlFor="wrestler-name"
          id="wrestlerName"
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
        />
        <Button
          variant="outlined"
          css={css`
            width: 100%;
            height: 50px;
          `}
          sx={{ mt: 5 }}
          size="large"
          onClick={searchWrestler}
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
            width: 100%;
          `}
          sx={{ mt: 5 }}
          size="large"
          onClick={addEntrance}
          disabled={wrestler === undefined}
        >
          ADD ENTRANCE
        </Button>
        <Button
          variant="outlined"
          css={css`
            width: 100%;
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

async function getSearchWrestlers(wrestlerName: string): Promise<Wrestler[]> {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const url = new URL("api/wrestlers/search", BACKEND_URL);

  const queryParams = new URLSearchParams();
  queryParams.append("search", wrestlerName);
  url.search = queryParams.toString();

  console.log(url.toString());
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get search wrestlers: ${response.statusText}`);
  }
  const data = await response.json();
  return data.data;
}

async function postEntrance(lobbyCode: string, wrestlerId: number) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const body = JSON.stringify({ wrestler_id: wrestlerId });
  const url = new URL(`api/lobbies/${lobbyCode}/entrance`, BACKEND_URL);
  const response = await fetch(url.toString(), {
    method: "POST",
    body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to post entrance: ${response.statusText}`);
  }
}
