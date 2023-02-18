/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import Button from "@mui/material/Button";
import { Autocomplete, Box, TextField } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrestler } from "../hooks/use_lobby";
import { useWrestlers } from "../hooks/use_wrestlers";

export function AddEntrance() {
  const navigate = useNavigate();
  const { lobby } = useLobbyContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWrestler, setSelectedWrestler] = useState<Wrestler | null>(
    null
  );
  const { wrestlers: searchedWrestlers, isLoading } = useWrestlers({
    searchTerm,
  });

  if (!lobby) return <div>loading...</div>;

  const addEntrance = async () => {
    if (selectedWrestler === null) return;
    await postEntrance(lobby.code, selectedWrestler.id);
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <>
      <Box
        sx={{
          height: "100%",
        }}
      >
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={searchedWrestlers}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(options) => options}
          inputValue={searchTerm}
          onInputChange={(_, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          value={selectedWrestler}
          onChange={(_, newValue) => {
            if (newValue === null) {
              setSelectedWrestler(null);
              return;
            }

            setSelectedWrestler(newValue);
          }}
          loading={isLoading}
          renderInput={(params) => <TextField {...params} label="Wrestler" />}
          noOptionsText={
            searchTerm === "" ? "Search for a wrestler" : "No results"
          }
        />
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
          disabled={selectedWrestler === undefined}
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
