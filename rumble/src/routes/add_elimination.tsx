/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Box, Button, Divider, Grid } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../contexts/lobby_context";
import { Rumbler } from "../hooks/use_lobby";

export function AddElimination() {
  const { lobby } = useLobbyContext();
  const navigate = useNavigate();
  const [victims, setVictims] = useState<Rumbler[]>([]);
  const [offenders, setOffenders] = useState<Rumbler[]>([]);

  if (!lobby) return null;

  const rumblers = lobby.rumblers || [];
  const activeRumblers = rumblers.filter((rumbler) => !rumbler.is_eliminated);

  const toggleVictim = (rumbler: Rumbler) => {
    if (victims.includes(rumbler)) {
      setVictims(victims.filter((victim: Rumbler) => victim.id !== rumbler.id));
    } else {
      setVictims([...victims, rumbler]);
    }
  };

  const toggleOffender = (rumbler: Rumbler) => {
    if (offenders.includes(rumbler)) {
      setOffenders(offenders.filter((offender) => offender.id !== rumbler.id));
    } else {
      setOffenders([...offenders, rumbler]);
    }
  };

  const addElimination = async () => {
    if (victims.length === 0 || offenders.length === 0) return;
    await postElimination(lobby.code, offenders, victims);
    navigate(`/lobbies/${lobby.code}/view-game`);
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
      <h2>ELIMINATION</h2>
      <Divider>WHO IS/ARE THE ELIMINATOR(S)?</Divider>
      <Grid container spacing={2} gridTemplateRows="repeat(3, 1fr)">
        {activeRumblers.map((rumbler) => (
          <Grid
            key={rumbler.id}
            item
            xs={6}
            sm={3}
            onClick={() => toggleOffender(rumbler)}
          >
            <Button
              variant="outlined"
              color={offenders.includes(rumbler) ? "secondary" : "primary"}
            >
              {rumbler.wrestler.name}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Divider>WHO IS/ARE THE VICTIM(S)?</Divider>
      <Grid container spacing={2}>
        {activeRumblers.map((rumbler) => (
          <Grid
            key={rumbler.id}
            item
            xs={6}
            sm={3}
            onClick={() => toggleVictim(rumbler)}
          >
            <Button
              variant="outlined"
              color={victims.includes(rumbler) ? "secondary" : "primary"}
            >
              {rumbler.wrestler.name}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        css={css`
          width: 100%;
        `}
        sx={{ mt: 5 }}
        size="large"
        onClick={addElimination}
        disabled={victims.length === 0 || offenders.length === 0}
      >
        ADD ELIMINATION
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
  );
}

async function postElimination(
  lobbyCode: string,
  offenders: Rumbler[],
  victims: Rumbler[]
) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const body = JSON.stringify({
    victim_ids: victims.map((rumbler) => rumbler.id),
    offender_ids: offenders.map((rumbler) => rumbler.id),
  });
  const url = new URL(`api/lobbies/${lobbyCode}/elimination`, BACKEND_URL);
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
