import Button from "@mui/material/Button";
import { Autocomplete, Box, TextField } from "@mui/material";
import { css } from "@emotion/react";
import { useLobbyContext } from "../contexts/lobby_context";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrestler } from "../hooks/use_lobby";
import { useWrestlers } from "../hooks/use_wrestlers";
import { useNotificationContext } from "../contexts/notification_context";

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
  const { notify } = useNotificationContext();

  if (!lobby) return <div>loading...</div>;

  const addEntrance = async () => {
    if (selectedWrestler === null) {
      notify("Please select a wrestler", "error");
      return;
    }

    try {
      await postEntrance(lobby.code, selectedWrestler.id);
    } catch (e) {
      const error = e as Error;
      notify(error.message, "error");
      return;
    }
    navigate(`/lobbies/${lobby.code}/view-game`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ mt: 2 }}>
        <Autocomplete
          disablePortal
          id="wrestler-search"
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
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            css={css`
              width: 100%;
            `}
            size="large"
            onClick={addEntrance}
            disabled={selectedWrestler === null}
          >
            ADD ENTRANCE
          </Button>
          <Button
            variant="outlined"
            css={css`
              width: 100%;
            `}
            sx={{ mt: 2 }}
            size="large"
            href={`/lobbies/${lobby.code}/view-game`}
          >
            BACK
          </Button>
        </Box>
      </Box>
    </Box>
  );
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
    const error = await response.json();
    const message = error.message || response.statusText;
    throw new Error(message);
  }
}
